import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const MAX_PLAYERS = 11
const DEBUG = false

const MOCK: GameDetails = {
  gameId: "mock",
  playerId: "player0",
  allPlayers: {
    "player0": {
      "name": "table"
    },
    "player1": {
      name: "gamer32116",
    },
    "player2": {
      name: "abolipai"
    }
  },
  isCreator: true
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private _gameDetails: GameDetails;
  private _tableId: string = "player0";
  private _playerObservables: BehaviorSubject<any>[];

  constructor() {
    if(DEBUG) {
      this._gameDetails = MOCK;
    }
  }

  /* <----------- GETTERS -----------> */
  // Get the game name property
  get gameId(): string {
    return this._gameDetails.gameId;
  }

  get mainPlayerId(): string {
    return this._gameDetails.playerId;
  }

  get tableId(): string {
    return this._tableId;
  }

  get playerIds(): string[] {
    let ids = Array(MAX_PLAYERS).fill("");
    let index = 0;
    for(let playerId in this._gameDetails.allPlayers) {
      if(playerId != this.tableId) {
        console.log("GameService: ", "Pushing id: ", playerId)
        ids[index] = playerId
        index++;
      }
    }

    let mainPlayerIndex = ids.indexOf(this.mainPlayerId);
    if(mainPlayerIndex != -1) {
      let rotated = ids.splice(0, mainPlayerIndex)
      ids = ids.concat(rotated)
    }

    console.log("GameService: ", "All player ids: ", ids)
    return ids;
  }

  // Get all player names
  get players(): {[id: string]: PlayerDetails} {
    return this._gameDetails.allPlayers;
  }

  getPlayer(id: string): PlayerDetails {
    if(id in this._gameDetails.allPlayers) {
      console.log("GameService: ", "Player found with id: ", id, " | Player: ", this._gameDetails.allPlayers[id])
      return this._gameDetails.allPlayers[id]
    }
    console.log("GameService: ", "Player with id: ", id, " not found")
    return {name: ""}
  }

  // Get if the player is creator of game
  get isCreator(): boolean {
    return this._gameDetails.isCreator;
  }

  get gameDetails(): GameDetails {
    return this._gameDetails;
  }

  /* <----------- SETTERS -----------> */
  set gameDetails(gameDetails: GameDetails) {
    for(let player in gameDetails.allPlayers) {
      let playerDetails = gameDetails.allPlayers[player]
      let playerObs = new BehaviorSubject<any>(null);
      playerDetails._behaviour = playerObs;
      playerDetails.obs$ = playerObs.asObservable();
    }
    this._gameDetails = gameDetails
  }

  set mainPlayerId(id: string) {
    this._gameDetails.playerId = id;
  }

  addPlayer(playerData: any) {
    let newPlayer: PlayerDetails = {
      name: playerData["name"],
    }
    
    let playerObs = new BehaviorSubject<any>(null);
    newPlayer._behaviour = playerObs;
    newPlayer.obs$ = playerObs.asObservable();

    this._gameDetails.allPlayers[playerData.id] = newPlayer
  }

  setNewState(data: any) {
    console.log("GameService:", "Got new data: ", data)
    for(let player in data) {
      let playerDetails = this._gameDetails.allPlayers[player];
      playerDetails._behaviour?.next(data[player]);
    }
  }

}


export class GameDetails {
  gameId: string;
  playerId: string;
  isCreator: boolean;
  allPlayers: {[id: string]: PlayerDetails};
}

export class PlayerDetails {
  name: string;
  cards?: number[];
  _behaviour?: BehaviorSubject<any>;
  obs$?: Observable<any>
}
