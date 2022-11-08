import { HttpClient } from "@angular/common/http";
import { ThisReceiver } from "@angular/compiler";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { response } from "express";
import { Subject } from "rxjs";
import { AuthData } from "./auth-data.model";

@Injectable({providedIn: "root"})

export class AuthService
{
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private authStatusListener = new Subject<boolean>()

  constructor(private http: HttpClient, private router: Router) {}

  getToken()
  {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId()
  {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

 createUser(email: string, password: string) {
  const authData:  AuthData = {email:email, password:password};
  this.http.post("http://localhost:3000/api/user/signup", authData)
  .subscribe(response => {
    console.log(response);
  })
 }

 login(email:string,password:string)
 {
  const authData:  AuthData = {email:email, password:password};
  this.http.post<{token: string, expiresIn: number, userId: string}>("http://localhost:3000/api/user/login",authData)
  .subscribe(response => {
    const token = response.token;
    this.token = token;
    if(token){
      const expiresInDuration = response.expiresIn;
      this.setAuthTimer(expiresInDuration);
      this.isAuthenticated = true;
      this.userId = response.userId;
      this.authStatusListener.next(true);
      const currentDate = new Date();
      const expirationDate = new Date(currentDate.getTime() + expiresInDuration * 1000);
      this.saveAuthData(token,expirationDate, this.userId);
      this.router.navigate(['/']);
    }
  })
 }

 autoAuthUser() {
  const authInfo = this.getAuthData();
  if(!authInfo)
  {
    return;
  }
  const now = new Date();
  const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
  if(expiresIn > 0)
  {
    this.token = authInfo.token;
    this.isAuthenticated = true;
    this.userId = authInfo.userId;
    this.setAuthTimer(expiresIn / 1000);
    this.authStatusListener.next(true);
  }
}

 logout() {
  this.token = null;
  this.isAuthenticated = false;
  this.authStatusListener.next(false);
  this.userId = null;
  clearTimeout(this.tokenTimer);
  this.clearAuthData();
  this.router.navigate(['/']);
 }

 private setAuthTimer(duration: number)
 {
  console.log("Setting timer:" + duration);
  this.tokenTimer = setTimeout(() => {
    this.logout();
  }, duration * 1000) //Timeout works in miliseconds
 }

 private saveAuthData(token:string, expirationDate: Date, userId:string)
 {
  localStorage.setItem('token', token);
  localStorage.setItem('expiration', expirationDate.toISOString()),
  localStorage.setItem('userId', userId)
 }

 private clearAuthData()
 {
  localStorage.removeItem("token");
  localStorage.removeItem("expiration");
  localStorage.removeItem("userId");
 }

 private getAuthData() {
  const token = localStorage.getItem("token");
  const expirationDate = localStorage.getItem("expiration");
  const userId = localStorage.getItem("userId");
  if(!token || !expirationDate)
  {
    return;
  }
  return{
    token: token,
    expirationDate: new Date(expirationDate),
    userId: userId
  };
 }

}