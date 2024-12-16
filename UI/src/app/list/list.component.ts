import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  p: number = 1;
  storedData: any[] = [];
  roles: string[] = [];
  selectedRole: string = 'all-users'; 
  userRole: string = '';
  data: any = [];
  user:any=[]
  sortBy: string = '';  // To track the column to sort
  sortOrder: boolean = true;  // To track sort order (true = ascending, false = descending)

  constructor(
    private router: Router,
    private apiService: ApiService,
    private Toastr:ToastrService
  ) {}

  ngOnInit(): void {
    
    this.loadData();
    this.userRole = localStorage.getItem('role') || '';
    this.user = localStorage.getItem('user')
  }

  logout() {
    this.router.navigate(['login']);
  }

  sortUsers(): void {
    if (!this.sortBy) return; // If no column selected for sorting

    this.storedData.sort((a, b) => {
      let comparison = 0;

      if (a[this.sortBy] < b[this.sortBy]) {
        comparison = -1;
      } else if (a[this.sortBy] > b[this.sortBy]) {
        comparison = 1;
      }

      return this.sortOrder ? comparison : -comparison;  // Handle ascending/descending order
    });
  }


  // Toggle sort order
  toggleSortOrder(column: string): void {
    if (this.sortBy === column) {
      // Toggle order if already sorting by this column
      this.sortOrder = !this.sortOrder;
    } else {
      // Start with ascending order if sorting by a new column
      this.sortBy = column;
      this.sortOrder = true;
    }
    this.sortUsers();
  }

  loadData(): void {
    this.apiService.getData(this.selectedRole).subscribe(data => {
      console.log(this.storedData)
      this.storedData = data.data;
      
    });
  }

  editUser(id: number): void {
    const userToEdit = this.storedData.find((u: any) => u.id === id);
    
    if (userToEdit) {
      this.router.navigate(['/edit-user'], {
        state: { user: userToEdit },
      });
    } else {
      this.Toastr.error('User not found!');
    }
  }
  


  deletelUser(id: any): void {
    this.apiService.deleteData(id).subscribe({
      next: (response) => {
        console.log('User deleted:', response);
        this.Toastr.info("User deleted Successfully ")
        this.loadData();
        
      },
      error: (error) => {
        console.error('Error deleting user:', error);
      }
    });
  }


  deleteUser(id: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to Delete?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'No, Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteData(id).subscribe({
          next: (response) => {
            console.log('User deleted:', response);
            this.Toastr.info(response.message)
            this.loadData();
            //this.Toastr.info('userdeleted successfully');
            
          },
          error: (error) => {
            console.error('Error deleting user:', error);
          }
        });
        
      }
    });

  }


}
