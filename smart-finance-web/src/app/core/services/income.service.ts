import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// La estructura de la "Bóveda" que creamos en Java
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
  // Asegúrate de que esta URL apunte a tu Spring Boot
  private apiUrl = 'http://localhost:8080/api/incomes';

  constructor(private http: HttpClient) {}

  // Pedimos el historial de ingresos
  getMyIncomes(): Observable<Income[]> {
    return this.http.get<Income[]>(this.apiUrl);
  }
}
