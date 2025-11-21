import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Objective } from '../models/objective.model';

@Injectable({
  providedIn: 'root'
})
export class ObjectiveService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5001/api/Objectives'; 

  getObjectives(): Observable<Objective[]> {
    return this.http.get<Objective[]>(this.apiUrl);
  }

  addObjective(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateObjective(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteObjective(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}