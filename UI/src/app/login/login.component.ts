import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  recaptchaSiteKey: string = "6LeLQ50qAAAAALtCGU_W2AKAponGC2WgjAzWubLz"; 
  captchaResponse: string = '';
  isLoading: boolean = false; 

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\S+@\S+\.\S+$/),
        Validators.minLength(5),
        Validators.maxLength(50),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
      ]),
      recaptcha: new FormControl('', Validators.required),
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.toastr.error('Please fill in all required fields correctly.');
      return;
    }
  
    this.isLoading = true;
  
    const { email, password, recaptcha } = this.loginForm.value;
  
    try {
      const response = await this.http
        .post<any>('http://localhost:3001/user/login', { email, password, recaptcha })
        .toPromise();
  
      if (response.response === 'success') {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('user', response.user);
        this.router.navigate(['list']);
        this.toastr.success('Login successful! ');
      } else {
        this.toastr.error(response.message || 'Unexpected error occurred. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
  
      // Parse backend error messages
      const errorMsg =
        error.error?.message || 'Login failed due to an unexpected error. Please try again.';
      this.toastr.error(errorMsg);
    } finally {
      this.isLoading = false;
      this.loginForm.get('recaptcha')?.reset();
    }
  }
  
  register(): void {
    this.router.navigate(['save']);
  }

  onCaptchaResolved(captchaResponse: string): void {
    console.log('Captcha resolved:', captchaResponse);
    this.captchaResponse = captchaResponse;
    this.loginForm.get('recaptcha')?.setValue(captchaResponse);
  }
}
