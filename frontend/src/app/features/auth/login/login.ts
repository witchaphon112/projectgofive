import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../../core/services/user.service';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,         
    ReactiveFormsModule   
  ],
  templateUrl: './login.html', 
})
export class Login { 

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private permissionService = inject(PermissionService);

  isLoading = false;
  errorMessage = '';

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onLogin() {
    this.errorMessage = '';
    if (this.loginForm.valid) {
      this.isLoading = true;
      const credentials = this.loginForm.value;

      this.userService.login(credentials).subscribe({
        next: (response: any) => {
          console.log('Login Success:', response);
          const token = response.token || response.Token;
          if (token) {
            localStorage.setItem('token', token);
          }
          
          const userToSave = {
            id: response.userId || response.UserId,
            firstName: response.firstName || response.FirstName, 
            lastName: response.lastName || response.LastName,
            role: response.roleName || response.RoleName || response.role,
            username: response.username || response.Username,
            permissions: response.permissions || response.Permissions || []
          };

          localStorage.setItem('user', JSON.stringify(userToSave));
          this.permissionService.refreshFromStorage();

          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Login Failed:', err);
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}