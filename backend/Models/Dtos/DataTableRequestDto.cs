namespace Backend_UserManage.Models.Dtos
{
    public class DataTableRequestDto
    {
        public string? OrderBy { get; set; }
        public string? OrderDirection { get; set; }
        public int? PageNumber { get; set; }
        public int? PageSize { get; set; }
        public string? Search { get; set; }
    }
}

