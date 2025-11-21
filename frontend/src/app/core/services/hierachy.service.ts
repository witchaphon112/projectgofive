import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeNode } from '../models/hierarchy.modal';

@Injectable({ providedIn: 'root' })
export class HierarchyService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5001/api/Hierarchy'; 

  getHierarchy(): Observable<EmployeeNode> {
    return this.http.get<EmployeeNode>(this.apiUrl);
  }

  seedData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/seed`, {});
  }
}