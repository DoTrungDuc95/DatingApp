using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helper;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Route("api/users/{userId}/[controller]")]
    [ApiController]
    [Authorize]
    public class MessageController : ControllerBase
    {
        private readonly IDatingRepository datingRepository;
        private readonly IMapper mapper;
        public MessageController(IDatingRepository datingRepository, IMapper mapper)
        {
            this.mapper = mapper;
            this.datingRepository = datingRepository;

        }

        [HttpGet("{id}", Name = "GetMessage")]
        public async Task<IActionResult> GetMessage(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var messageFromRepo = await datingRepository.GetMessage(id);

            if (messageFromRepo == null)
                return NotFound("Can not find this message");

            //var messageToReturn = mapper.Map<MessageToReturnDto>(messageFromRepo);

            return Ok(messageFromRepo);
        }

        [HttpGet("thread/{rId}")]
        public async Task<IActionResult> GetMessageThread(int userId, int rId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var messagesFromRepo = await datingRepository.GetMessagesThread(userId, rId);

            var messagesThread = mapper.Map<IEnumerable<MessageToReturnDto>>(messagesFromRepo);

            return Ok(messagesThread);
        }


        [HttpGet()]
        public async Task<IActionResult> GetMessagesForUser(int userId,
            [FromQuery] MessagesParam messagesParam)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            messagesParam.UserId = userId;

            var messagesFromRepo = await datingRepository.GetMessagesForUser(messagesParam);

            var messages = mapper.Map<IEnumerable<MessageToReturnDto>>(messagesFromRepo);

            Response.AddPagination(messagesParam.PageNumber, messagesParam.PageSize,
                                    messagesFromRepo.TotalCount, messagesFromRepo.TotalPages);

            return Ok(messages);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMessage(int userId,
            MessageForCreationDto messageForCreationDto)
        {
            var s = await datingRepository.GetUser(userId);

            if (s.Id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            messageForCreationDto.SenderId = userId;

            var recipient = await datingRepository.GetUser(messageForCreationDto.RecipientId);
            if (recipient == null)
                return NotFound("Could not find user");
            var message = mapper.Map<Message>(messageForCreationDto);

            datingRepository.Add<Message>(message);

            if (await datingRepository.SaveAll())
            {
                var messageToReturn = mapper.Map<MessageToReturnDto>(message);
                return CreatedAtRoute("GetMessage", new { userId, id = message.Id }, messageToReturn);
            }

            throw new Exception("Fail to save new message");
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> DeleteMessage(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var messageFromRepo = await datingRepository.GetMessage(id);

            if (messageFromRepo.SenderId == userId)
                messageFromRepo.SenderDeleted = true;

            if (messageFromRepo.RecipientId == userId)
                messageFromRepo.RecipientDeleted = true;

            if (messageFromRepo.SenderDeleted && messageFromRepo.RecipientDeleted)
                datingRepository.Delete(messageFromRepo);

            if (await datingRepository.SaveAll())
                return NoContent();

            throw new Exception("Failed to delete message");
        }

        [HttpPost("{id}/read")]
        public async Task<IActionResult> ReadMessage(int userId, int id){
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            
            var message = await datingRepository.GetMessage(id);

            if(message.RecipientId != userId)
                return Unauthorized();

            message.IsRead = true;
            message.DateRead = DateTime.Now;

            await datingRepository.SaveAll();
            return NoContent();
        }
    
    }
}