import { Component,OnInit } from '@angular/core';
import {ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-verify',
  templateUrl: './verification-mail.component.html', 
  styleUrls: ['./verification-mail.component.css'], 
})
export class VerificationMailComponent implements OnInit {
  constructor(private apiService: ApiService, private router: Router,
    private route: ActivatedRoute,
    private Toastr: ToastrService
  ) {}

  ngOnInit(): void {
this.verify();
  }
  verify(): void {
    const token = this.route.snapshot.queryParamMap.get('token') || ''; 
    if (!token) {
      this.Toastr.error('No token found');
      return;
    }
    this.apiService.verify(token).subscribe({
      next: (response) => {
        console.log('Verification successful:', response);
        this.Toastr.success('Email verified successfully!');
        this.router.navigate(['']);
      },
      error: (error) => {
        console.error('Verification failed:', error);
        this.Toastr.error('Verification failed. Please try again.');
      },
    });
  }
  
}
