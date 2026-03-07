import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { Expense } from '../../../core/services/expense';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.html'
})
export class DashboardHome implements OnInit {
  private expense = inject(Expense);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Aquí guardaremos los datos reales que vienen de MySQL
  expenses: Expense[] = [];
  totalGastado: number = 0;
  presupuestoMensual: number = 3000; // Esto podríamos traerlo de la BD luego

  ngOnInit() {
    this.loadExpenses();
  }

  loadExpenses() {
    this.expense.getExpenses().subscribe({
      next: (data) => {
        this.expenses = data;
        this.calculateTotal();
      },
      error: (err) => {
        console.error('Error al cargar gastos desde Java:', err);
      }
    });
  }

  calculateTotal() {
    // Sumamos todos los montos del array automáticamente
    this.totalGastado = this.expenses.reduce((sum, item) => sum + item.amount, 0);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
