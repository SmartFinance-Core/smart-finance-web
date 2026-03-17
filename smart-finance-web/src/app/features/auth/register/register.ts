import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html'
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [
      Validators.required,
      Validators.pattern('^[9][0-9]{8}$')
    ]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordsMatch });

  passwordsMatch(group: any) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = {
      email: this.registerForm.value.email!,
      phoneNumber: '51' + this.registerForm.value.phoneNumber!,
      password: this.registerForm.value.password!
    };

    this.authService.register(credentials).subscribe({
      next: () => {
        this.successMessage = '¡Cuenta creada! Redirigiendo...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.errorMessage = 'Este correo o número de WhatsApp ya está registrado.';
        } else {
          this.errorMessage = 'Error al crear la cuenta. Intenta de nuevo.';
        }
      }
    });
  }
}
