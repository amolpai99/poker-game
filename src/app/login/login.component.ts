import { Component } from '@angular/core';


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
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  disabled: boolean;

  constructor() {
    this.disabled = true
  }

  validate(name: string) {
    if(name == "") {
      console.log("Name is empty")
    }
    else {
      console.log("Name: ", name)
    }
  }

  onSubmit() {
    console.log("Submitted form")
    let form = document.getElementById("userForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      let username = (<HTMLInputElement>document.getElementById("username")).value
      this.validate(username)
    })
  }

  ngOnInit() {
    setInterval(changeColor, 100)

    let userForm = (<HTMLInputElement>document.getElementById("username"))
    userForm?.addEventListener("change", (e) => {
      e.preventDefault()
      let val = userForm.value
      if(val != "") {
        this.disabled = false
      }
    })

    let create = document.getElementById("create")
    create?.addEventListener("click", (e) => {
      e.preventDefault()
      let username = (<HTMLInputElement>document.getElementById("username")).value
      this.validate(username)
    })

    let join = document.getElementById("join")
    join?.addEventListener("click", (e) => {
      e.preventDefault()
      let username = (<HTMLInputElement>document.getElementById("username")).value
      this.validate(username)
    })
  }

}
