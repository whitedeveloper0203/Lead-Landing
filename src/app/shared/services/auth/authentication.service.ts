import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User } from '../../models';
import { first } from 'rxjs/operators';
import 'rxjs/add/operator/map'

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    public currentUserSubject: BehaviorSubject<User>
    public currentUser: Observable<User>
    public __User: User
    constructor(private http: HttpClient) {
        // if (localStorage.getItem("currentUser") === null) {
        //     this.login().pipe(first()).subscribe(user=>{
        //         this.currentUserSubject.next(user)
        //     })
        // } else{ 
        //     this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')))
        //     this.currentUser = this.currentUserSubject.asObservable();
        // }
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(): Observable<any> {

        if (localStorage.getItem("currentUser") !== null) {
           return this.currentUser
        }
        else{
            const body = new HttpParams()
            .set('org_id', environment.org_id)
            .set('username', environment.username)
            .set('password', environment.password)

            return this.http.post<any>(`https://${environment.base_url}/api/1.0/login.php`, body.toString(), 
                { headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')})
                .pipe(map(user => {
                    // login successful if there's a jwt token in the response
                    if (user && user.access_token) {
                        localStorage.setItem('currentUser', JSON.stringify(user))
                        this.currentUserSubject.next(user)
                        return user
                    }
                }))
        }
    }

    get_objects(api_url): Observable<any>{
        this.currentUser.subscribe(user => {
            this.__User = user
        })
        let queryURL = `https://${environment.base_url}/api/1.0/index.php/${api_url}/all?access_token=` + this.__User.access_token;
        let headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        let optionsH = {
            headers:headers
        };
        return this.http.get( queryURL, optionsH ).map((res: any) => res );
    }

    get_object_fields(tableName): Observable<any>{
        let queryURL = `https://${environment.metadata_url}/index.php/crud?tableName=${tableName}&stage=${environment.stage}`
        let headers = new HttpHeaders();
        headers.append('Accept', 'application/json');
        let optionsH = {
            headers:headers
        };
        return this.http.get( queryURL, optionsH ).map((res: any) => res);
    }

    add_object(form, api_url): Observable<any> {
        this.currentUser.subscribe(user => {
            this.__User = user
        })
        let body = {base_url: environment.base_url, api_url: api_url, access_token: this.__User.access_token, form: JSON.stringify(form)}
        return this.http.post( `${environment.server_url}/hipaa/create`, body).map((res: any) => res)
    }
}