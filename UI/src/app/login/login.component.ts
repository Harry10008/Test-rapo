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

  constructor(private router: Router, private toastr: ToastrService, private http: HttpClient) {}

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
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.toastr.error('Please fill in all required fields correctly.');
      return;
    }
  
    const { email, password } = this.loginForm.value;
  
    try {
      const response = await this.http.post<any>("http://localhost:3001/user/login", { email, password }).toPromise();
      console.log(response);
  
      if (response) {
        // If login is successful, store user data in localStorage
        localStorage.setItem('user', email);  
        localStorage.setItem('authToken', response.token);  
        localStorage.setItem('role', response.role);
        console.log(response);
        this.router.navigate(['list']);
        this.toastr.success('User login successful!');
      } else {
        this.toastr.error('Invalid email or password!');
      }
    } catch (error: any) {
      // Handle error gracefully
      if (error.status === 400 && error.error && error.error.message) {
        // Check if the error message is available from the backend
        this.toastr.error(error.error.message || 'Invalid credentials');
      } else {
        // Generic error handling
        console.error('An error occurred:', error);
        this.toastr.error('Please verify your login details.');
      }
    }
  }
  
  register(): void {
    this.router.navigate(['save']);
  }
}
