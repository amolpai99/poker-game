import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { baseURL } from '../shared/baseurl';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private _gameDetails: GameDetails;

  constructor() {
  }

  /* <----------- GETTERS -----------> */
  // Get the game name property
  get gameId(): string {
    return this._gameDetails.gameId;
  }
  
  // Get the name of the primary player
  get playerName(): string {
    return this._gameDetails.player.name;
  }

  get playerId(): string {
    return this._gameDetails.player.id;
  }

  // Get all player names
  get players(): any[] {
    return this._gameDetails.allPlayers;
  }

  // Get if the player is creator of game
  get isCreator(): boolean {
    return this._gameDetails.isCreator;
  }

  /* <----------- SETTERS -----------> */
  set gameDetails(gameDetails: GameDetails) {
    this._gameDetails = gameDetails
  }

}


export class GameDetails {
  gameId: string;
  player: any;
  isCreator: boolean;
  allPlayers: any[];
}