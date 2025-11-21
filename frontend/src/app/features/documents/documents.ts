import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; 

import { AddDocumentsDialog } from '../../shared/components/add-documents-dialog/add-documents-dialog';
import { Document } from '../../core/models/document.model';
import { DocumentService } from '../../core/services/document.service';
import { FormsModule } from '@angular/forms'; 
import { PermissionService } from '../../core/services/permission.service';
import { FEATURE_PERMISSION_MAP } from '../../core/config/feature-permissions';
import { SearchInput } from '../../shared/components/search-input/search-input';
import { SortBy, SortOption } from '../../shared/components/sort-by/sort-by';
import { SavedSearch } from '../../shared/components/saved-search/saved-search';
import { Fillter, FilterState } from '../../shared/components/fillter/fillter';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, MatIconModule, DatePipe, MatDialogModule, MatSnackBarModule, FormsModule, SearchInput, SortBy, SavedSearch, Fillter],
  templateUrl: './documents.html',
})
export class Documents implements OnInit {

  private documentService = inject(DocumentService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private permissionService = inject(PermissionService);

  canCreate = false;
  canEdit = false;
  canDelete = false;

  documents = signal<Document[]>([]);
  
  searchQuery = signal<string>('');
  filterPeriod = signal<string>('all'); 
  filterType = signal<string>('all');   
  sortOrder = signal<string>('newest');
  activeFilters = signal<FilterState>({ roles: [], statuses: [] });

  sortOptions: SortOption[] = [
    { label: 'Date (Newest)', value: 'newest' },
    { label: 'Date (Oldest)', value: 'oldest' },
    { label: 'Title (A-Z)', value: 'a-z' },
  ]; 
  
  selectedIds = signal<Set<number>>(new Set<number>()); 

  filteredDocuments = computed(() => {
    let docs = this.documents();
    const query = this.searchQuery().toLowerCase();
    const period = this.filterPeriod();
    const type = this.filterType();
    const sort = this.sortOrder();

    if (query) {
      docs = docs.filter(doc => 
        doc.title.toLowerCase().includes(query) || 
        (doc.description && doc.description.toLowerCase().includes(query))
      );
    }

    const now = new Date();
    if (period === 'this_month') {
      docs = docs.filter(d => new Date(d.createdDate).getMonth() === now.getMonth() && new Date(d.createdDate).getFullYear() === now.getFullYear());
    } else if (period === 'last_month') {
      const lastMonth = new Date();
      lastMonth.setMonth(now.getMonth() - 1);
      docs = docs.filter(d => new Date(d.createdDate).getMonth() === lastMonth.getMonth());
    }

    if (type === 'document') {
      docs = docs.filter(d => ['doc', 'pdf', 'sheet'].includes(d.type));
    } else if (type === 'image') {
      docs = docs.filter(d => !['doc', 'pdf', 'sheet'].includes(d.type));
    }

    return [...docs].sort((a, b) => {
      const dateA = new Date(a.createdDate).getTime();
      const dateB = new Date(b.createdDate).getTime();
      
      switch (sort) {
        case 'newest': return dateB - dateA;
        case 'oldest': return dateA - dateB;
        case 'a-z': return a.title.localeCompare(b.title);
        default: return 0;
      }
    });
  });

  ngOnInit(): void {
    this.applyPermissions();
    this.loadData();
  }

  private applyPermissions(): void {
    const flags = this.permissionService.getPermissionAccess(FEATURE_PERMISSION_MAP.documents);
    this.canCreate = flags.canWrite;
    this.canEdit = flags.canWrite;
    this.canDelete = flags.canDelete;
  }

  loadData() {
    this.documentService.getDocuments().subscribe({
      next: (data) => this.documents.set(data),
      error: (err) => console.error('Error:', err)
    });
  }

  toggleSelection(id: number) {
    this.selectedIds.update(ids => {
      const newIds = new Set(ids);
      if (newIds.has(id)) newIds.delete(id);
      else newIds.add(id);
      return newIds;
    });
  }

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  onToolbarAction(action: string) {
    switch(action) {
      case 'pdf': 
        this.showToast('📄 Exporting visible documents to PDF...'); 
        break;
      case 'print': 
        window.print(); 
        break;
      case 'delete_selection': 
        this.deleteSelected(); 
        break;
      default: 
        console.log('Action:', action);
    }
  }

  deleteSelected() {
    if (!this.canDelete) {
      this.showToast('You do not have permission to delete documents', 'error');
      return;
    }
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) {
      this.showToast('⚠️ Please select items to delete', 'error');
      return;
    }

    if (confirm(`Are you sure you want to delete ${ids.length} items?`)) {
      let completed = 0;
      ids.forEach(id => {
        this.documentService.deleteDocument(id).subscribe(() => {
          completed++;
          if (completed === ids.length) {
            this.loadData();
            this.selectedIds.set(new Set()); 
            this.showToast('✅ Selected items deleted successfully');
          }
        });
      });
    }
  }

  onSearch(term: string) { 
    this.searchQuery.set(term); 
  }

  onSortChange(value: string) {
    this.sortOrder.set(value);
  }

  onFilterChange(filter: FilterState) {
    this.activeFilters.set(filter);
  }

  onPeriodChange(event: any) { this.filterPeriod.set(event.target.value); }
  onTypeChange(event: any) { this.filterType.set(event.target.value); }

  openAddDocument() {
    if (!this.canCreate) {
      this.showToast('You do not have permission to add documents', 'error');
      return;
    }
    const dialogRef = this.dialog.open(AddDocumentsDialog, {
      width: '600px', maxWidth: '95vw', disableClose: true, panelClass: 'rounded-dialog' 
    });
    dialogRef.afterClosed().subscribe(res => { if (res === 'success') this.loadData(); });
  }

  onEdit(id: number) {
    if (!this.canEdit) {
      this.showToast('You do not have permission to edit documents', 'error');
      return;
    }
    const docToEdit = this.documents().find(d => d.id === id);
    if (docToEdit) {
      const dialogRef = this.dialog.open(AddDocumentsDialog, {
        width: '600px', maxWidth: '95vw', disableClose: true, data: { document: docToEdit }
      });
      dialogRef.afterClosed().subscribe(res => { if (res === 'success') this.loadData(); });
    }
  }

  onDelete(id: number) {
    if (!this.canDelete) {
      this.showToast('You do not have permission to delete documents', 'error');
      return;
    }
    if (confirm('Delete this document?')) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => { this.loadData(); this.showToast('Deleted successfully'); },
        error: (err) => console.error(err)
      });
    }
  }

  private showToast(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Close', {
      duration: 3000, panelClass: type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white',
      horizontalPosition: 'center', verticalPosition: 'bottom'
    });
  }
}