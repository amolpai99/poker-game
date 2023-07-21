import { BehaviorSubject, Observable } from "rxjs";

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
    obs$?: Observable<any>;
    stack: number;
  }
  