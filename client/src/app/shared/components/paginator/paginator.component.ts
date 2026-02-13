import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-paginator',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css'],
})
export class PaginatorComponent {
  totalItems = input(0);
  pageSize = input(10);
  pageIndex = input(1);
  maxPages = input(5);
  pageSizeOptions = input<number[]>([10, 15, 20]);
  ariaLabel = input('Pagination');
  previousLabel = input('Previous');
  nextLabel = input('Next');
  pageSizeLabel = input('Rows per page');
  pageSizeAriaLabel = input('Select page size');

  pageChange = output<number>();
  pageSizeChange = output<number>();

  totalPages = computed(() => {
    const total = Math.ceil(this.totalItems() / this.pageSize());
    return Math.max(total, 1);
  });

  pages = computed(() => {
    const total = this.totalPages();
    const max = Math.max(this.maxPages(), 1);
    const current = this.pageIndex();
    const half = Math.floor(max / 2);
    let start = Math.max(1, current - half);
    const end = Math.min(total, start + max - 1);

    if (end - start + 1 < max) {
      start = Math.max(1, end - max + 1);
    }

    const result: number[] = [];
    for (let page = start; page <= end; page += 1) {
      result.push(page);
    }
    return result;
  });

  canGoPrevious = computed(() => this.pageIndex() > 1);
  canGoNext = computed(() => this.pageIndex() < this.totalPages());

  goToPage(page: number): void {
    const clamped = Math.min(Math.max(page, 1), this.totalPages());
    if (clamped !== this.pageIndex()) {
      this.pageChange.emit(clamped);
    }
  }

  goPrevious(): void {
    if (this.canGoPrevious()) {
      this.goToPage(this.pageIndex() - 1);
    }
  }

  goNext(): void {
    if (this.canGoNext()) {
      this.goToPage(this.pageIndex() + 1);
    }
  }

  onPageSizeChange(value: string): void {
    const nextSize = Number.parseInt(value, 10);
    if (!Number.isNaN(nextSize) && nextSize > 0) {
      this.pageSizeChange.emit(nextSize);
    }
  }
}
