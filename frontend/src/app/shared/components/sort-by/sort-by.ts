import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-sort-by',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './sort-by.html',
})
export class SortBy {

  @Input() options: SortOption[] = [
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'Date (Newest)', value: 'date_desc' },
    { label: 'Date (Oldest)', value: 'date_asc' },
  ];

  @Output() sortChange = new EventEmitter<string>();

  isOpen = signal(false);
  
  selectedLabel = signal('Sort by');

  toggleDropdown() {
    this.isOpen.update(v => !v);
  }

  selectOption(option: SortOption) {
    this.selectedLabel.set(option.label);
    this.sortChange.emit(option.value); 
    this.isOpen.set(false);
  }

}