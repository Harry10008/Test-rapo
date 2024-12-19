import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

private apiUrl = 'http://localhost:3001/user'
  constructor(private http:HttpClient) { }


  postData(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save`, data);
  }

  updateUser(id: number, userData: any) {
    return this.http.patch(`http://localhost:3001/user/edit/${id}`, userData);
  }
  
  checkemail(){

  }

  verify(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify/${token}`);
  }
  
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  getData(role: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/fetch`);
  }


  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }
  

  deleteData(id: any) {
    return this.http.delete<any>(`${this.apiUrl}/delete`, {
      body: { id }
    });
  }

  
}
