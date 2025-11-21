import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserDashBoardDto } from '../models/user.model';
import { Register } from '../models/register.model';
import { Login } from '../../features/auth/login/login';
import { DataTableRequest, DataTableResponse } from '../models/datatable.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5001/api/Users'; 

  getUsers(): Observable<UserDashBoardDto[]> {
    return this.http.get<UserDashBoardDto[]>(`${this.apiUrl}/dashboard`).pipe(
      map(users => users.map(user => ({
        ...user,
        role: user.role ?? user.roleName
      })))
    );
  }

  createUser(userData: Register): Observable<any> {
    return this.http.post(`${this.apiUrl}`, userData);
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  login(credentials: Login): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  getCurrentUser(): Observable<any> {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('No user logged in');
    }
    const user = JSON.parse(userStr);
    return this.http.get<any>(`${this.apiUrl}/${user.id}`);
  }

  getUsersDataTable(params: DataTableRequest): Observable<DataTableResponse> {
    return this.http.post<DataTableResponse>(`${this.apiUrl}/DataTable`, params).pipe(
      map(response => ({
        ...response,
        dataSource: response.dataSource.map(user => ({
          ...user,
          role: user.role ?? user.roleName
        }))
      }))
    );
  }
}