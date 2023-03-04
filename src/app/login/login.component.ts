import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardsService } from '../services/cards.service';


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
  username: string;
  gameName: string;
  joinGame: boolean;
  buttonType: string;

  userForm: FormGroup
  joinGameForm: FormGroup

  formFields: {[key: string]: any} = {
    'username': '',
  }

  validationMessages = {
    'username': {
      'required': 'Username is required'
    }
  }

  // @ViewChild('joinElement') element: ElementRef;
  @ViewChild('cform') userFormDirective: NgForm;
  @ViewChild('ccform') joinGameFormDirective: NgForm;

  constructor(private cardsService: CardsService,
    private fb: FormBuilder,
    private router: Router) {
    this.createForm();
  }

  createForm() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
    })

    this.userForm.valueChanges.subscribe(data => this.onValueChanged(data));

    this.joinGameForm = this.fb.group({
      gameName: ['', Validators.required]
    })
  }

  onValueChanged(data?: any) {
    if(!this.userForm) {  return; }

    const form = this.userForm;
    let username = form.get('username')
    if(username && username.dirty && !username.valid) {
      for (const key in username.errors) {
        if(username.errors.hasOwnProperty(key)) {
          const messages = this.validationMessages['username']
          this.formFields['username'] += messages[key] + ' ';
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
    console.log("Submitted form. ButtonType: ", buttonType)
    this.username = this.userForm.get('username')?.value;
    console.log('Username: ', this.username)

    if(buttonType == 'join') {
      this.joinGame = true
    }
    else if(buttonType == 'create') {
      this.cardsService.createGame(this.username).subscribe((data) => {
        console.log(data)
      })

      this.router.navigate(['table']);
    }
  }

  joinNewGame() {
    console.log("Submitted form for joining game")

    let gameName = this.joinGameForm.get('gameName')?.value
    console.log('Game Name: ', gameName)

    this.cardsService.joinGame(this.username, gameName).subscribe((data) => {
      console.log(data)
    })
    this.router.navigate(['table']);
  }

  ngOnInit() {
    setInterval(changeColor, 100)
  }

}
