using System;
using Microsoft.AspNetCore.Http;

namespace DatingApp.API.Dtos
{
    public class PhotosForCreationDto
    {
        public string Decription { get; set; }
        public string Url { get; set; }
        public DateTime DateAdded { get; set; }
        public string PublicId { get; set; }
        public IFormFile File { get; set; }

        public PhotosForCreationDto()
        {
            DateAdded = DateTime.Now;
        }
    }
}