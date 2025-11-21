using AutoMapper;
using Backend_UserManage.Models;
using Backend_UserManage.Models.Dtos;

namespace Backend_UserManage.Mapper
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<User, UserDashBoardDto>()
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role != null ? src.Role.RoleName : string.Empty))
                .ForMember(dest => dest.Permissions, opt => opt.MapFrom(src => src.Permissions));

            CreateMap<User, GetUserDto>()
                 .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role != null ? src.Role.RoleName : string.Empty))
                 .ForMember(dest => dest.Permissions, opt => opt.MapFrom(src => src.Permissions));

            CreateMap<RegisterUserDto, User>()
                .ForMember(dest => dest.RoleId, opt => opt.MapFrom(src => src.RoleId))
                .ForMember(dest => dest.Permissions, opt => opt.Ignore());

            CreateMap<Role, RoleDto>();

            CreateMap<Permission, PermissionDto>();

            CreateMap<UserPermission, PermissionDto>()
                .ForMember(dest => dest.PermissionName, opt => opt.MapFrom(src => src.Permission != null ? src.Permission.PermissionName : string.Empty));

            CreateMap<Objective, GetObjectiveDto>();
            CreateMap<AddObjectiveDto, Objective>();

            CreateMap<Document, GetDocumentDto>();
            CreateMap<AddDocumentDto, Document>();

            CreateMap<Message, GetMessageDto>();
            CreateMap<SendMessageDto, Message>();

            CreateMap<User, GetEmployeeNodeDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}".Trim()))
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Role != null ? src.Role.RoleName : "Staff"))
                .ForMember(dest => dest.ManagerId, opt => opt.MapFrom(src => src.ManagerId))
                .ForMember(dest => dest.Reports, opt => opt.Ignore());
        }
    }
}