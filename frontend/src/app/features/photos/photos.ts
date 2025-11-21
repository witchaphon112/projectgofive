import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddPhotoDialogComponent } from '../../shared/components/add-photo-dialog/add-photo-dialog';
import { Photo } from '../../core/models/photo.model';
import { PhotoService } from '../../core/services/photo.service';
import { PermissionService } from '../../core/services/permission.service';
import { FEATURE_PERMISSION_MAP } from '../../core/config/feature-permissions';
import { SearchInput } from '../../shared/components/search-input/search-input';
import { SortBy, SortOption } from '../../shared/components/sort-by/sort-by';

@Component({
  selector: 'app-photos',
  standalone: true,
  imports: [CommonModule, MatIconModule, DatePipe, MatDialogModule, SearchInput, SortBy, ], 
  templateUrl: './photos.html',
})
export class Photos implements OnInit {

  private photoService = inject(PhotoService);
  private dialog = inject(MatDialog);
  private permissionService = inject(PermissionService);

  photos = signal<Photo[]>([]);
  canCreate = false;
  canDelete = false;
  currentUserRole = '';

  searchQuery = signal<string>('');
  currentSort = signal<string>('date_desc');

  sortOptions: SortOption[] = [
    { label: 'Date (Newest)', value: 'date_desc' },
    { label: 'Date (Oldest)', value: 'date_asc' },
    { label: 'Title (A-Z)', value: 'title_asc' },
    { label: 'Title (Z-A)', value: 'title_desc' },
  ];

  filteredPhotos = computed(() => {
    let data = this.photos();
    const query = this.searchQuery().toLowerCase();
    const sort = this.currentSort();

    if (query) {
      data = data.filter(photo => 
        (photo.title || '').toLowerCase().includes(query)
      );
    }

    return [...data].sort((a, b) => {
      switch (sort) {
        case 'title_asc': return (a.title || '').localeCompare(b.title || '');
        case 'title_desc': return (b.title || '').localeCompare(a.title || '');
        case 'date_asc': return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        case 'date_desc': return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        default: return 0;
      }
    });
  });

  ngOnInit(): void {
    this.loadCurrentUserRole();
    this.checkUploadPermission();
    const flags = this.permissionService.getPermissionAccess(FEATURE_PERMISSION_MAP.photos);
    this.canDelete = flags.canDelete;
    this.loadData();
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
    const allowedRoles = ['Admin', 'Super Admin'];
    this.canCreate = allowedRoles.includes(this.currentUserRole);
  }

  loadData() {
    this.photoService.getPhotos().subscribe({
      next: (data) => this.photos.set(data),
      error: (err) => console.error(err)
    });
  }

  openUploadModal(): void {
    this.loadCurrentUserRole();
    this.checkUploadPermission();
    
    if (!this.canCreate) {
      alert('You do not have permission to upload photos. Only Admin and Super Admin can upload photos.');
      return;
    }
    const dialogRef = this.dialog.open(AddPhotoDialogComponent, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if(res === 'success') this.loadData();
    });
  }

  viewPhoto(id: number): void {
    const photo = this.photos().find(p => p.id === id);
    if(photo) window.open(photo.url, '_blank');
  }

  deletePhoto(id: number): void {
    if (!this.canDelete) {
      alert('You do not have permission to delete photos.');
      return;
    }
    if (confirm('Delete this photo?')) {
      this.photoService.deletePhoto(id).subscribe(() => this.loadData());
    }
  }

  onSearch(term: string) {
    this.searchQuery.set(term);
  }


  onSortChange(value: string) {
    this.currentSort.set(value);
  }

}