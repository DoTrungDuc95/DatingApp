using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Helper;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DatingRepository : IDatingRepository
    {
        private readonly DataContext context;
        public DatingRepository(DataContext context)
        {
            this.context = context;
        }
        public void Add<T>(T entity) where T : class
        {
            context.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            context.Remove(entity);
        }

        public async Task<Like> GetLike(int userId, int recipientId)
        {
            return await context.Likes.
                SingleOrDefaultAsync(l => l.LikerId == userId
                                    && l.LikeeId == recipientId);
        }

        public async Task<Photo> GetMainPhoto(int userId)
        {
            return await context.Photos.Where(p => p.UserId == userId)
                .FirstOrDefaultAsync(p => p.IsMain);
        }

        public async Task<Photo> GetPhoto(int id)
        {
            return await context.Photos.SingleOrDefaultAsync(p => p.Id == id);
        }

        public async Task<User> GetUser(int id)
        {
            return await context.Users.Include(u => u.Photos).SingleOrDefaultAsync(u => u.Id == id);
        }

        public async Task<PageList<User>> GetUsers(UserParams userParams)
        {
            var userQuery = context.Users.Include(u => u.Photos)
                .AsQueryable();

            userQuery = userQuery.Where(u => u.Id != userParams.UserId);

            userQuery = userQuery.Where(u => u.Gender == userParams.Gender || userParams.Gender == "all");

            if (userParams.Likers)
            {
                var userLikers = await GetUserLikes(userParams.UserId, userParams.Likers);
                userQuery = userQuery.Where(u => userLikers.Contains(u.Id));
            }

            if (userParams.Likees)
            {
                var userLikees = await GetUserLikes(userParams.UserId, userParams.Likers);
                userQuery = userQuery.Where(u => userLikees.Contains(u.Id));
            }

            if (userParams.MinAge != 0 || userParams.MaxAge != 99)
            {
                var minDob = DateTime.Today.AddYears(-userParams.MaxAge - 1);
                var maxDob = DateTime.Today.AddYears(-userParams.MinAge);

                userQuery = userQuery.Where(u => u.DateOfBirth >= minDob
                    && u.DateOfBirth <= maxDob);
            }

            if (!string.IsNullOrEmpty(userParams.OrderBy))
            {
                switch (userParams.OrderBy)
                {
                    case "created":
                        userQuery = userQuery.OrderByDescending(u => u.Created);
                        break;
                    default:
                        userQuery = userQuery.OrderByDescending(u => u.LastActive);
                        break;
                }
            }

            return await PageList<User>.CreateAsync(userQuery, userParams.PageNumber, userParams.PageSize);
        }

        private async Task<IEnumerable<int>> GetUserLikes(int id, bool likers)
        {
            var user = await context.Users.Include(u => u.Likers).Include(u => u.Likees)
                .SingleOrDefaultAsync(u => u.Id == id);
            if (likers)
            {
                return user.Likers.Where(u => u.LikeeId == id).Select(i => i.LikerId);
            }
            else
            {
                return user.Likees.Where(u => u.LikerId == id).Select(i => i.LikeeId);
            }
        }

        public async Task<bool> SaveAll()
        {
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<Message> GetMessage(int id)
        {
            return await context.Messages.SingleOrDefaultAsync(m => m.Id == id);
        }

        public async Task<PageList<Message>> GetMessagesForUser(MessagesParam messagesParam)
        {
            var messages = context.Messages.Include(m => m.Sender).
                                            ThenInclude(u => u.Photos).
                                            Include(m => m.Recipient).
                                            ThenInclude(u => u.Photos).
                                            AsQueryable();
            switch (messagesParam.MessageContainer)
            {
                case "Inbox":
                    messages = messages.Where(u => u.RecipientId == messagesParam.UserId
                                                && u.RecipientDeleted == false);
                    break;
                case "Outbox":
                    messages = messages.Where(u => u.SenderId == messagesParam.UserId
                                                && u.SenderDeleted == false);
                    break;
                default:
                    messages = messages.Where(u => u.RecipientId == messagesParam.UserId  
                                            && u.RecipientDeleted == false && u.IsRead == false);
                    break;
            }
            messages = messages.OrderByDescending(m => m.MessageSent);
            return await PageList<Message>.CreateAsync(messages, messagesParam.PageNumber, messagesParam.PageSize);
        }

        public async Task<IEnumerable<Message>> GetMessagesThread(int userId, int rId)
        {
            return await context.Messages.Include(m => m.Sender).
                                            ThenInclude(u => u.Photos).
                                            Include(m => m.Recipient).
                                            ThenInclude(u => u.Photos).
            Where(m => m.RecipientId == userId && m.SenderId == rId && m.RecipientDeleted == false||
                    m.RecipientId == rId && m.SenderId == userId && m.SenderDeleted == false).
                                            OrderByDescending(m => m.MessageSent).
                                            ToListAsync();
        }
    }
}