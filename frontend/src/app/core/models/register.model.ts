export interface Register {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phone?: string; 
  roleId: string; 
  permissions?: any[]; 
}