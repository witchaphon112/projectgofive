import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DocumentService } from '../../../core/services/document.service';

@Component({
  selector: 'app-add-documents-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './add-documents-dialog.html',
})
export class AddDocumentsDialog implements OnInit {
  
  form: FormGroup;
  isEditMode: boolean = false;
  dialogTitle: string = 'Upload New Document';

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private dialogRef: MatDialogRef<AddDocumentsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      type: ['doc', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.document) {
      this.isEditMode = true;
      this.dialogTitle = 'Edit Document';
      this.form.patchValue(this.data.document);
    }
  }

  onSave(): void {
    if (this.form.valid) {
      const formData = this.form.value;
      this.documentService.addDocument(formData).subscribe({
        next: (res) => {
          console.log('Document saved', res);
          this.dialogRef.close('success');
        },
        error: (err) => {
          console.error('Error saving document', err);
          alert('Failed to save document');
        }
      });

    } else {
      this.form.markAllAsTouched();
    }
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
}