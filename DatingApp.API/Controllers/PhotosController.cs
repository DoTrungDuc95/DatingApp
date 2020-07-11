using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helper;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DatingApp.API.Controllers
{
    [Route("api/users/{userId}/photos")]
    [ApiController]
    [Authorize]
    public class PhotosController : ControllerBase
    {
        private readonly IDatingRepository datingRepository;
        private readonly IMapper mapper;
        private readonly IOptions<CloudinarySettings> cloudinarySettings;
        private Cloudinary cloudinary;

        public PhotosController(IDatingRepository datingRepository,
         IMapper mapper,
         IOptions<CloudinarySettings> cloudinarySettings)
        {
            this.cloudinarySettings = cloudinarySettings;
            this.mapper = mapper;
            this.datingRepository = datingRepository;

            Account account = new Account(
                cloudinarySettings.Value.CloudName,
                 cloudinarySettings.Value.ApiKey,
                  cloudinarySettings.Value.ApiSecret
            );

            cloudinary = new Cloudinary(account);
        }

        [HttpGet("{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id)
        {
            var photo = await datingRepository.GetPhoto(id);

            if (photo == null)
                return NotFound("Can not find th e photo");

            var photoForReturn = mapper.Map<PhotoForReturnDto>(photo);
            return Ok(photoForReturn);
        }

        [HttpPost]
        public async Task<IActionResult> AddPhotosForUser(int userId,
            [FromForm] PhotosForCreationDto photosForCreationDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var user = await datingRepository.GetUser(userId);

            var file = photosForCreationDto.File;

            var uploadResult = new ImageUploadResult();

            if (file.Length > 0)
            {
                using (var stream = file.OpenReadStream())
                {
                    var uploadParam = new ImageUploadParams()
                    {
                        File = new FileDescription(file.Name, stream),
                        Transformation = new Transformation().Width(500)
                            .Height(500).Gravity("face").Crop("fill")
                    };
                    uploadResult = cloudinary.Upload(uploadParam);
                }
            }

            photosForCreationDto.Url = uploadResult.Url.ToString();
            photosForCreationDto.PublicId = uploadResult.PublicId;

            var photo = mapper.Map<Photo>(photosForCreationDto);

            if (!user.Photos.Any(p => p.IsMain))
            {
                photo.IsMain = true;
            }

            user.Photos.Add(photo);

            if (await datingRepository.SaveAll())
            {
                var photoForReturn = mapper.Map<PhotoForDetailDto>(photo);
                return CreatedAtRoute("GetPhoto", new { userId = userId, id = photo.Id }, photoForReturn);
            }

            return BadRequest("Could not add the photo");
        }

        [HttpPost("{id}/setMain")]
        public async Task<IActionResult> SetMainPhoto(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var user = await datingRepository.GetUser(userId);

            if (!user.Photos.Any(p => p.Id == id))
                return Unauthorized();
            var photo = await datingRepository.GetPhoto(id);

            if (photo.IsMain)
                return BadRequest("This is already main photo");

            var currentMainPhoto = await datingRepository.GetMainPhoto(userId);
            currentMainPhoto.IsMain = false;
            photo.IsMain = true;

            if (await datingRepository.SaveAll())
                return NoContent();

            return BadRequest("Could not set photo to main");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var user = await datingRepository.GetUser(userId);

            if (!user.Photos.Any(p => p.Id == id))
                return Unauthorized();
            var photo = await datingRepository.GetPhoto(id);

            if (photo.IsMain)
                return BadRequest("You can not delete main photo");

            if (photo.PublicId != null)
            {
                var deleteParam = new DeletionParams(photo.PublicId);

                var result = cloudinary.Destroy(deleteParam);

                if (result.Result == "ok")
                    datingRepository.Delete(photo);
            }

            if (photo.PublicId == null)
            {
                datingRepository.Delete(photo);
            }

            if (await datingRepository.SaveAll())
                return Ok();

            return BadRequest("Failed to delele this photo");
        }
    }
}