import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Expense, ExpenseModel } from '../../../core/services/expense';
import { Category, CategoryModel } from '../../../core/services/category';
import { AuthService } from '../../../core/services/auth';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
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
  aiInput = new FormControl(''); // Atrapa lo que el usuario escribe
  isProcessingAI = false;        // Controla la animación de "Pensando..."
  expenses: ExpenseModel[] = [];
  categories: CategoryModel[] = [];
  totalGastado: number = 0;
  presupuestoMensual: number = 3000;

  isModalOpen = false;
  currentUserId = 0;

  expenseForm = this.fb.group({
    amount: ['', [Validators.required, Validators.min(0.1)]],
    description: ['', Validators.required],
    categoryId: ['', Validators.required]
  });
  submitAIExpense() {
    const text = this.aiInput.value;
    if (!text || text.trim() === '') return;

    this.isProcessingAI = true; // Encendemos el loader

    this.expenseAPI.createExpenseFromText(text).subscribe({
      next: () => {
        this.aiInput.reset(); // Limpiamos la barra
        this.loadExpenses();  // Recargamos la tabla al instante
        this.isProcessingAI = false; // Apagamos el loader
      },
      error: (err) => {
        console.error('Error al procesar con IA:', err);
        this.isProcessingAI = false;
      }
    });
  }
  ngOnInit() {
    // 1. Leemos el ID real del token
    const id = this.authService.getUserIdFromToken();

    if (id) {
      this.currentUserId = id;
      console.log('¡Usuario real detectado! ID:', this.currentUserId);

      // 2. Solo cargamos los datos si sabemos quién es
      this.loadCategories();
      this.loadExpenses();
    } else {
      console.error('No se pudo leer el ID del usuario, cerrando sesión...');
      this.logout(); // Lo pateamos por seguridad
    }
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
