import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';

import { Http, HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from './shared/services/auth/authentication.service'
import { HttpClientModule } from '@angular/common/http'; 
import { HTTP_INTERCEPTORS }      from '@angular/common/http';
import { ErrorInterceptor }         from './shared/helpers/error.interceptor';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpModule,
    SharedModule,
    HttpClientModule,
  ],
  providers: [
    AuthenticationService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
