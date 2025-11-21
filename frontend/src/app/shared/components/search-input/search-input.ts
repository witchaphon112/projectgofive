import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule], 
  templateUrl: './search-input.html',
})
export class SearchInput {
  
  searchTerm: string = '';

  @Output() searchChange = new EventEmitter<string>();

  onSearch(): void {
    this.searchChange.emit(this.searchTerm);
  }
}