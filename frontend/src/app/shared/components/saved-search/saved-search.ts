import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface SavedSearchItem {
  id: number;
  label: string;
  query: string;
}

@Component({
  selector: 'app-saved-search',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './saved-search.html',
})
export class SavedSearch {

  @Input() savedSearches: SavedSearchItem[] = [];
  @Input() storageKey: string = 'savedSearches';

  @Output() searchSelected = new EventEmitter<string>();

  isOpen = signal(false);

  private defaultSearches: SavedSearchItem[] = [
    { id: 1, label: 'Super Admins', query: 'Super Admin' },
    { id: 2, label: 'Admins', query: 'Admin' },
    { id: 3, label: 'Employees', query: 'Employee' },
    { id: 4, label: 'HR Admins', query: 'HR Admin' }
  ];

  availableSearches = computed(() => {
    if (this.savedSearches && this.savedSearches.length > 0) {
      return this.savedSearches;
    }
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved searches from localStorage', e);
    }
    
    return this.defaultSearches;
  });

  toggleDropdown() {
    this.isOpen.update(v => !v);
  }

  selectSearch(item: SavedSearchItem) {
    this.searchSelected.emit(item.query);
    this.isOpen.set(false);
  }

  addSavedSearch(label: string, query: string): void {
    const newItem: SavedSearchItem = {
      id: Date.now(),
      label,
      query
    };
    
    const current = this.availableSearches();
    const updated = [...current, newItem];
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  removeSavedSearch(id: number): void {
    const current = this.availableSearches();
    const updated = current.filter(item => item.id !== id);
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to remove from localStorage', e);
    }
  }
}