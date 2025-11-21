import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Permission } from '../models/permission.model';

export interface PermissionAccess {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5001/api/Permissions';

  private currentPermissions: Permission[] = [];
  private currentUserRole = '';
  private permissionCatalog$ = new BehaviorSubject<Permission[]>([]);

  constructor() {
    this.refreshFromStorage();
  }

  refreshFromStorage(): void {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        this.currentPermissions = [];
        this.currentUserRole = '';
        return;
      }
      const parsed = JSON.parse(userStr);
      this.currentPermissions = Array.isArray(parsed.permissions) ? parsed.permissions : [];
      this.currentUserRole = parsed.roleName || parsed.role || '';
    } catch (error) {
      console.error('Failed to parse user permissions from storage', error);
      this.currentPermissions = [];
      this.currentUserRole = '';
    }
  }


  updatePermissionsFromUserData(userData: any): void {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const currentUser = JSON.parse(userStr);
        const updatedUser = {
          ...currentUser,
          permissions: userData.permissions || userData.Permissions || [],
          roleName: userData.roleName || userData.RoleName || currentUser.roleName,
          role: userData.roleName || userData.RoleName || currentUser.role
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      this.refreshFromStorage();
    } catch (error) {
      console.error('Failed to update permissions from user data', error);
    }
  }

  getAvailablePermissions(): Observable<Permission[]> {
    if (this.permissionCatalog$.value.length > 0) {
      return this.permissionCatalog$.asObservable();
    }
    return this.http.get<Permission[]>(this.apiUrl).pipe(
      tap(perms => this.permissionCatalog$.next(perms))
    );
  }

  canRead(permissionId: string): boolean {
    return this.getPermissionAccess(permissionId).canRead;
  }

  canWrite(permissionId: string): boolean {
    return this.getPermissionAccess(permissionId).canWrite;
  }

  canDelete(permissionId: string): boolean {
    return this.getPermissionAccess(permissionId).canDelete;
  }

  getPermissionAccess(permissionId: string): PermissionAccess {
    const record = this.currentPermissions.find(p => p.permissionId === permissionId);
    
    if (!record) {
      return {
        canRead: false,
        canWrite: false,
        canDelete: false,
      };
    }

    return {
      canRead: !!record.isReadable,
      canWrite: !!record.isWritable,
      canDelete: !!record.isDeletable,
    };
  }
}

