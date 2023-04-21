import { io, Socket } from 'socket.io-client';
import { catchError, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProcessHttpmsgService } from './process-httpmsg.service';
import { baseURL } from '../shared/baseurl';
import { Injectable } from '@angular/core';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};


@Injectable({
  providedIn: 'root'
})
export class ClientService {
  cards: {};
  gameDetails: {};

  constructor(
    private httpClient: HttpClient,
    private processMessage: ProcessHttpmsgService) {
      this.cards = {};
      this.gameDetails = {};
    }

  getCards(): Observable<number[]> {
    let cardsObservable = new Observable<number[]>((observer) => {
      // this.socket.on('get_cards', (new_cards) => {
      //   observer.next(new_cards)
      // })
    })
    return cardsObservable;
  }

  generateCards(gameName: string) {
    // this.socket.emit('generate', gameName);
    return
  }

  getWinner(): Observable<any> {
    let pokerObservable = new Observable((observer) => {
      // this.socket.on('winner', (winner) => {
      //   observer.next(winner)
      // })
    })
    return pokerObservable
  }
 
  createOrJoinGame(data: any): Observable<any> {
    return this.httpClient.post(baseURL + 'game', data, httpOptions)
           .pipe(catchError(this.processMessage.handleError))
  }

  getGameDetails() {
    let gamesObservable = new Observable<any>((observer) => {
      // this.socket.on('game_details', (gameDetails) => {
      //   console.log("Game details:", gameDetails)
      //   observer.next(gameDetails)
      // })
    })
    return gamesObservable;
  }
}
