import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { baseURL } from '../shared/baseurl';
import { Cards } from '../shared/card_templates';
import { ProcessHttpmsgService } from './process-httpmsg.service';

@Injectable({
  providedIn: 'root'
})
export class CardsService {
  cards = {};

  constructor(
    private httpClient: HttpClient,
    private processMessage: ProcessHttpmsgService) {
    this.cards = {};
  }

  getCards(playerName: string): Observable<Cards> {
    return this.httpClient.get<Cards>(baseURL + "get_cards?player=" + playerName)
           .pipe(catchError(this.processMessage.handleError));
  }

  generateCards(numPlayers: number) {
    return this.httpClient.get(baseURL + "generate?num_players=" + numPlayers.toString()).subscribe();
  }
}
