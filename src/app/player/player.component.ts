import { Component, Input, SimpleChanges } from '@angular/core';
import { GameService } from '../services/game.service';
import { ClientService } from '../services/client.service';
import { Timer } from '../utils/timer';
import { Slider } from '../utils/slider';
import { PlayerDetails } from '../shared/objects';
import { PLAYER_STATES } from '../shared/states';
import { betting, cards, constants } from '../shared/constants';


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
  @Input('player_id') playerId: string;

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
  enableBetting: boolean;
  minBetAmount = 100;
  maxBetAmount = 100000;
  betAmount: number = this.minBetAmount;
  totalBetAmount: number = 100;

  checkOrCall = betting.CHECK;
  betOrRaise = betting.BET;
  fold = betting.FOLD;

  // Timer specific data
  timer: Timer;
  totalTime: number = 15;

  // Slider specific data
  slider: Slider;
  enableSlider: boolean;

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
    this.timer = new Timer(this.playerId, this.totalTime);

    // Slider object for betting amount
    if(this.isMainPlayer)
      this.slider = new Slider(this.playerId, this.minBetAmount, this.maxBetAmount, this.betAmount);

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

  isPlayer(): boolean {
    return (this.playerId != "") && (this.playerType != "table");
  }

  processState(state: string, data: any) {
    switch(state) {
      case PLAYER_STATES.GET_CARDS:
        this.cards = data["cards"]
        console.log("PlayerComponent:", "Player ID:", this.playerId, "Got cards:", this.cards)
        break;
      
      case PLAYER_STATES.OPEN_CARDS:
        if(this.playerId == constants.TABLE_ID) {
          let card = data["card"]
          if(card == cards.TURN) {
            this.openCards[3] = "true"
          }
          else if(card == cards.RIVER) {
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
        let currentBetAmount = data["amount"]
        if(currentBetAmount == 0) {
          this.minBetAmount = 100;
          this.checkOrCall = betting.CHECK
          this.betOrRaise = betting.BET
        }
        else {
          this.minBetAmount = currentBetAmount
          this.checkOrCall = betting.CALL
          this.betOrRaise = betting.RAISE
        }

        this.betAmount = this.minBetAmount;

        this.enableBetting = true
        this.timer.startTimer()
        break;

      case PLAYER_STATES.UPDATE_STACK:
        console.log("PlayerComponent:", "Player ID:", this.playerId, "Updating stack of player", this.playerId)
        let amount = data["amount"];
        this.playerStack -= amount;
        this.maxBetAmount = this.playerStack;
        this.stopTimerAndDisableBetting();
      }
  }

  sendState(state: string, data: any) {
    let currentStateData = {};
    currentStateData[this.playerId] = {
      "state": state,
      "data": data,
    }

    this.client.sendCurrentState(currentStateData);
  }

  stopTimerAndDisableBetting() {
    if(this.isMainPlayer) {
      this.slider.reset();
      this.slider.updateMaxAmount(this.maxBetAmount); 
    }
    this.timer.stopTimer();

    this.enableSlider = false;
    this.enableBetting = false;
  }

  checkOrCallAction() {
    console.log("PlayerComponent: Placing new action: ", this.checkOrCall)
    let data = {
      "action": this.checkOrCall.toLowerCase()
    }

    this.stopTimerAndDisableBetting();
    this.sendState(PLAYER_STATES.BET_PLACED, data);
  }

  betOrRaiseAction() {
    if(!this.enableSlider) {
      this.enableSlider = true
      return
    }

    console.log("PlayerComponent: Placing new action", this.betOrRaise)

    let data = {
      "action": this.betOrRaise.toLowerCase(),
      "amount": this.betAmount
    }

    this.stopTimerAndDisableBetting();
    this.sendState(PLAYER_STATES.BET_PLACED, data)
  }

  foldAction() {
    console.log("PlayerComponent: Placing new action", this.fold)

    let data = {
      "action": this.fold.toLowerCase()
    }

    this.stopTimerAndDisableBetting();
    this.sendState(PLAYER_STATES.BET_PLACED, data);
  }

  onAmountChange(event: any) {
    let target = event.target;
    if(target.value) {
      this.betAmount = target.valueAsNumber;
      this.slider.changeColor(target.valueAsNumber);
    }
  }


  // <-------------------View-Related functions------------------->
  getHandClass() {
    if(this.openPlayerCards) {
      return this.playerClass+"_cards_open"
    }
    return this.playerClass+"_cards"
  }
}
