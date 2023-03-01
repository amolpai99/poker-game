import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { baseURL } from '../shared/baseurl';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class CardsService {
  cards: {};
  socket = io(baseURL);

  constructor(
    private httpClient: HttpClient) {
      this.cards = {};
    }

  getCards(playerName: string): Observable<number[]> {
    let cardsObservable = new Observable<number[]>((observer) => {
      this.socket.on('get_cards', (new_cards) => {
        console.log(new_cards)
        observer.next(new_cards[playerName])
      })
    })
    return cardsObservable;
  }

  generateCards(numPlayers: number) {
    // this.httpClient.post(baseURL + "cards?num_players=" + numPlayers.toString(), null)
    //                .subscribe((cards) => this.cards = cards["cards"]);
    this.socket.emit('generate', numPlayers);
    return
  }

  getWinner(): Observable<any> {
    let pokerObservable = new Observable((observer) => {
      this.socket.on('winner', (winner) => {
        observer.next(winner)
      })
    })
    return pokerObservable
  }
}
