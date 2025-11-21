import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeNode } from '../../core/models/hierarchy.modal';
import { HierarchyService } from '../../core/services/hierachy.service';
import { PermissionService } from '../../core/services/permission.service';
import { FEATURE_PERMISSION_MAP } from '../../core/config/feature-permissions';
import { SearchInput } from '../../shared/components/search-input/search-input';
import { SortBy, SortOption } from '../../shared/components/sort-by/sort-by';
import { SavedSearch } from '../../shared/components/saved-search/saved-search';
import { Fillter, FilterState } from '../../shared/components/fillter/fillter';

@Component({
  selector: 'app-hierachy',
  standalone: true,
  imports: [CommonModule, MatIconModule, SearchInput, SortBy, SavedSearch, Fillter],
  templateUrl: './hierachy.html',
})
export class Hierachy implements OnInit {

  private hierarchyService = inject(HierarchyService);
  private permissionService = inject(PermissionService);

  orgChart = signal<EmployeeNode | null>(null);
  isLoading = signal<boolean>(true);
  showConfirmModal = signal<boolean>(false);
  showSuccessMessage = signal<boolean>(false);
  canGenerate = false;

  searchQuery = signal<string>('');
  currentSort = signal<string>('name_asc');
  activeFilters = signal<FilterState>({ roles: [], statuses: [] });

  sortOptions: SortOption[] = [
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
  ];

  filteredOrgChart = computed(() => {
    const chart = this.orgChart();
    const search = this.searchQuery().toLowerCase().trim();
    
    if (!chart || !search) {
      return chart;
    }

    return this.filterNode(chart, search);
  });

  ngOnInit(): void {
    const flags = this.permissionService.getPermissionAccess(FEATURE_PERMISSION_MAP.hierachy);
    this.canGenerate = flags.canWrite;
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.hierarchyService.getHierarchy().subscribe({
      next: (data: EmployeeNode) => {
        console.log('Org Chart Tree Data:', data);
        this.orgChart.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading hierarchy:', err);
        this.isLoading.set(false);
        this.orgChart.set(null);
      }
    });
  }

  private filterNode(node: EmployeeNode, search: string): EmployeeNode | null {
    const matchesSelf = 
      node.name.toLowerCase().includes(search) ||
      node.title.toLowerCase().includes(search);

    const filteredReports = node.reports
      ?.map(report => this.filterNode(report, search))
      .filter(report => report !== null) as EmployeeNode[] || [];

    if (matchesSelf || filteredReports.length > 0) {
      return {
        ...node,
        reports: filteredReports
      };
    }

    return null;
  }

  generateData() { 
    if (!this.canGenerate) {
      alert('You do not have permission to seed hierarchy data.');
      return;
    }
    this.showConfirmModal.set(true); 
  }

  confirmGenerate() {
    if (!this.canGenerate) {
      return;
    }
    this.showConfirmModal.set(false);
    this.hierarchyService.seedData().subscribe({
      next: () => {
        this.showSuccessMessage.set(true);
        setTimeout(() => this.showSuccessMessage.set(false), 3000); 
        this.loadData();
      },
      error: (err) => console.error(err)
    });
  }
  
  cancelConfirmation() { 
    this.showConfirmModal.set(false); 
  }

  viewEmployeeDetails(id: any) { 
    console.log('View:', id); 
  }

  onSearch(term: string) {
    this.searchQuery.set(term);
    console.log('Searching for:', term);
  }

}