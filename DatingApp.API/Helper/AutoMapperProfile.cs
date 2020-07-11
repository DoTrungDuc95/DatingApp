using System.Linq;
using AutoMapper;
using DatingApp.API.Dtos;
using DatingApp.API.Models;

namespace DatingApp.API.Helper
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<User, UserForListDto>()
            .ForMember(d => d.PhotoUrl, o => o.MapFrom
            (s => s.Photos.FirstOrDefault(p => p.IsMain).Url))
            .ForMember(d => d.Age, o => o.MapFrom
            (s => s.DateOfBirth.CaculateAge()));

            CreateMap<User, UserForDetailDto>()
            .ForMember(d => d.PhotoUrl, o => o.MapFrom
            (s => s.Photos.FirstOrDefault(p => p.IsMain).Url))
            .ForMember(d => d.Age, o => o.MapFrom
            (s => s.DateOfBirth.CaculateAge()));

            CreateMap<Photo, PhotoForDetailDto>();
            CreateMap<Photo, PhotoForReturnDto>();
            CreateMap<Message, MessageToReturnDto>()
                .ForMember(
                    m => m.SenderPhotoUrl,
                    o => o.MapFrom(u => u.Sender.Photos.FirstOrDefault(p => p.IsMain).Url)
                )
                .ForMember
                    (m => m.RecipientPhotoUrl,
                    o => o.MapFrom(u => u.Recipient.Photos.FirstOrDefault(p => p.IsMain).Url)
                );

            CreateMap<UserForUpdateDto, User>();
            CreateMap<UserForRegisterDto, User>();
            CreateMap<PhotosForCreationDto, Photo>();
            CreateMap<MessageForCreationDto, Message>().ReverseMap();
        }
    }
}