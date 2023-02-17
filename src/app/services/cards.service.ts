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
  cards: {};

  constructor(
    private httpClient: HttpClient) {
      this.cards = {};
  }

  getCards(playerName: string): Observable<number[]> {
    let cardsObservable = new Observable<number[]>((observer) => {
      setInterval(() => {
        let playerCards = this.cards[playerName]
        observer.next(playerCards)
      }, 100);
    })
    return cardsObservable;
  }

  generateCards(numPlayers: number) {
    this.httpClient.post(baseURL + "cards?num_players=" + numPlayers.toString(), null)
                   .subscribe((cards) => this.cards = cards["cards"]);
    return
  }

  getWinner(): Observable<any> {
    return this.httpClient.get(baseURL + "get_winner")
  }
}
