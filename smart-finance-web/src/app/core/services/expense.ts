import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface ExpenseModel {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: {
    id: number;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class Expense { // Nombre limpio, sin "Service"
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/expenses`;

  getExpensesByUserId(userId: number): Observable<ExpenseModel[]> {
    return this.http.get<ExpenseModel[]>(`${this.apiUrl}/user/${userId}`);
  }
  createExpenseFromText(text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ai-text`, { text });
  }
  createExpense(expenseData: { amount: number; description: string; categoryId: number; userId: number }): Observable<any> {
    return this.http.post(this.apiUrl, expenseData);
  }
}
