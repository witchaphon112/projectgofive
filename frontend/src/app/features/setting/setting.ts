import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface SettingMenu {
  key: 'profile' | 'security';
  title: string;
  icon: string;
}

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, MatSnackBarModule],
  templateUrl: './setting.html',
})
export class Setting implements OnInit {

  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  settingMenus: SettingMenu[] = [
    { key: 'profile', title: 'User Profile', icon: 'account_circle' },
    { key: 'security', title: 'Security (Password)', icon: 'lock' },
  ];

  selectedKey = signal<'profile' | 'security'>('profile');
  currentUser: any = null;

  profileData = signal({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    status: ''
  });

  passwordData = signal({
    newPassword: '',
    confirmPassword: ''
  });

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    let targetUsername = '';

    const storedUserStr = localStorage.getItem('user') || localStorage.getItem('currentUser');
    
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        targetUsername = storedUser.username; 
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }

    if (!targetUsername) {
      targetUsername = localStorage.getItem('username') || '';
    }

    console.log('Looking for user with username:', targetUsername);

    this.userService.getUsers().subscribe({
      next: (users) => {
        let foundUser;

        if (targetUsername) {
          foundUser = users.find((u: any) => u.username === targetUsername);
        } 
        
        if (!foundUser && users.length > 0) {
          console.warn('User not found via username, auto-selecting first user.');
          foundUser = users[0];
        }

        if (foundUser) {
          console.log('Found User:', foundUser);
          this.mapUserToForm(foundUser);
        }
      },
      error: (err) => console.error('API Error:', err)
    });
  }

  mapUserToForm(user: any) {
    this.currentUser = user;
    this.profileData.set({
      id: user.id, 
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role, 
      status: user.status
    });
  }

  selectMenu(key: SettingMenu['key']): void {
    this.selectedKey.set(key);
  }

  saveProfile(): void {
    if (!this.currentUser) return;

    const updatePayload = {
      ...this.currentUser, 
      firstName: this.profileData().firstName,
      lastName: this.profileData().lastName,
    };

    this.userService.updateUser(this.profileData().id, updatePayload).subscribe({
      next: () => {
        this.showToast('Profile updated successfully!');
        this.currentUser = { ...this.currentUser, ...updatePayload };
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error updating profile', 'error');
      }
    });
  }

  savePassword(): void {
    const { newPassword, confirmPassword } = this.passwordData();

    if (!newPassword || !confirmPassword) {
      this.showToast('Please enter password', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.showToast('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      this.showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (!this.currentUser) return;

    const updatePayload = {
      ...this.currentUser,
      password: newPassword 
    };

    this.userService.updateUser(this.profileData().id, updatePayload).subscribe({
      next: () => {
        this.showToast('Password changed successfully!');
        this.passwordData.set({ newPassword: '', confirmPassword: '' });
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error changing password', 'error');
      }
    });
  }

  private showToast(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'error' ? 'bg-red-500' : 'bg-green-500',
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}