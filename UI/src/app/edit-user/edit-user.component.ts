import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  editForm!: FormGroup;
  user: any;
  lastKeyPressed: string | null = null;
  selectedImage: File | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const state = history.state;

    if (state && state.user) {
      this.user = state.user;
      this.initializeForm();
    } else {
      this.toastr.error('No user data found!');
      this.router.navigate(['/list']);
    }
  }

  initializeForm(): void {
    this.editForm = this.fb.group({
      first_name: [this.user.first_name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      last_name: [this.user.Last_name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: [this.user.email || '', [Validators.required, Validators.email, Validators.maxLength(100)]],
      mobile: [this.user.mobile || '', [Validators.required, Validators.pattern('^[0-9]{10}$')]], 
      city: [this.user.city || '', [Validators.required]],
      state: [this.user.state || '', [Validators.required]],
      country: [this.user.country || '', [Validators.required]],
      pin_code: [this.user.pin_code || '', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      gender: [this.user.gender || '', [Validators.required]],
      role: [this.user.role || '', [Validators.required, Validators.maxLength(50)]],
      short_bio: [this.user.short_bio || '', [Validators.required, Validators.minLength(10),Validators.maxLength(200)]],
      address: [this.user.address || '', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
      isVarified: [this.user.verified ? 1 : 0], // Convert to integer
    });
  }
  

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png'];

      if (!allowedTypes.includes(file.type)) {
        this.toastr.error('Invalid file type. Please upload an image in JPG, JPEG, or PNG format.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5 MB
        this.toastr.error('File size exceeds the limit of 5 MB.');
        return;
      }

      this.selectedImage = file;
    }
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.toastr.error('Please fill all required fields.');
      return;
    }

    const formData = new FormData();
    Object.keys(this.editForm.controls).forEach((key) => {
      formData.append(key, this.editForm.get(key)?.value);
    });

    // Append the selected image if any
    if (this.selectedImage) {
      formData.append('imageName', this.selectedImage, this.selectedImage.name); // Match backend field name
    }

    this.apiService.updateUser(this.user.id, formData).subscribe(
      (response) => {
        this.toastr.success('User details updated successfully');
        this.router.navigate(['/list']);
      },
      (error) => {
        console.error('Error updating user', error);
        this.toastr.error('Failed to update user details.');
      }
    );
  }

  onVerificationChange(event: Event): void {
    const input = event.target as HTMLInputElement; // Cast to HTMLInputElement
    this.editForm.get('isVarified')?.setValue(input.checked ? 1 : 0);
  }
  
  cancelEdit(): void {
    this.router.navigate(['/list']);
  }

  preventAlphabets(event: KeyboardEvent): void {
    const key = event.key;
    if (/[a-zA-Z]/.test(key)) {
      event.preventDefault();
    }
  }

  preventSpace(event: KeyboardEvent): void {
    if (event.key === ' ' && this.lastKeyPressed === ' ') {
      event.preventDefault();
    }
    this.lastKeyPressed = event.key;
  }

  preventNumbers(event: KeyboardEvent): void {
    const key = event.key;
    if (/\d/.test(key)) {
      event.preventDefault();
    }
  }

  preventSpecialCharacters(event: KeyboardEvent): void {
    const key = event.key;
    if (/[^a-zA-Z0-9]/.test(key)) {
      event.preventDefault();
    }
  }

}
