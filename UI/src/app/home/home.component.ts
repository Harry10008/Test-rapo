import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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
  lastKeyPressed: string | null = null;
  citiesByState: { [key: string]: string[] } = {
    'Madhya Pradesh': ['Bhopal', 'Indore','Ujjain'],
    'Gujarat': ['Ahmedabad', 'Gandhinagar','Surat'],
    'Maharastra':['Mumbai','Pune','Nagpur']
  };
  filteredCities: string[] = [];
  


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.isUserLoggedIn = true;
    }

    this.registerform = this.fb.group(
      {
        first_name: [
          '',
          [
            Validators.required,
            //Validators.pattern('^[a-zA-Z\s]*$'),  // Allow only alphabets and spaces
            Validators.minLength(3),
            Validators.maxLength(50),
          ],
        ],
        last_name: [
          '',
          [
            Validators.required,
            Validators.pattern('^[a-zA-Z\s]*$'),
            Validators.minLength(3),
            Validators.maxLength(30),
          ],
        ],
        email: [
          '',
          [Validators.required, Validators.email, Validators.maxLength(50),
          Validators.pattern(/^\S+@\S+\.\S+$/)]
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
        state: ['', Validators.required],
        city: ['', [Validators.required]],
        address: ['', [Validators.required, Validators.maxLength(100)]],
        pin_code: ['', [
          Validators.required,
          Validators.maxLength(6),
          Validators.pattern('^[0-9]{6}$')
        ]],
        country: ['', [Validators.required]],
        user_name: ['', [Validators.required, Validators.maxLength(30)]],
        image: [null, [Validators.required]],
        gender: ['', [Validators.required]],
        role: ['', [Validators.required]],
        short_bio: ['',[Validators.required, Validators.minLength(15), Validators.maxLength(250)],],
      },
      { validator: this.passwordMatchValidator }
    );

    if (history.state && history.state.user) {
      const { user, editIndex } = history.state;
      if (user && editIndex !== undefined) {
        this.editIndex = editIndex;
        this.registerform.patchValue({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          mobile: user.mobile,
          city: user.city,
          country: user.country,
          address: user.address,
          state: user.state,
          gender: user.gender,
          role: user.role,
          short_bio: user.short_bio,
          isVarified:user.verified
        });
        this.filteredCities = this.citiesByState[user.state] || [];
      }
    }
  }

  onSubmit(): void {
    const formData = new FormData();
    formData.append('first_name', this.registerform.get('first_name')?.value);
    formData.append('last_name', this.registerform.get('last_name')?.value);
    formData.append('email', this.registerform.get('email')?.value);
    formData.append('user_name', this.registerform.get('user_name')?.value);
    formData.append('password', this.registerform.get('password')?.value || '');
    formData.append('mobile', this.registerform.get('mobile')?.value);
    formData.append('address', this.registerform.get('address')?.value);
    formData.append('city', this.registerform.get('city')?.value);
    formData.append('pin_code', this.registerform.get('pin_code')?.value);
    formData.append('state', this.registerform.get('state')?.value);
    formData.append('country', this.registerform.get('country')?.value);
    formData.append('role', this.registerform.get('role')?.value);
    formData.append('gender', this.registerform.get('gender')?.value);
    formData.append('short_bio', this.registerform.get('short_bio')?.value);

    if (this.selectedImage) {
      formData.append('imageName', this.selectedImage, this.selectedImage.name);
    }

    if (this.editIndex !== undefined) {
      formData.append('editIndex', this.editIndex.toString());
    }

    this.apiService.postData(formData).subscribe(
      (response) => {
        this.toastr.info('Please verify through your Email before login.');
        this.resetform();
        this.router.navigate(['']);
      },
      (error) => {
        console.log(error)
        console.error('Error submitting form', error);
        this.toastr.error(
          error.error.message

        );
      }
    );
  }

  myFunction(): void {
    const x = document.getElementById('password') as HTMLInputElement;
    if (x.type === 'password') {
      x.type = 'text';
    } else {
      x.type = 'password';
    }
  }

  preventNumbers(event: KeyboardEvent): void {
    const key = event.key;
    if (/\d/.test(key)) {
      event.preventDefault();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  preventAlphabets(event: KeyboardEvent): void {
    const key = event.key;
    if (/[a-zA-Z]/.test(key)) {
      event.preventDefault();
    }
  }

  preventSpace(event: KeyboardEvent): void {
    if (event.key === ' ') {
      event.preventDefault(); // Prevent space from being typed
    }
  }
  
  preventConsecutiveSpaces(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement;
  
    if (event.key === ' ' && target.value.endsWith(' ')) {
      event.preventDefault(); // Prevent typing if the last character is already a space
    }
  }
  
  preventSpecialCharacters(event: KeyboardEvent): void {
    const key = event.key;
    if (/[^a-zA-Z0-9]/.test(key)) {
      event.preventDefault();
    }
  }

  login(): void {
    this.router.navigate(['']);
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
    }
  }

  resetform(): void {
    this.registerform.reset();
    this.selectedImage = null;
  }

  

  onStateChange(event: any): void {
    const selectedState = event.target.value;
    this.filteredCities = this.citiesByState[selectedState] || [];
    this.registerform.controls['city'].setValue(''); 
  }
}