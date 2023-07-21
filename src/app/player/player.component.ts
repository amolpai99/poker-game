import { Component, Input } from '@angular/core';
import { GameService } from '../services/game.service';
import { ClientService } from '../services/client.service';
import { Timer } from '../utils/timer';
import { Slider } from '../utils/slider';
import { PlayerDetails } from '../shared/objects';
import { PLAYER_STATES } from '../shared/states';


@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent {
  // playerType indicates whether the player is the main player, table or a secondary player
  @Input('type') playerType: string = "secondary";
  // player details containing name, id and class of the player
  @Input('player_class') playerClass: string;
  @Input('player_id') playerId: string = "player1";

  player: PlayerDetails;
  playerStack: number = 0;
  mainPlayerId: string;
  isMainPlayer: boolean;

  // Cards of the player
  cards: number[] | undefined;

  // array to determine which cards to open
  openCards: string[] = [];
  // openPlayerCards denotes if the cards have been opened
  openPlayerCards: boolean;

  // Betting specific data
  enablePlaceBet: boolean;
  minBetAmount = 100;
  maxBetAmount = 100000;
  betAmount: number = this.minBetAmount;

  // Timer specific data
  timer: Timer;
  totalTime: number = 15;

  // Slider specific data
  slider: Slider;

  constructor(
    private client: ClientService,
    private gameService: GameService) {
  }

  ngOnInit() {
    this.player = this.gameService.getPlayer(this.playerId);
    this.playerStack = this.player.stack;
    this.maxBetAmount = this.playerStack;
  
    this.mainPlayerId = this.gameService.mainPlayerId;
    this.isMainPlayer = (this.playerId == this.mainPlayerId);
    this.cards = this.player.cards;

    // Timer object
    this.timer = new Timer(this.playerClass, this.totalTime);

    // Slider object for betting amount
    this.slider = new Slider(this.minBetAmount, this.maxBetAmount, this.betAmount);

    console.log("PlayerComponent: ", "Player ID: ", this.playerId, " | Player: ", this.player);

    // TODO: Move this to separate function which will get called when new game starts
    switch(this.playerType) {
      case "secondary": 
        this.openCards = ["false", "false"]
        break
      case "primary":
        this.openCards = ["true", "true"]
        break
      case "table":
        this.openCards = ["true", "true", "true", "false", "false"]
    }

    this.player.obs$?.subscribe((params) => {
      if(params) {
        console.log("PlayerComponent:", "Player ID:", this.playerId, "Received params", params)
        for(let player_data of params) {
          let state = player_data.state
          let data = player_data.data
          console.log("PlayerComponent: ", "Player ID:", this.playerId, "State: ", state, "Data:", data)
          this.processState(state, data)
        }
      }
    })
  }

  processState(state: string, data: any) {
    switch(state) {
      case PLAYER_STATES.GET_CARDS:
        this.cards = data["cards"]
        console.log("PlayerComponent:", "Player ID:", this.playerId, "Got cards:", this.cards)
        break;
      
      case PLAYER_STATES.OPEN_CARDS:
        if(this.playerId == "player0") {
          let card = data["card"]
          if(card == "turn") {
            this.openCards[3] = "true"
          }
          else if(card == "river") {
            this.openCards[4] = "true"
          }
        }
        else {
          this.openCards = ["true", "true"]
          this.openPlayerCards = true
        }
        break;

      case PLAYER_STATES.PLACE_BET:
        console.log("PlayerComponent", "Player ID:", this.playerId, "Received state:", state, "Starting Timer")
        this.enablePlaceBet = true
        this.timer.startTimer()
        break;

      case PLAYER_STATES.UPDATE_STACK:
        console.log("PlayerComponent:", "Player ID:", this.playerId, "Updating stack of player", this.playerId)
        if(this.isMainPlayer) {
          console.log("PlayerComponent: ", "Main player. Not updating stack")
          break;
        }
        this.updateStackAndStopTimer();
      }
  }

  updateStackAndStopTimer() {
    this.playerStack -= this.betAmount;
    this.enablePlaceBet = false;
    this.timer.stopTimer();

    if(this.isMainPlayer)
      this.slider.reset();
  }

  placeBet() {
    console.log("PlayerComponent: Placing a new bet")

    let state = {}
    state[this.playerId] = {
      "state": PLAYER_STATES.BET_PLACED,
      "data": {
        "amount": this.betAmount
      }
    }
    
    this.client.sendCurrentState(state)
    this.updateStackAndStopTimer();
    this.maxBetAmount = this.playerStack;
  }

  getHandClass() {
    if(this.openPlayerCards) {
      return this.playerClass+"_cards_open"
    }
    return this.playerClass+"_cards"
  }

  onAmountChange(event: any) {
    let target = event.target;
    if(target.value) {
      this.betAmount = target.value;
      this.slider.changeColor(target.value);
    }
  }
}
