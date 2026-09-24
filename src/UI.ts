import {expression, manageKnobs} from "./instrument.js";
import { presets, currentPreset } from "./presets.js";
export {setKnobs};

interface KnobConfig {
  minAngle: number;
  maxAngle: number;
  steps?: number;
  sensitivity?: number;
}

const KNOB_CONFIGS: Record<string, KnobConfig> = {
  'filter-knob':      { minAngle: -127, maxAngle: 127 },
  'waveform-knob':    { minAngle: -100, maxAngle: 100, steps: 5 },
  'sequencer-knob':   { minAngle: -127, maxAngle: 127, steps: 8 },
  'velocity-knob':    { minAngle: -127, maxAngle: 127, sensitivity: 2.0 },
  'cutoff-knob':      { minAngle: -127, maxAngle: 127 },
  'unison-knob':      { minAngle: -127, maxAngle: 127, steps: 4 },
  'octave-knob':      { minAngle: -90,  maxAngle: 90,  steps: 8 },
  'semitone-knob':    { minAngle: -127, maxAngle: 127, steps: 25 },
  'fine-tuning-knob': { minAngle: -127, maxAngle: 127, sensitivity: 0.5 },
  'attack-knob':      { minAngle: -127, maxAngle: 127 },
  'decay-knob':       { minAngle: -127, maxAngle: 127 },
  'sustain-knob':     { minAngle: -127, maxAngle: 127 },
  'release-knob':     { minAngle: -127, maxAngle: 127 }
};

document.addEventListener('DOMContentLoaded', () => {
  const knobs = document.querySelectorAll<HTMLImageElement>('.knob-image');

  knobs.forEach((knob) => {
    const config = KNOB_CONFIGS[knob.id] || { minAngle: -127, maxAngle: 127 };
    const { minAngle, maxAngle, steps, sensitivity = 1.5 } = config;

    let currentAngle = minAngle;
    knob.style.transform = `rotate(${currentAngle}deg)`;

    knob.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      let startY = e.clientY;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaY = startY - moveEvent.clientY;
        startY = moveEvent.clientY;

        let targetAngle = currentAngle + deltaY * sensitivity;
        targetAngle = Math.min(maxAngle, Math.max(minAngle, targetAngle));

        if (steps && steps > 1) {
          const range = maxAngle - minAngle;
          const stepSize = range / (steps - 1);
          const currentStep = Math.round((targetAngle - minAngle) / stepSize);

          currentAngle = minAngle + currentStep * stepSize;
          knob.style.transform = `rotate(${currentAngle}deg)`;
        } else {
          currentAngle = targetAngle;
          knob.style.transform = `rotate(${currentAngle}deg)`;
        }
        manageKnobs(knob.id.replace("-knob", ""), currentAngle);
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  });
});

function setKnobs(){
  console.log("trying");
  function set_Knob(knob: string, deg: number){
    const x: HTMLElement | null = document.getElementById(knob + "-knob");
    if (x == null) return;
    x.style.transform =  `rotate(${deg}deg)`;
  }

  const pres = presets[currentPreset];
  if (pres === undefined) throw new Error("This shouldn't have happened, you selected a non-existing preset! (Trying to rotate knobs in position)");
  if (pres.filter){
    set_Knob("cutoff",  Math.log( pres.filter.frequency / 20) / Math.log(20000 / 20) * 254 - 127 );
  }

  set_Knob("attack",  pres.envelope.attack  * 200 - 127);
  set_Knob("decay",   pres.envelope.decay   * 100 - 127);
  set_Knob("sustain", pres.envelope.sustain * 254 - 127);
  set_Knob("release", pres.envelope.release * 100 - 127);

  set_Knob("octave",  pres.oscillator.octave  / 4 * 127);
  set_Knob("semitone", pres.oscillator.detune / 1000 / 12 * 127);
  set_Knob("fine-tuning", pres.oscillator.detune * 10);
  //set_Knob("unison", unison.on ? 127 : -127); // no need, because it's an outer variable

  set_Knob("velocity", expression.gain.value * 254 - 127);
  console.log("Knobs set!");
}

/*                             -                           Set tempo UI                                          -                                                */
let up = document.getElementById("tempoUp");
let down = document.getElementById("tempDown");
let value = document.getElementById("tempoValue");

let tempoValue = 120;

if (up && down && value) {
  up.addEventListener("click", function (e) {
    tempoValue++;
    value.textContent = tempoValue.toString();
  });

  down.addEventListener("click", function (e) {
    tempoValue--;
    value.textContent = tempoValue.toString();
  });
}