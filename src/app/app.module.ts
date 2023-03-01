import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppRoutingModule } from './app-routing/app-routing.module';
import { AppComponent } from './app.component';
import { CardComponent } from './card/card.component';
import { HandComponent } from './hand/hand.component';
import { TableComponent } from './table/table.component';
import { CardsService } from './services/cards.service';
import { baseURL } from './shared/baseurl';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    HandComponent,
    TableComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    FlexLayoutModule,
    HttpClientModule,
    SocketIoModule,
    FormsModule
  ],
  providers: [
    CardsService,
    { provide: 'BaseURL', useValue: baseURL }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
