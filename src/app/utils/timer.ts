import { COLORS } from "../shared/constants";

export class Timer {
  // Timer specific data
  private timer: NodeJS.Timer;

  private playerId: string;
  private currentColor: string;
  private totalTime: number;

  constructor(playerId: string, totalTime: number) {
    this.playerId = playerId
    this.currentColor = "green"
    this.totalTime = totalTime
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  startTimer() {
    let timePassed = 0;
    // Start arc animation one second earlier
    this.currentColor = COLORS.GREEN
    this.setTimerArc(timePassed + 0.5);

    this.timer = setInterval(() => {
      timePassed += 0.1;
      if(timePassed >= this.totalTime) {
        this.stopTimer()
      }
      else {
        // Set the timer ring
        this.setTimerArc(timePassed);
      }
    }, 100)
  }

  setTimerArc(timePassed: number) {
    // <--- FORMAT 1: Display the name and icon in same circle and have a timer around the border of the div --->
    // let timeRemaining = this.totalTime - timePassed;
    // let timerArcRemaining = (timeRemaining / this.totalTime) * TOTAL_TIMER_ARC;
    // let attribute = timerArcRemaining + " " + TOTAL_TIMER_ARC
    // console.log("PlayerComponent: Timer: Time passed: ", timePassed, " Time remaining: ", timeRemaining, " , TimerArcRemaining: ", timerArcRemaining)
    // let id = 'timer_' + this.playerId
    // let timerElement = document.getElementById(id)
    // timerElement?.setAttribute('stroke-dasharray', attribute);  

    // if(this.currentColor == "green") {
    //   if(this.timeRemaining == 10) {
    //     this.currentColor = "yellow"
    //     timerElement?.setAttribute('stroke', '#EFE34F')
    //   }
    // }
    // else if(this.currentColor == "yellow") {
    //   if(this.timeRemaining == 5) {
    //     this.currentColor = "red"
    //     timerElement?.setAttribute('stroke', '#CB2D03')
    //   }
    // }

    // <--- FORMAT 2: Display name at top and have timer as background timer in div --->
    let timeRemaining = this.totalTime - timePassed;
    let id = `timer_${this.playerId}`;
    let timerElement = document.getElementById(id);

    let x = 50 * (1 + this.calcSin(timePassed));
    let y = 50 * (1 - this.calcCos(timePassed));
    let majorArc = 0;
    if(timePassed > this.totalTime/2) {
      majorArc = 1;
    }

    if(timeRemaining <= 10 && timeRemaining >= 5) {
      timerElement?.setAttribute('fill', COLORS.DARK_YELLOW);
    }
    else if(timeRemaining <= 5) {
      timerElement?.setAttribute('fill', COLORS.MAROON);
    }

    let arc = `M 50 50 L 50 0 A 50 50 0 ${majorArc} 1 ${x} ${y} Z`;
    timerElement?.setAttribute('d', arc);


  }

  calcSin(time: number) {
    return Math.sin(2 * Math.PI * time / this.totalTime); 
  }

  calcCos(time: number) {
    return Math.cos(2 * Math.PI * time / this.totalTime); 
  }
}