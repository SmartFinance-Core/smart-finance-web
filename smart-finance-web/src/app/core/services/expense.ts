import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

// Definimos la "forma" de los datos que vienen de Spring Boot
export interface Expense {
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
export class Expense {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/expenses`; // Asegúrate de que este sea tu endpoint en Java

  // Trae todos los gastos del usuario
  getExpenses(): Observable<Expense[]> {
    // Si tu controlador en Java requiere el ID del usuario en la URL,
    // cámbialo a `${this.apiUrl}/user/1` temporalmente hasta que leamos el ID del Token
    return this.http.get<Expense[]>(this.apiUrl);
  }
}
