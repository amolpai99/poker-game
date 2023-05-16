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
  private _socket: Socket;

  constructor(
    private httpClient: HttpClient,
    private processMessage: ProcessHttpmsgService) {
      this.cards = {};
      this.gameDetails = {};
  }

  // Open socket
  setSocket(gameId: string) {
    this._socket = io(baseURL + gameId)
  }

  // HTTP call for creating / joining new game
  createOrJoinGame(data: any): Observable<any> {
    return this.httpClient.post(baseURL + 'game', data, httpOptions)
           .pipe(catchError(this.processMessage.handleError))
  }

  // Player will be informed using this function when new player joins game
  onNewPlayerJoined(): Observable<any> {
    let obs = new Observable<any>((observer) => {
      this._socket.on("new_player", (data) => {
        observer.next(data)
      })
    })

    return obs
  }

  // // Creator of game will call this for generating new cards for new game
  // generateCards(newRound?: boolean) {
  //   let data: any;
  //   if(newRound) {
  //     data = {"new_round": newRound}
  //   }
  //   this._socket.emit("generate_cards", data, (response: any) => {
  //     return response
  //   })
  // }

  // // All players will use this function to get cards of all players
  // getCards(): Observable<any> {
  //   let obs = new Observable<any>((observer) => {
  //     this._socket.on("get_cards", (playerDetails: any) => {
  //       observer.next(playerDetails)
  //     })
  //   })

  //   return obs
  // }

  // // This function will be called at the end to open all player cards
  // openPlayerCards(): Observable<any> {
  //   let obs = new Observable<any>((observer) => {
  //     this._socket.on("open_player_cards", (data: any) => {
  //       observer.next(data)
  //     })
  //   })

  //   return obs
  // }

  // // This function is used to open flop and river cards
  // openTableCards(): Observable<any> {
  //   let obs = new Observable<any>((obs) => {
  //     this._socket.on("open_table_cards", (data: any) => {
  //       obs.next(data)
  //     } )
  //   })

  //   return obs
  // }

  sendCurrentState(data: any) {
    console.log("ClientService:", "Sending current state:", data)
    this._socket.emit("current_state", data, (response: any) => {
      return response
    })
  }

  getNewState(): Observable<any> {
    let obs = new Observable<any>((obs) => {
      this._socket.on("next_state", (data: any) => {
        console.log("ClientService: ", "Got next state: ", data)
        obs.next(data)
      })
    })
    return obs
  }

  // sendData() {
  //   this._socket.emit("open_cards")
  // }

}
