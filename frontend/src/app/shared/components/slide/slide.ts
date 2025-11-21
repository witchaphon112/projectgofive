import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-slide',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './slide.html',
  styleUrl: './slide.css',
})
export class Slide {
  @Input() currentPage: number = 0;
  @Input() pageSize: number = 10;
  @Input() totalCount: number = 0;
  @Input() isLoading: boolean = false;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get startItem(): number {
    return this.totalCount === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  get endItem(): number {
    const end = (this.currentPage + 1) * this.pageSize;
    return end > this.totalCount ? this.totalCount : end;
  }

  get hasNextPage(): boolean {
    return (this.currentPage + 1) * this.pageSize < this.totalCount;
  }

  get hasPreviousPage(): boolean {
    return this.currentPage > 0;
  }

  onPrevious(): void {
    if (this.hasPreviousPage && !this.isLoading) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  onNext(): void {
    if (this.hasNextPage && !this.isLoading) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  onPageSizeSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value, 10);
    this.pageSizeChange.emit(newSize);
  }
}
