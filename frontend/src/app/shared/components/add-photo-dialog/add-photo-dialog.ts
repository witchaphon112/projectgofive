import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PhotoService } from '../../../core/services/photo.service';

@Component({
  selector: 'app-add-photo-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './add-photo-dialog.html',
})
export class AddPhotoDialogComponent implements OnInit {
  
  form: FormGroup;
  selectedFile: File | null = null;
  canWrite = false;
  currentUserRole = '';

  constructor(
    private fb: FormBuilder,
    private photoService: PhotoService,
    private dialogRef: MatDialogRef<AddPhotoDialogComponent>
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      file: [null, Validators.required] 
    });
  }

  ngOnInit(): void {
    this.loadCurrentUserRole();
    this.checkUploadPermission();
    
    if (!this.canWrite) {
      alert('You do not have permission to upload photos. Only Admin and Super Admin can upload photos.');
      this.dialogRef.close();
      return;
    }
  }

  loadCurrentUserRole(): void {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.currentUserRole = user.roleName || user.role || '';
      }
    } catch (error) {
      console.error('Error loading user role:', error);
      this.currentUserRole = '';
    }
  }

  checkUploadPermission(): void {
    // อนุญาตเฉพาะ Admin และ Super Admin ขึ้นไป
    const allowedRoles = ['Admin', 'Super Admin'];
    this.canWrite = allowedRoles.includes(this.currentUserRole);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.form.patchValue({ file: file });
    }
  }

  onSave() {
    // เช็ค role อีกครั้งก่อนบันทึก
    this.loadCurrentUserRole();
    this.checkUploadPermission();
    
    if (!this.canWrite) {
      alert('You do not have permission to upload photos. Only Admin and Super Admin can upload photos.');
      return;
    }

    if (this.form.valid && this.selectedFile) {
      const title = this.form.get('title')?.value;
      
      this.photoService.uploadPhoto(title, this.selectedFile).subscribe({
        next: () => this.dialogRef.close('success'),
        error: (err) => alert('Upload failed')
      });
    }
  }
  
  onCancel() { this.dialogRef.close(); }
}