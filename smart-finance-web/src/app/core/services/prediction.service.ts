import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PredictionResponse {
  daily_average: number;
  days_remaining: number;
  zero_date: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/predictions/burn-rate`;

  getBurnRatePrediction(): Observable<PredictionResponse> {
    return this.http.get<PredictionResponse>(this.apiUrl);
  }
}
