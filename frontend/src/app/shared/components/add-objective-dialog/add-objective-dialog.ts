import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ObjectiveService } from '../../../core/services/objective.service';

@Component({
  selector: 'app-add-objective-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './add-objective-dialog.html',
})
export class AddObjectiveDialogComponent implements OnInit {
  
  form: FormGroup;
  isEditMode: boolean = false;
  dialogTitle: string = 'Add New Objective';

  constructor(
    private fb: FormBuilder,
    private objectiveService: ObjectiveService,
    private dialogRef: MatDialogRef<AddObjectiveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      owner: ['', Validators.required],
      status: ['Pending', Validators.required],
      startDate: [new Date().toISOString().substring(0, 10), Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.objective) {
      this.isEditMode = true;
      this.dialogTitle = 'Edit Objective';
      this.form.patchValue(this.data.objective);
      
      if (this.data.objective.startDate) {
         this.form.patchValue({startDate: this.formatDate(this.data.objective.startDate)});
      }
      if (this.data.objective.dueDate) {
         this.form.patchValue({dueDate: this.formatDate(this.data.objective.dueDate)});
      }
    }
  }

  private formatDate(dateString: string): string {
    if(!dateString) return '';
    return new Date(dateString).toISOString().substring(0, 10);
  }

  onSave(): void {
    if (this.form.valid) {
      const formData = this.form.value;

      if (this.isEditMode) {

      } else {
        this.objectiveService.addObjective(formData).subscribe({
          next: (res) => {
            console.log('Added successfully', res);
            this.dialogRef.close('success');
          },
          error: (err) => {
            console.error('Error adding objective', err);
            alert('Failed to add objective');
          }
        });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
}