import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  registerform!: FormGroup;
  selectedImage: File | null = null;
  isUserLoggedIn: boolean = false;
  editIndex: number | undefined;
  showPassword: boolean = false;
  emailError: string | null = null;


  // Dropdown data
  statesByCountry: { [key: string]: string[] } = {
    India: ['Madhya Pradesh', 'Gujarat', 'Maharastra'],
    US: ['California', 'Texas'],
  };

  citiesByState: { [key: string]: string[] } = {
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Ujjain'],
    Gujarat: ['Ahmedabad', 'Gandhinagar', 'Surat'],
    Maharastra: ['Mumbai', 'Pune', 'Nagpur'],
    California: ['Los Angeles', 'San Francisco', 'San Diego'],
    Texas: ['Houston', 'Dallas', 'Austin'],
  };

  filteredStates: string[] = [];
  filteredCities: string[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    this.isUserLoggedIn = !!user;
    // Initialize the form
    this.registerform = this.fb.group(
      {
        first_name: [
          '',
          [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
        ],
        last_name: [
          '',
          [Validators.required, Validators.pattern('^[a-zA-Z\s]*$'), Validators.minLength(3), Validators.maxLength(30)],
        ],
        email: [
          '',
          [Validators.required, Validators.email, Validators.pattern(/^\S+@\S+\.\S+$/), Validators.maxLength(64)],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(20),
            Validators.pattern('^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        country: ['', [Validators.required]],
        state: ['', Validators.required],
        city: ['', [Validators.required]],
        address: ['', [Validators.required, Validators.maxLength(250)]],
        pin_code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
        user_name: ['', [Validators.required, Validators.maxLength(30)]],
        image: [null, Validators.required],
        gender: ['', [Validators.required]],
        role: ['', [Validators.required]],
        short_bio: ['', [Validators.required, Validators.minLength(15), Validators.maxLength(250)],
        ],
      },
      { validator: this.passwordMatchValidator }
    );

    // If editing, pre-fill the form
    if (history.state && history.state.user) {
      const { user, editIndex } = history.state;
      if (user && editIndex !== undefined) {
        this.editIndex = editIndex;
        this.registerform.patchValue(user);
        this.filteredStates = this.statesByCountry[user.country] || [];
        this.filteredCities = this.citiesByState[user.state] || [];
      }
    }

    // Subscribe to `country` changes to update states
    this.registerform.get('country')?.valueChanges.subscribe((selectedCountry) => {
      this.filteredStates = this.statesByCountry[selectedCountry] || [];
      this.filteredCities = [];
      this.registerform.controls['state'].setValue('');
      this.registerform.controls['city'].setValue('');
    });

    // Subscribe to `state` changes to update cities
    this.registerform.get('state')?.valueChanges.subscribe((selectedState) => {
      this.filteredCities = this.citiesByState[selectedState] || [];
      this.registerform.controls['city'].setValue('');
    });
  }

  // Password match validation
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }


  // Form submission logic
  onSubmit(): void {
    if (this.registerform.invalid) {
      this.toastr.error('Please fill all required fields correctly.');
      return;
    }

    const formData = new FormData();
    Object.keys(this.registerform.controls).forEach((key) => {
      const value = this.registerform.get(key)?.value;
      formData.append(key, value);
    });

    if (this.selectedImage) {
      formData.append('imageName', this.selectedImage, this.selectedImage.name);
    }

    if (this.editIndex !== undefined) {
      formData.append('editIndex', this.editIndex.toString());
    }

    this.apiService.postData(formData).subscribe(
      () => {
        this.toastr.info('Please verify your email before login.');
        this.resetForm();
        this.router.navigate(['']);
      },
      (error) => {
        console.error('Error submitting form:', error);
        this.toastr.error(error.error.message || 'Error occurred while submitting.');
      }
    );
  }

  // Reset the form
  resetForm(): void {
    this.registerform.reset();
    this.selectedImage = null;
    this.filteredStates = [];
    this.filteredCities = [];
  }
  
  // Handle file selection
  checkEmail() {
    const email = this.registerform.controls['email'].value;

    if (!email) {
      this.emailError = 'Email is required';
      return;
    }

    this.http.get<any>(`http://localhost:3001/user/checkmail?email=${email}`).subscribe(
      (response) => {
        if (response.response === 'success') {
          this.emailError = null; // Email is available
        }
      },
      (error) => {
        if (error.status === 400) {
          this.emailError = 'Email already exists';
        } else {
          this.emailError = 'An error occurred while checking the email';
        }
      }
    );
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
    }
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Prevent spaces in specific fields
  preventSpace(event: KeyboardEvent): void {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  // Prevent consecutive spaces
  preventConsecutiveSpaces(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement;
    if (event.key === ' ' && target.value.endsWith(' ')) {
      event.preventDefault();
    }
  }

  // Prevent special characters
  preventSpecialCharacters(event: KeyboardEvent): void {
    const key = event.key;
    if (/[^a-zA-Z0-9]/.test(key)) {
      event.preventDefault();
    }
  }

  // Redirect to login
  login(): void {
    this.router.navigate(['']);
  }
}