import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Income {
  id?: number;
  amount: number;
  source: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/incomes`;

  getMyIncomes(): Observable<Income[]> {
    return this.http.get<Income[]>(this.apiUrl);
  }
}
