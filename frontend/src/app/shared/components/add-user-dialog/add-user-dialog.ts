import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { MatIconModule } from '@angular/material/icon';
import { PermissionService } from '../../../core/services/permission.service';
import { Permission } from '../../../core/models/permission.model';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    ReactiveFormsModule, 
    MatIconModule 
  ],
  templateUrl: './add-user-dialog.html',
})
export class AddUserDialogComponent implements OnInit {
  
  form: FormGroup;
  isEditMode: boolean = false;

  permissionOptions: Permission[] = [];
  roleOptions = [
    { id: '1', label: 'Super Admin' },
    { id: '2', label: 'Admin' },
    { id: '3', label: 'Employee' },
    { id: '4', label: 'HR Admin' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private permissionService: PermissionService,
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      roleId: ['', Validators.required], 
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      status: ['Active'],
      permissions: this.fb.array([]) 
    }, { validators: this.passwordMatchValidator });
  }

  get permissionsArray(): FormArray {
    return this.form.get('permissions') as FormArray;
  }

  ngOnInit(): void {
    if (this.data && this.data.mode === 'edit' && this.data.user) {
      this.isEditMode = true;
    }
    
    this.loadPermissionOptions();
  }

  private loadPermissionOptions(): void {
    this.permissionService.getAvailablePermissions().subscribe({
      next: (perms) => {
        this.permissionOptions = perms;
        this.buildPermissionControls();
        
        if (this.isEditMode && this.data?.user) {
          console.log('Edit mode detected, user data:', this.data.user);

          this.patchUserFields(this.data.user);
        
          setTimeout(() => {
            if (this.data.user.permissions && this.data.user.permissions.length > 0) {
              console.log('Patching user permissions:', this.data.user.permissions);
              this.patchUserPermissions(this.data.user.permissions);
            } else {
              console.log('No permissions found for user, user object:', this.data.user);
            }
          }, 200);
        }
      },
      error: (err) => {
        console.error('Failed to load permission list', err);
        this.permissionOptions = [];
        if (this.isEditMode && this.data?.user) {
          this.patchUserFields(this.data.user);
        }
      }
    });
  }

  private buildPermissionControls(): void {
    this.permissionsArray.clear();
    this.permissionOptions.forEach(perm => {
      const group = this.fb.group({
        permissionId: [perm.permissionId],
        permissionName: [perm.permissionName],
        isReadable: [false],
        isWritable: [false],
        isDeletable: [false]
      });
      this.permissionsArray.push(group);
    });
  }

  private patchUserFields(user: any): void {
    console.log('Patching user fields with:', {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
      username: user.username,
      status: user.status
    });

    this.form.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      roleId: user.roleId || '',
      username: user.username || '',
      status: user.status || 'Active'
    });

    const passControl = this.form.get('password');
    const confirmControl = this.form.get('confirmPassword');

    if (passControl && confirmControl) {
      passControl.clearValidators();
      confirmControl.clearValidators();
      passControl.setValidators([Validators.minLength(6)]);
      confirmControl.setValidators(null);
      passControl.updateValueAndValidity();
      confirmControl.updateValueAndValidity();
    }

    console.log('Form values after patch:', this.form.value);
  }

  patchUserPermissions(userPermissions: any[]) {
    console.log('Patching permissions - Backend Permissions:', userPermissions);
    console.log('Current permissions array length:', this.permissionsArray.length);

    if (!userPermissions || userPermissions.length === 0) {
      console.log('No permissions to patch');
      return;
    }

    if (this.permissionsArray.length === 0) {
      console.warn('Permissions array is empty, cannot patch permissions');
      return;
    }

    this.permissionsArray.controls.forEach((control, index) => {
      const group = control as FormGroup;
      const pId = String(group.get('permissionId')?.value);
      const permissionName = group.get('permissionName')?.value;

      const match = userPermissions.find((up: any) => String(up.permissionId) === pId);

      if (match) {
        const isTrue = (val: any) => val === true || val === 'True' || val === 'true' || val === 1;

        console.log(`Patching permission ${permissionName} (${pId}):`, {
          isReadable: isTrue(match.isReadable),
          isWritable: isTrue(match.isWritable),
          isDeletable: isTrue(match.isDeletable)
        });

        group.patchValue({
          isReadable: isTrue(match.isReadable),
          isWritable: isTrue(match.isWritable),
          isDeletable: isTrue(match.isDeletable)
        });
      } else {
        console.log(`No match found for permission ${permissionName} (${pId})`);
      }
    });
    
    console.log('Permissions after patch:', this.permissionsArray.value);
  }

passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password && !confirmPassword) {
    return null;
  }

  if (!!password !== !!confirmPassword) {
     return { mismatch: true };
  }

  return password === confirmPassword ? null : { mismatch: true };
}
  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildRequestPayload();
    console.log('Sending payload:', JSON.stringify(payload, null, 2));
      
      if (this.isEditMode) {
        const userId = this.data.user.id;
      this.userService.updateUser(userId, payload).subscribe({
        next: (response) => {
          const currentUserStr = localStorage.getItem('user');
          if (currentUserStr) {
            try {
              const currentUser = JSON.parse(currentUserStr);
              if (currentUser.id === userId) {
                const userData = response.data || response;
                
                this.permissionService.updatePermissionsFromUserData(userData);
                
                const updatedUser = {
                  ...currentUser,
                  permissions: userData.permissions || [],
                  roleName: userData.roleName || currentUser.roleName,
                  role: userData.roleName || currentUser.role
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                window.dispatchEvent(new Event('permissionsUpdated'));
                
                this.dialogRef.close('success');
                return;
              }
            } catch (e) {
              console.error('Failed to parse current user', e);
            }
          }
          this.dialogRef.close('success');
        },
        error: (err) => {
          console.error('Update error full:', err);
          console.error('Error response:', err.error);
          console.error('Error response JSON:', JSON.stringify(err.error, null, 2));
          
          let errorMessage = 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล';
          if (err.error?.errors) {
            const validationErrors = Object.keys(err.error.errors)
              .map(key => `${key}: ${err.error.errors[key].join(', ')}`)
              .join('\n');
            errorMessage = `Validation Errors:\n${validationErrors}`;
            console.error('Validation errors details:', JSON.stringify(err.error.errors, null, 2));
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          alert(`ไม่สามารถอัปเดตข้อมูลได้:\n${errorMessage}`);
        }
        });
      } else {
      this.userService.createUser(payload).subscribe({
          next: () => this.dialogRef.close('success'),
        error: (err) => {
          console.error('Create error:', err);
          const errorMessage = err.error?.message || err.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้';
          alert(errorMessage);
      }
      });
    }
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }

  private buildRequestPayload(): any {
    const rawValue = { ...this.form.value };
    
    const permissions = (rawValue.permissions || [])
      .filter((perm: any) => perm.isReadable || perm.isWritable || perm.isDeletable)
      .map((perm: any) => ({
        permissionId: String(perm.permissionId),
        permissionName: String(perm.permissionName || ''),
        isReadable: !!perm.isReadable,
        isWritable: !!perm.isWritable,
        isDeletable: !!perm.isDeletable
      }));

    const payload: any = {
      firstName: String(rawValue.firstName || '').trim(),
      lastName: String(rawValue.lastName || '').trim(),
      email: String(rawValue.email || '').trim(),
      phone: String(rawValue.phone || '').trim(),
      roleId: String(rawValue.roleId || '').trim(),
      username: String(rawValue.username || '').trim(),
      status: String(rawValue.status || 'Active').trim(),
      permissions: permissions || []
    };

    if (rawValue.password && String(rawValue.password).trim()) {
      payload.password = String(rawValue.password).trim();
    }

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.roleId || !payload.username) {
      console.error('Missing required fields in payload:', payload);
      throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
    }

    return payload;
  }
}