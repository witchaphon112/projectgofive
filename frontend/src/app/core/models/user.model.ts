import { Permission } from './permission.model';

export interface UserDashBoardDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string;
  roleName: string;
  role?: string;
  username: string;
  createDate: string;
  status: string;
  permissions: Permission[];
}