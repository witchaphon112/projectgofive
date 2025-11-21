namespace Backend_UserManage.Models.Dtos
{
    public class GetEmployeeNodeDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Title { get; set; }
        public string? ManagerId { get; set; }

        public List<GetEmployeeNodeDto> Reports { get; set; } = new List<GetEmployeeNodeDto>();
    }
}