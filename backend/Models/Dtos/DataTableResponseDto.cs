using System.Collections.Generic;

namespace Backend_UserManage.Models.Dtos
{
    public class DataTableResponseDto
    {
        public List<UserDashBoardDto> DataSource { get; set; } = new List<UserDashBoardDto>();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
    }
}

