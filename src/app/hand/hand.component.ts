import { Component, Inject, Input } from '@angular/core';
import { ClientService } from '../services/client.service';

function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss']
})
export class HandComponent {
  @Input("player") playerName: string;
  @Input("player_type") playerType: string = "secondary";
  @Input("open_hand") openHand: string = "false";

  cards: number[];

  constructor(
    private client: ClientService) {
  }

  ngOnInit() {
    this.client.getCards().subscribe({
      next: (cards) => {
        this.cards = cards[this.playerName]
      }}
    );
  }

}
