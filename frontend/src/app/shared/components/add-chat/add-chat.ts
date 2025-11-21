import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../../core/services/user.service';
import { UserDashBoardDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-new-chat-dialog',
  standalone: true, 
  imports: [CommonModule, MatDialogModule, MatIconModule, FormsModule],
  templateUrl: './add-chat.html', 
})
export class NewChatDialogComponent implements OnInit { 

  private userService = inject(UserService);
  private dialogRef = inject(MatDialogRef<NewChatDialogComponent>);

  users = signal<UserDashBoardDto[]>([]);
  searchQuery = signal('');
  
  currentUserId = '';

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.users().filter(u => 
      u.firstName.toLowerCase().includes(query) || 
      u.lastName.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  });

  ngOnInit() {
    this.loadCurrentUser();
    this.loadUsers();
  }

  loadCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserId = user.id || user.userId || user.Id || '';
      } catch (e) { }
    }

    if (!this.currentUserId) {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = this.parseJwt(token);
        this.currentUserId = decoded['nameid'] || 
                             decoded['sub'] || 
                             decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
                             decoded['Id'] || 
                             '';
      }
    }
    console.log('👤 My ID for filtering:', this.currentUserId);
  }

  private parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return {};
    }
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        // ✅ กรองคนที่มี ID ตรงกับเราออกไป (จะไม่เห็นตัวเองในลิสต์)
        const otherUsers = data.filter(u => u.id !== this.currentUserId);
        this.users.set(otherUsers);
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  onSearch(event: any) {
    this.searchQuery.set(event.target.value);
  }

  selectUser(user: UserDashBoardDto) {
    this.dialogRef.close(user);
  }

  close() {
    this.dialogRef.close();
  }
}