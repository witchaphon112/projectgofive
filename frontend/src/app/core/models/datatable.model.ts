import { UserDashBoardDto } from './user.model';

export interface DataTableRequest {
  orderBy?: string | null;
  orderDirection?: string | null;
  pageNumber?: number | null;
  pageSize?: number | null;
  search?: string | null;
}

export interface DataTableResponse {
  dataSource: UserDashBoardDto[];
  page: number;
  pageSize: number;
  totalCount: number;
}

