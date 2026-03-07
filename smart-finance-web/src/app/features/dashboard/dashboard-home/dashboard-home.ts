import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Expense, ExpenseModel } from '../../../core/services/expense';
import { Category, CategoryModel } from '../../../core/services/category';
import { AuthService } from '../../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-home.html' // Asumo que tu HTML tampoco lleva .component
})
export class DashboardHome implements OnInit {
  private expenseAPI = inject(Expense);
  private categoryAPI = inject(Category);
  private authService = inject(AuthService); // El único que mantiene la convención
  private router = inject(Router);
  private fb = inject(FormBuilder);

  expenses: ExpenseModel[] = [];
  categories: CategoryModel[] = [];
  totalGastado: number = 0;
  presupuestoMensual: number = 3000;

  isModalOpen = false;
  currentUserId = 1;

  expenseForm = this.fb.group({
    amount: ['', [Validators.required, Validators.min(0.1)]],
    description: ['', Validators.required],
    categoryId: ['', Validators.required]
  });

  ngOnInit() {
    this.loadCategories();
    this.loadExpenses();
  }

  loadCategories() {
    this.categoryAPI.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        console.log('Categorías cargadas:', data); // Veremos si llega un array vacío []
      },
      error: (err) => console.error('Error al cargar categorías (Revisa Spring Security):', err)
    });
  }

  loadExpenses() {
    this.expenseAPI.getExpensesByUserId(this.currentUserId).subscribe({
      next: (data) => {
        this.expenses = data;
        this.calculateTotal();
      },
      error: (err) => console.error('Error al cargar gastos:', err)
    });
  }

  calculateTotal() {
    this.totalGastado = this.expenses.reduce((sum, item) => sum + item.amount, 0);
  }

  openModal() { this.isModalOpen = true; }
  closeModal() {
    this.isModalOpen = false;
    this.expenseForm.reset();
  }

  saveExpense() {
    if (this.expenseForm.valid) {
      const newExpense = {
        amount: Number(this.expenseForm.value.amount),
        description: this.expenseForm.value.description!,
        categoryId: Number(this.expenseForm.value.categoryId),
        userId: this.currentUserId
      };

      this.expenseAPI.createExpense(newExpense).subscribe({
        next: () => {
          this.loadExpenses();
          this.closeModal();
        },
        error: (err) => console.error('Error al guardar', err)
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
