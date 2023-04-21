import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { baseURL } from '../shared/baseurl';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private _gameDetails: GameDetails;
  socket: Socket;

  constructor() {
  }

  set gameDetails(gameDetails: GameDetails) {
    this._gameDetails = gameDetails
    this.socket = io(baseURL + this.gameId)
  }

  // Get the game name property
  get gameId(): string {
    return this._gameDetails.gameId;
  }
  
  // Get the name of the primary player
  get playerName(): string {
    return this._gameDetails.primaryPlayer;
  }

  get players(): string[] {
    return this._gameDetails.players;
  }

  get isCreator(): boolean {
    return this._gameDetails.isCreator;
  }

  onNewPlayerJoined(): Observable<string> {
    let obs = new Observable<string>((observer) => {
      this.socket.on("new_player", (data) => {
        console.log("New player joined: ", data)
        this._gameDetails.players.push(this.playerName)
        observer.next(data["player_name"])
      })
    })

    return obs
  }

}


export class GameDetails {
  gameId: string;
  primaryPlayer: string;
  isCreator: boolean;
  players: string[];
}