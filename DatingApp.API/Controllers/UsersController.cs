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
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IDatingRepository datingRepository;
        private readonly IMapper mapper;
        public UsersController(IDatingRepository datingRepository, IMapper mapper)
        {
            this.mapper = mapper;
            this.datingRepository = datingRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] UserParams userParams)
        {
            var currentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var userFromRepo = await datingRepository.GetUser(currentId);

            userParams.UserId = currentId;
            if (string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender = "all";
            }

            var users = await datingRepository.GetUsers(userParams);

            var userToReturn = mapper.Map<IEnumerable<UserForListDto>>(users);

            Response.AddPagination(users.CurrentPage, users.PageSize,
                 users.TotalCount, users.TotalPages);

            return Ok(userToReturn);
        }

        [HttpGet("{id}", Name = "GetUser")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await datingRepository.GetUser(id);

            if (user == null)
                return NotFound();

            var userToReturn = mapper.Map<UserForDetailDto>(user);

            return Ok(userToReturn);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserForUpdateDto userForUpdateDto)
        {
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var user = await datingRepository.GetUser(id);
            mapper.Map(userForUpdateDto, user);

            if (await datingRepository.SaveAll())
                return NoContent();

            throw new Exception("Fail to save data");
        }

        [HttpPost("{id}/like/{recipientId}")]
        public async Task<IActionResult> LikeUser(int id, int recipientId)
        {
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var like = await datingRepository.GetLike(id, recipientId);
            if (like != null)
                return BadRequest("You already like this user");

            if (await datingRepository.GetUser(recipientId) == null)
                return NotFound("Can not find this user");

            like = new Like
            {
                LikerId = id,
                LikeeId = recipientId
            };

            datingRepository.Add<Like>(like);
            if (await datingRepository.SaveAll())
                return Ok();

            return BadRequest("Failed to like this user");
        }
    }
}