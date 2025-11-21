using Backend_UserManage.Models;

namespace Backend_UserManage.Models.Dtos
{
    public class ApiResponse<T>
    {
        public Status Status { get; set; }
        public T Data { get; set; }
    }
}