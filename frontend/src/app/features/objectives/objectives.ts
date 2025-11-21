import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AddObjectiveDialogComponent } from '../../shared/components/add-objective-dialog/add-objective-dialog';
import { SortBy, SortOption } from '../../shared/components/sort-by/sort-by'; 
import { Fillter, FilterState } from '../../shared/components/fillter/fillter'; 
import { SavedSearch, SavedSearchItem } from '../../shared/components/saved-search/saved-search';
import { SearchInput } from '../../shared/components/search-input/search-input'; 

import { Objective } from '../../core/models/objective.model';
import { ObjectiveService } from '../../core/services/objective.service';
import { PermissionService } from '../../core/services/permission.service';
import { FEATURE_PERMISSION_MAP } from '../../core/config/feature-permissions';

@Component({
  selector: 'app-objectives',
  standalone: true,
  imports: [CommonModule, MatIconModule, DatePipe, MatDialogModule, SortBy, Fillter, SavedSearch, SearchInput], 
  templateUrl: './objectives.html',
})
export class Objectives implements OnInit, OnDestroy {

  private objectiveService = inject(ObjectiveService);
  private dialog = inject(MatDialog);
  private permissionService = inject(PermissionService);

  canCreate = false;
  canEdit = false;
  canDelete = false;
  
  private permissionsUpdateHandler = () => {
    this.applyPermissions();
  };

  rawObjectives = signal<Objective[]>([]);

  searchQuery = signal<string>('');
  currentSort = signal<string>('date_asc');
  activeFilters = signal<FilterState>({ roles: [], statuses: [] });

  sortOptions: SortOption[] = [
    { label: 'Due Date (Earliest)', value: 'date_asc' },
    { label: 'Due Date (Latest)', value: 'date_desc' },
    { label: 'Title (A-Z)', value: 'title_asc' },
    { label: 'Title (Z-A)', value: 'title_desc' },
    { label: 'Status', value: 'status' }
  ];

  availableStatuses = computed(() => {
    const statuses = new Set<string>();
    this.rawObjectives().forEach(obj => {
      if (obj.status) statuses.add(obj.status);
    });
    return Array.from(statuses).sort();
  });

  savedSearches: SavedSearchItem[] = [
    { id: 1, label: 'Complete', query: 'complete' },
    { id: 2, label: 'In Progress', query: 'progress' },
    { id: 3, label: 'Stuck', query: 'stuck' },
    { id: 4, label: 'Pending', query: 'pending' }
  ];

  filteredObjectives = computed(() => {
    let data = this.rawObjectives();
    const query = this.searchQuery().toLowerCase();
    const filter = this.activeFilters();
    const sort = this.currentSort();

    if (query) {
      data = data.filter(obj => 
        (obj.title || '').toLowerCase().includes(query) ||
        (obj.owner || '').toLowerCase().includes(query)
      );
    }

    if (filter.statuses.length > 0) {
      data = data.filter(obj => filter.statuses.includes(obj.status));
    }
    
    return [...data].sort((a, b) => {
      switch (sort) {
        case 'title_asc': return a.title.localeCompare(b.title);
        case 'title_desc': return b.title.localeCompare(a.title);
        case 'date_asc': return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'date_desc': return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        case 'status': return a.status.localeCompare(b.status);
        default: return 0;
      }
    });
  });

  ngOnInit(): void {
    this.permissionService.refreshFromStorage();
    this.applyPermissions();
    this.loadData();
    
    window.addEventListener('permissionsUpdated', this.permissionsUpdateHandler);
  }
  
  ngOnDestroy(): void {
    window.removeEventListener('permissionsUpdated', this.permissionsUpdateHandler);
  }

  private applyPermissions(): void {
    const flags = this.permissionService.getPermissionAccess(FEATURE_PERMISSION_MAP.objectives);
    this.canCreate = flags.canWrite;
    this.canEdit = flags.canWrite;
    this.canDelete = flags.canDelete;
  }

  loadData() {
    this.objectiveService.getObjectives().subscribe({
      next: (data) => {
        this.rawObjectives.set(data);
      },
      error: (err) => console.error('Error:', err)
    });
  }

  onSearch(term: string) {
    this.searchQuery.set(term);
  }

  onSavedSearch(query: string) {
    this.searchQuery.set(query);
  }

  onSortChange(value: string) {
    this.currentSort.set(value);
  }

  onFilterChange(filter: FilterState) {
    this.activeFilters.set(filter);
  }

  openAddObjective(): void {
    if (!this.canCreate) {
      alert('You do not have permission to create objectives.');
      return;
    }
    const dialogRef = this.dialog.open(AddObjectiveDialogComponent, {
      width: '800px', maxWidth: '95vw', disableClose: true, autoFocus: false, panelClass: 'rounded-dialog' 
    });
    dialogRef.afterClosed().subscribe(result => { if (result === 'success') this.loadData(); });
  }

  onEdit(id: number): void {
    if (!this.canEdit) {
      alert('You do not have permission to edit objectives.');
      return;
    }
    const objToEdit = this.rawObjectives().find(o => o.id === id);
    if (objToEdit) {
      const dialogRef = this.dialog.open(AddObjectiveDialogComponent, {
        width: '800px', maxWidth: '95vw', disableClose: true, autoFocus: false, panelClass: 'rounded-dialog',
        data: { objective: objToEdit } 
      });
      dialogRef.afterClosed().subscribe(result => { if (result === 'success') this.loadData(); });
    }
  }

  onDelete(id: number): void {
    if (!this.canDelete) {
      alert('You do not have permission to delete objectives.');
      return;
    }
    if (confirm(`Delete objective #${id}?`)) {
      this.objectiveService.deleteObjective(id).subscribe({ next: () => this.loadData() });
    }
  }
}