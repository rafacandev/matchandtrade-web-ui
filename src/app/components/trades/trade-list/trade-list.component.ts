import { Component } from '@angular/core';

import { Pagination } from '../../../classes/search/pagination';
import { TradeService } from '../../../services/trade.service';
import { Trade } from '../../../classes/pojo/trade';

@Component({
  selector: 'app-trade-list',
  templateUrl: './trade-list.component.html',
  styleUrls: ['./trade-list.component.scss'],
  providers: [TradeService]
})
export class TradeListComponent {
  trades:Trade[];
  pagination: Pagination;

  constructor(private tradeService: TradeService) {
    this.pagination = new Pagination(1, 10);
    this.search();
  }

  nextPage() {
      this.pagination.pageNumber++;
      this.search();
  }

  previousPage() {
      this.pagination.pageNumber--;
      this.search();
  }

  search(): void {
    let searchResult = this.tradeService.search(
      this.pagination.pageNumber,
      this.pagination.pageSize);
    this.trades = searchResult.results;
    this.pagination = searchResult.pagination;
  }
}
