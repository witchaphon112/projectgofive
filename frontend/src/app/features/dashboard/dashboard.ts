import { Component, OnInit, OnDestroy, signal, WritableSignal, computed, inject } from '@angular/core'; 
import { CommonModule, DatePipe } from '@angular/common'; 
import { MatIconModule } from '@angular/material/icon'; 
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { UserDashBoardDto } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { PermissionService } from '../../core/services/permission.service';
import { FEATURE_PERMISSION_MAP } from '../../core/config/feature-permissions';

import { AddUserDialogComponent } from '../../shared/components/add-user-dialog/add-user-dialog';
import { SearchInput } from '../../shared/components/search-input/search-input'; 
import { SortBy } from '../../shared/components/sort-by/sort-by'; 
import { SavedSearch, SavedSearchItem } from '../../shared/components/saved-search/saved-search';
import { Fillter, FilterState } from '../../shared/components/fillter/fillter';
import { Slide } from '../../shared/components/slide/slide'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    AddUserDialogComponent,
    SearchInput,
    SortBy,       
    SavedSearch,
    Fillter,
    DatePipe,
    Slide
  ],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly permissionService = inject(PermissionService);
  public canCreateUsers = false;
  public canEditUsers = false;
  public canDeleteUsers = false;
  
  private permissionsUpdateHandler = () => {
    this.loadCurrentUserPermissions();
  };

  constructor(public dialog: MatDialog) {
    // Refresh permissions เมื่อ component ถูกสร้าง
    this.loadCurrentUserPermissions();
  } 

  private userService = inject(UserService);

  public users: WritableSignal<UserDashBoardDto[]> = signal([]);
  
  public searchQuery = signal<string>('');
  public currentSort = signal<string>('date_desc');
  
  public activeFilters = signal<FilterState>({ roles: [], statuses: [] });

  public currentPage = signal<number>(0);
  public pageSize = signal<number>(6);
  public totalCount = signal<number>(0);
  public isLoading = signal<boolean>(false);

  public filteredUsers = computed(() => {
    const filters = this.activeFilters();
    const allUsers = this.users();

    let result = allUsers;

    if (filters.roles.length > 0) {
      result = result.filter(user => filters.roles.includes(user.role ?? user.roleName ?? ''));
    }

    if (filters.statuses.length > 0) {
      result = result.filter(user => filters.statuses.includes(user.status));
    }

    return result;
  });

  public totalPages = computed(() => {
    return Math.ceil(this.totalCount() / this.pageSize());
  });

  public availableStatuses = computed(() => {
    const statuses = new Set<string>();
    this.users().forEach(user => {
      if (user.status) statuses.add(user.status);
    });
    return Array.from(statuses).sort();
  });

  public availableRoles = computed(() => {
    const roles = new Set<string>();
    this.users().forEach(user => {
      const role = user.role ?? user.roleName;
      if (role) roles.add(role);
    });
    return Array.from(roles).sort();
  });

  public savedSearches: SavedSearchItem[] = [
  { id: 1, label: 'Super Admins', query: 'Super Admin' },
  { id: 2, label: 'Admins', query: 'Admin' },
  { id: 3, label: 'Employees', query: 'Employee' },
  { id: 4, label: 'HR Admins', query: 'HR Admin' }
  ];

  ngOnInit(): void {
    this.loadCurrentUserPermissions();
    this.loadUsers();
    
    window.addEventListener('permissionsUpdated', this.permissionsUpdateHandler);
  }

  loadUsers(): void {
    this.isLoading.set(true);
    
    const sortMapping: { [key: string]: { orderBy: string; orderDirection: string } } = {
      'name_asc': { orderBy: 'firstName', orderDirection: 'asc' },
      'name_desc': { orderBy: 'firstName', orderDirection: 'desc' },
      'date_newest': { orderBy: 'createDate', orderDirection: 'desc' },
      'date_oldest': { orderBy: 'createDate', orderDirection: 'asc' },
      'role_asc': { orderBy: 'roleName', orderDirection: 'asc' },
      'status_asc': { orderBy: 'status', orderDirection: 'asc' }
    };

    const sortConfig = sortMapping[this.currentSort()] || { orderBy: 'createDate', orderDirection: 'desc' };

    const params = {
      orderBy: sortConfig.orderBy,
      orderDirection: sortConfig.orderDirection,
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.searchQuery() || null
    };

    this.userService.getUsersDataTable(params).subscribe({
      next: (response) => {
        let filteredData = response.dataSource;
        const filters = this.activeFilters();
        
        if (filters.roles.length > 0) {
          filteredData = filteredData.filter(user => 
            filters.roles.includes(user.role ?? user.roleName ?? '')
          );
        }
        
        if (filters.statuses.length > 0) {
          filteredData = filteredData.filter(user => 
            filters.statuses.includes(user.status)
          );
        }

        this.users.set(filteredData);
        this.totalCount.set(response.totalCount);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.isLoading.set(false);
      }
    });
  }

  onSearch(term: string): void {
    this.searchQuery.set(term);
    this.currentPage.set(0);
    this.loadUsers();
  }

  onSortChange(sortValue: string): void {
    this.currentSort.set(sortValue);
    this.currentPage.set(0);
    this.loadUsers();
  }

  onSavedSearch(query: string): void {
    this.searchQuery.set(query); 
    this.currentPage.set(0); 
    this.loadUsers(); 
  }

  onFilterChange(filters: FilterState): void {
    this.activeFilters.set(filters);
    this.currentPage.set(0);
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadUsers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadUsers();
  }

  openAddUser(): void {
    if (!this.canCreateUsers) {
      alert('You do not have permission to create users.');
      return;
    }
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '1100px', maxWidth: '150vw', height: '650px', maxHeight: '90vh',   
      disableClose: true, autoFocus: false, panelClass: 'rounded-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') this.loadUsers();
    });
  }

  onEdit(user: UserDashBoardDto): void {
    if (!this.canEditUsers) {
      alert('You do not have permission to edit users.');
      return;
    }
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '1100px', maxWidth: '150vw', height: '650px', maxHeight: '90vh',   
      disableClose: true, autoFocus: false, panelClass: 'rounded-dialog',
      data: { mode: 'edit', user: user } 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') this.loadUsers();
    });
  }

  onDelete(user: UserDashBoardDto): void {
    if (!this.canDeleteUsers) {
      alert('You do not have permission to delete users.');
      return;
    }
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers(); 
        },
        error: (err) => console.error('Delete failed', err)
      });
    }
  }

  private loadCurrentUserPermissions(): void {
    this.permissionService.refreshFromStorage();
    this.updatePermissionFlags();
  }

  private updatePermissionFlags(): void {
    const flags = this.permissionService.getPermissionAccess(FEATURE_PERMISSION_MAP.dashboard);
    this.canCreateUsers = flags.canWrite;
    this.canEditUsers = flags.canWrite;
    this.canDeleteUsers = flags.canDelete;
  }

  ngOnDestroy(): void {
    window.removeEventListener('permissionsUpdated', this.permissionsUpdateHandler);
  }
}