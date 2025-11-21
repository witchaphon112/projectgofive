namespace Backend_UserManage.Models.Dtos
{
    public class PermissionDto
    {
        public string PermissionId { get; set; } = null!;
        public string PermissionName { get; set; } = null!;
        public bool IsReadable { get; set; } = false;
        public bool IsWritable { get; set; } = false;
        public bool IsDeletable { get; set; } = false;
    }
}