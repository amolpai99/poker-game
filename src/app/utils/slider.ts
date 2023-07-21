import { COLORS } from "../shared/constants";

export class Slider {
  minValue: number;
  maxValue: number;
  initialValue: number;

  constructor(minValue: number, maxValue: number, initialValue: number) {
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.initialValue = initialValue;
    this.changeColor(initialValue);
  } 

  changeColor(value: number) {
    console.log("SliderComponent: ", "Got value: ", value)

    let element = document.getElementById("slider")
    if(element == null) {
      return
    }

    let percent = (value - this.minValue) * 100 / (this.maxValue - this.minValue);
    console.log("SliderComponent: ", "Percent: ", percent)
    // this.initialSliderColor = percent + '% 100%'
    element.style.backgroundSize = (percent > 100 ? 100 : ((percent < 0) ? 0 : percent)) + '% 100%';

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
}