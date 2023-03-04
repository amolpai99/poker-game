import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { baseURL } from '../shared/baseurl';
import { io, Socket } from 'socket.io-client';
import { ProcessHttpmsgService } from './process-httpmsg.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class CardsService {
  cards: {};
  socket: Socket;
  gameDetails: {};

  constructor(
    private httpClient: HttpClient,
    private processMessage: ProcessHttpmsgService) {
      this.cards = {};
      this.gameDetails = {};
      this.socket = io(baseURL);
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
    console.log("Emit function called for generateCards")
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

  createGame(username: string): Observable<any> {
    let data = {
      "username": username
    }

    return this.httpClient.post(baseURL + "create", data, httpOptions)
           .pipe(catchError(this.processMessage.handleError))
  }

  joinGame(username: string, game_name: string): Observable<any> {
    let data = {
      "username": username,
      "game_name": game_name
    }

    return this.httpClient.post(baseURL + "join", data, httpOptions)
           .pipe(catchError(this.processMessage.handleError))
  }
 
  getGameDetails() {
    console.log("Getting game details")
    let gamesObservable = new Observable<any>((observer) => {
      this.socket.on('game_details', (gameDetails) => {
        console.log("Game details:", gameDetails)
        observer.next(gameDetails)
      })
    })

    return gamesObservable;
  }

}
