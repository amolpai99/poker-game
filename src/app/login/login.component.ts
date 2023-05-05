import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../services/client.service';
import { GameDetails, GameService } from '../services/game.service';


var ids = ["p1", "p2", "p3", "p4", "p5"]
var colorCodes = ["#0909FF", "#056608", "#FFFF00", "#FFA500", "#FF5F1F"]
var currentColor = 0

function changeColor() {
  for(var i=0; i<ids.length; i++) {
    let element = document.getElementById(ids[i]);
    if(element != null) {
      element.style.color = colorCodes[(currentColor + i) % colorCodes.length]
    }
    else {
    }
  }
  currentColor = (currentColor + 1) % colorCodes.length;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  playerName: string;
  joinGame: boolean;
  buttonType: string;

  userForm: FormGroup
  joinGameForm: FormGroup

  formFields: {[key: string]: any} = {
    'playerName': '',
  }

  validationMessages = {
    'playerName': {
      'required': 'playerName is required'
    }
  }

  @ViewChild('cform') userFormDirective: NgForm;
  @ViewChild('ccform') joinGameFormDirective: NgForm;

  constructor(private client: ClientService,
    private gameService: GameService,
    private fb: FormBuilder,
    private router: Router) {
    this.createForm();
  }

  createForm() {
    this.userForm = this.fb.group({
      playerName: ['', Validators.required],
    })

    this.userForm.valueChanges.subscribe(data => this.onValueChanged(data));

    this.joinGameForm = this.fb.group({
      gameId: ['', Validators.required]
    })
  }

  onValueChanged(data?: any) {
    if(!this.userForm) {  return; }

    const form = this.userForm;
    let playerName = form.get('playerName')
    if(playerName && playerName.dirty && !playerName.valid) {
      for (const key in playerName.errors) {
        if(playerName.errors.hasOwnProperty(key)) {
          const messages = this.validationMessages['playerName']
          this.formFields['playerName'] += messages[key] + ' ';
        }
      }
    }

    if(form.valid) {
      let create = <HTMLInputElement>document.getElementById("create_game")
      create.classList.remove('disabled')

      let join = <HTMLInputElement>document.getElementById("join_game")
      join.classList.remove("disabled")
    }
    else {
      let create = <HTMLInputElement>document.getElementById("create_game")
      create.classList.add('disabled')

      let join = <HTMLInputElement>document.getElementById("join_game")
      join.classList.add("disabled")
    }
  }

  onSubmit(buttonType: string) {
    this.playerName = this.userForm.get('playerName')?.value;

    if(buttonType == 'join') {
      this.joinGame = true
    }
    else if(buttonType == 'create') {
      let loginDetails = {
        "player_name": this.playerName
      }
      this.client.createOrJoinGame(loginDetails).subscribe((data) => {
        let gameId = data["game_id"]
        this.populateData(gameId, true, data)

        let route = "table/" + gameId;
        this.router.navigate([route]);
      })
    }
  }

  joinNewGame() {
    let gameId = this.joinGameForm.get('gameId')?.value

    let loginDetails = {
      "player_name": this.playerName,
      "join_game": true,
      "game_id": gameId
    }
    this.client.createOrJoinGame(loginDetails).subscribe({
      next: (data) => {
        this.populateData(gameId, false, data)

        let route = "table/" + gameId;
        this.router.navigate([route]);
      },
      error: (err) => {
        console.log("Game with name", gameId, "not found: ", err)
      }
    })
  }

  populateData(gameId: string, isCreator: boolean, data: any) {
    let allPlayers: any = {};
    let mainPlayer: any = {};
    for(let player in data["game_details"]["players"]) {
      let playerData =  data["game_details"]["players"][player]
      allPlayers[player] = {
        name: playerData["name"],
        cards: playerData["cards"]
      }

      if(playerData["name"] == this.playerName) {
        mainPlayer = {
          id: player,
          name: playerData["name"],
          cards: playerData["cards"]
        }
      }
    }

    let gameDetails: GameDetails = {
      gameId: gameId,
      player: mainPlayer,
      isCreator: isCreator,
      allPlayers: allPlayers,
    }
    console.log("Game details: ", gameDetails)

    this.gameService.gameDetails = gameDetails
    this.client.setSocket(gameId)

    return
  }

  ngOnInit() {
    setInterval(changeColor, 100)
  }

}
