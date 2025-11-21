import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface FilterState {
  roles: string[];
  statuses: string[];
}

@Component({
  selector: 'app-fillter',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './fillter.html',
})
export class Fillter {

  @Input() availableRoles: string[] = ['Super Admin', 'Admin', 'HR Admin', 'Employee'];
  @Input() availableStatuses: string[] = ['Active', 'Inactive', 'Pending'];
  @Input() showRoles: boolean = true;
  @Input() showStatuses: boolean = true;

  @Output() filterChange = new EventEmitter<FilterState>();

  isOpen = signal(false);

  selectedRoles = signal<string[]>([]);
  selectedStatuses = signal<string[]>([]);

  toggleDropdown() {
    this.isOpen.update(v => !v);
  }

  toggleRole(role: string) {
    this.selectedRoles.update(current => {
      if (current.includes(role)) {
        return current.filter(r => r !== role);
      } else {
        return [...current, role];
      }
    });
  }

  toggleStatus(status: string) {
    this.selectedStatuses.update(current => {
      if (current.includes(status)) {
        return current.filter(s => s !== status);
      } else {
        return [...current, status];
      }
    });
  }

  isRoleSelected(role: string): boolean {
    return this.selectedRoles().includes(role);
  }

  isStatusSelected(status: string): boolean {
    return this.selectedStatuses().includes(status);
  }

  applyFilters() {
    const state: FilterState = {
      roles: this.selectedRoles(),
      statuses: this.selectedStatuses()
    };
    this.filterChange.emit(state);
    this.isOpen.set(false);
  }

  resetFilters() {
    this.selectedRoles.set([]);
    this.selectedStatuses.set([]);
    this.applyFilters();
  }
}