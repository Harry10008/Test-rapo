import { Component } from '@angular/core';
import {ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verification-mail.component.html', // Link to your HTML file
  styleUrls: ['./verification-mail.component.css'], // Link to your CSS file (optional)
})
export class VerificationMailComponent {
  constructor(private apiService: ApiService, private router: Router,
    private route: ActivatedRoute
  ) {}

  verify(): void {
    const token = this.route.snapshot.queryParamMap.get('token') || ''; // Fallback to an empty string
    if (!token) {
      alert('No token found');
      return;
    }
    this.apiService.verify(token).subscribe({
      next: (response) => {
        console.log('Verification successful:', response);
        alert('Email verified successfully!');
        this.router.navigate(['']); // Redirect after success
      },
      error: (error) => {
        console.error('Verification failed:', error);
        alert('Verification failed. Please try again.');
      },
    });
  }
  
}
