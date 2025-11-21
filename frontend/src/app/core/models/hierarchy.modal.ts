export interface EmployeeNode {
  id: string;
  name: string;
  title: string;
  managerId?: string; 
  reports?: EmployeeNode[];
}