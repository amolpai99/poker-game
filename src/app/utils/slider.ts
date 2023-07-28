import { COLORS } from "../shared/constants";

export class Slider {
  minValue: number;
  maxValue: number;
  initialValue: number;
  playerId: string;

  private id: string;

  constructor(playerId: string, minValue: number, maxValue: number, initialValue: number) {
    this.playerId = playerId;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.initialValue = initialValue;

    this.id = `slider_${playerId}`;
    this.changeColor(initialValue);
  } 

  changeColor(value: number) {
    console.log("SliderComponent: ", "Player ID: ", this.playerId,  " | Got value: ", value)

    let element = document.getElementById(this.id);
    if(element == null) {
      return
    }

    console.log("SliderComponent: ", "Initial Value: ", value, " Min Value: ", this.minValue, " Max Value: ", this.maxValue)

    let percent = 0;
    if(this.maxValue != this.minValue) {
      percent = (value - this.minValue) * 100 / (this.maxValue - this.minValue);
    }
    if(percent < 0) percent = 0;
    if(percent > 100) percent = 100;

    console.log("SliderComponent: ", "Percent: ", percent)
    // this.initialSliderColor = percent + '% 100%'
    element.style.backgroundSize = `${percent}% 100%`;

    let sliderColor: string;
    if(percent < 30) {
      sliderColor = `linear-gradient(to right, ${COLORS.GREEN}, ${COLORS.GREEN})`
    }
    else if(percent > 30 && percent < 70) {
      sliderColor = `linear-gradient(to right, ${COLORS.GREEN} ${100-percent}%, ${COLORS.YELLOW} 100%)`
    } 
    else {
      sliderColor = `linear-gradient(to right, ${COLORS.GREEN} 10%, ${COLORS.YELLOW} ${170-percent > 70 ? 170-percent : 70}%, ${COLORS.RED} 100%)`
    }

    console.log("SliderComponent: ", "Setting color: ", sliderColor)

    element.style.backgroundImage = sliderColor;
  }

  reset() {
    this.changeColor(this.initialValue);
  }

  updateMaxAmount(value: number) {
    this.maxValue = value;
  }

  updateMinAmount(value: number) {
    this.minValue = value;
  }
}