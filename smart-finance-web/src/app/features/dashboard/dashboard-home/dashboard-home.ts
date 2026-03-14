import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Expense, ExpenseModel } from '../../../core/services/expense';
import { Category, CategoryModel } from '../../../core/services/category';
import { AuthService } from '../../../core/services/auth';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { IncomeService } from '../../../core/services/income.service';
import { PredictionService } from '../../../core/services/prediction.service'; // Asegúrate de haber creado este servicio

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-home.html'
})
export class DashboardHome implements OnInit {
  // --- Inyecciones ---
  private expenseAPI = inject(Expense);
  private categoryAPI = inject(Category);
  private authService = inject(AuthService);
  private router = inject(Router);
  private incomeService = inject(IncomeService);
  private predictionAPI = inject(PredictionService);
  private fb = inject(FormBuilder);

  // --- Controles de UI ---
  aiInput = new FormControl('');
  isProcessingAI = false;
  isUploadingReceipt = false;
  isModalOpen = false;

  // --- Datos ---
  expenses: ExpenseModel[] = [];
  categories: CategoryModel[] = [];
  currentUserId = 0;

  // --- Finanzas ---
  totalGastado: number = 0;
  totalIngresos: number = 0;
  predictionMessage: string = '';

  expenseForm = this.fb.group({
    amount: ['', [Validators.required, Validators.min(0.1)]],
    description: ['', Validators.required],
    categoryId: ['', Validators.required]
  });

  ngOnInit() {
    const id = this.authService.getUserIdFromToken();

    if (id) {
      this.currentUserId = id;
      this.loadCategories();
      this.loadExpenses();
      this.loadIncomes();
      this.loadPrediction(); // Cargamos el oráculo al iniciar
    } else {
      this.logout();
    }
  }

  // --- Carga de Datos ---
  loadCategories() {
    this.categoryAPI.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error al cargar categorías:', err)
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

  loadIncomes() {
    this.incomeService.getMyIncomes().subscribe({
      next: (data) => {
        this.totalIngresos = data.reduce((sum, item) => sum + item.amount, 0);
      },
      error: (err) => console.error('Error al cargar ingresos', err)
    });
  }

  loadPrediction() {
    this.predictionAPI.getBurnRatePrediction().subscribe({
      next: (data) => {
        this.predictionMessage = data.message;
      },
      error: (err) => console.error('Error al obtener predicción de IA', err)
    });
  }

  calculateTotal() {
    this.totalGastado = this.expenses.reduce((sum, item) => sum + item.amount, 0);
  }

  // --- Acciones ---
  submitAIExpense() {
    const text = this.aiInput.value;
    if (!text || text.trim() === '') return;
    this.isProcessingAI = true;

    this.expenseAPI.createExpenseFromText(text).subscribe({
      next: () => {
        this.aiInput.reset();
        this.loadExpenses();
        this.loadPrediction(); // Recalculamos predicción tras nuevo gasto
        this.isProcessingAI = false;
      },
      error: (err) => {
        console.error('Error al procesar con IA:', err);
        this.isProcessingAI = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.isUploadingReceipt = true;
      this.expenseAPI.uploadReceipt(file).subscribe({
        next: () => {
          this.loadExpenses();
          this.loadPrediction();
          this.isUploadingReceipt = false;
        },
        error: (err) => {
          console.error('Error al procesar la boleta:', err);
          this.isUploadingReceipt = false;
        }
      });
    }
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
          this.loadPrediction();
          this.closeModal();
        },
        error: (err) => console.error('Error al guardar', err)
      });
    }
  }

  openModal() { this.isModalOpen = true; }
  closeModal() {
    this.isModalOpen = false;
    this.expenseForm.reset();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
