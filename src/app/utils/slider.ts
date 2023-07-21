export class Slider {
  minValue: number;
  maxValue: number;

  constructor(minValue: number, maxValue: number, initialValue: number) {
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.changeColor(initialValue);
  } 

  changeColor(value: number) {
    let element = document.getElementById("slider")
    if(element == null) {
      return
    }

    let percent = (value - this.minValue) * 100 / (this.maxValue - this.minValue);
    // this.initialSliderColor = percent + '% 100%'
    element.style.backgroundSize = (percent > 100 ? 100 : ((percent < 0) ? 0 : percent)) + '% 100%';

    let sliderColor: string;
    if(percent < 30) {
      sliderColor = `linear-gradient(to right, #2ffe00, #2ffe00)`
    }
    else if(percent > 30 && percent < 70) {
      sliderColor = `linear-gradient(to right, #2ffe00 ${100-percent}%, #ffd000 100%)`
    } 
    else {
      sliderColor = `linear-gradient(to right, #2ffe00 10%, #ffd000 ${170-percent > 70 ? 170-percent : 70}%, #F50700 100%)`
    }

    element.style.backgroundImage = sliderColor;
  }
}