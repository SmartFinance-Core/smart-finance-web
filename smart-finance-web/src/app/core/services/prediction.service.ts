import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:8080/api/predictions/burn-rate';

  constructor(private http: HttpClient) {}

  getBurnRatePrediction(): Observable<PredictionResponse> {
    return this.http.get<PredictionResponse>(this.apiUrl);
  }
}
