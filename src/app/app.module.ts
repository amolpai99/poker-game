import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CardComponent } from './card/card.component';
import { HandComponent } from './hand/hand.component';
import { TableComponent } from './table/table.component';
import { CardsService } from './services/cards.service';
import { PokerHandComponent } from './poker-hand/poker-hand.component';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    HandComponent,
    TableComponent,
    PokerHandComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    FlexLayoutModule
  ],
  providers: [
    CardsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
