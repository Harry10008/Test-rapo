import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {
  registerform!: FormGroup;  // Form group for the form

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService,
    private fb: FormBuilder  // Inject FormBuilder to create the form
  ) {}

  ngOnInit(): void {
    // Initialize the form group with validators
    this.registerform = this.fb.group({
      email: ['', [Validators.required, Validators.email]],  // Email field with required and email validation
    });
  }

  // Method to prevent spaces in the email field
  preventSpace(event: KeyboardEvent): void {
    if (event.key === ' ') {
      event.preventDefault();  // Prevent space character input
    }
  }

  // Method to handle form submission
  onSubmit(): void {
    if (this.registerform.valid) {
      // Call your API to send the password reset link
      this.apiService.forgotPassword(this.registerform.value.email).subscribe(
        response => {
          this.toastr.success('Password reset link sent to your email.', 'Success');
          this.router.navigate(['']);  // Navigate to home page on success
        },
        error => {
          this.toastr.error('Error sending reset link. Please try again.', 'Error');
        }
      );
    } else {
      this.toastr.warning('Please provide a valid email address.', 'Warning');
    }
  }
}
