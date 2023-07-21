import { Component, Input } from '@angular/core';
import { GameService, PlayerDetails } from '../services/game.service';
import { ClientService } from '../services/client.service';
import { Timer } from '../utils/timer';
import { Slider } from '../utils/slider';


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

  // Cards of the player
  cards: number[] | undefined;

  // array to determine which cards to open
  openCards: string[] = [];
  // openPlayerCards denotes if the cards have been opened
  openPlayerCards: boolean;

  // Timer specific data
  startTimer: boolean;
  timer: Timer;
  totalTime: number = 15;

  // Slider specific data
  slider: Slider;
  minBetAmount = 100;
  maxBetAmount = 100000;
  betAmount: number = this.minBetAmount;

  constructor(
    private client: ClientService,
    private gameService: GameService) {
  }

  ngOnInit() {
    // Timer object
    this.timer = new Timer(this.playerClass, this.totalTime);

    // Slider object for betting amount
    this.slider = new Slider(this.minBetAmount, this.maxBetAmount, this.betAmount);
  
    this.player = this.gameService.getPlayer(this.playerId);
    this.playerStack = this.player.stack;
    this.mainPlayerId = this.gameService.mainPlayerId;
    this.cards = this.player.cards;

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
      case "get_cards":
        this.cards = data["cards"]
        console.log("PlayerComponent:", "Player ID:", this.playerId, "Got cards:", this.cards)
        break;
      
      case "open_cards":
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

      case "place_bet":
        console.log("PlayerComponent", "Player ID:", this.playerId, "Received state:", state, "Starting Timer")
        this.startTimer = true
        // Need to start the timer after a small timeout to let the timer element get formed
        setTimeout(() => {
          this.timer.startTimer()
        }, 100)
        break;

      case "update_stack":
        console.log("PlayerComponent:", "Player ID:", this.playerId, "Updating stack of player", this.playerId)
        this.playerStack -= this.betAmount;
        this.startTimer = false;
        this.timer.stopTimer();
      }
  }

  placeBet() {
    console.log("PlayerComponent: Placing a new bet")

    this.timer.stopTimer()
    this.startTimer = false

    let state = {}
    state[this.playerId] = {
      "state": "bet_placed",
      "data": {
        "amount": this.betAmount
      }
    }
    
    this.client.sendCurrentState(state)
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
