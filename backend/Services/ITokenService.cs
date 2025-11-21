using Backend_UserManage.Models;

namespace Backend_UserManage.Services
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}