import {expression, manageKnobs, filter, seq, manageCaps, manageSwitches} from "./instrument.js";
import { presets, currentPreset, type SynthPreset } from "./presets.js";
import { sequencer } from "./effects.js";
import { Transport } from "tone";
export {setKnobs};

interface KnobConfig {
  minAngle: number;
  maxAngle: number;
  steps?: number;
  sensitivity?: number;
}

const KNOB_CONFIGS: Record<string, KnobConfig> = {
  'filter-knob':      { minAngle: -127, maxAngle: 127, steps: 7 },
  'waveform-knob':    { minAngle: -100, maxAngle: 100, steps: 8 },
  'effect-knob':      { minAngle: -127, maxAngle: 127, steps: 15 },
  'gain-knob':        { minAngle: -127, maxAngle: 127, sensitivity: 2.0 },
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
//set caps, switches...

function setKnobs(){
  function set_Knob(knob: string, deg: number){
    const x: HTMLElement | null = document.getElementById(knob + "-knob");
    if (x == null) return;
    x.style.transform =  `rotate(${deg}deg)`;
  }

  const pres: SynthPreset | undefined = presets[currentPreset];
  if (pres === undefined) throw new Error("This shouldn't have happened, you selected a non-existing preset! (Trying to rotate knobs in position)");

  set_Knob("filter", ["lowpass", "highpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"].indexOf(filter.type)/6 * 254 - 127);
  set_Knob("waveform", ["sine", "square", "triangle", "sawtooth", "fatsine", "fatsquare", "fattriangle", "fatsawtooth"].indexOf(pres.oscillator.type) * 32 - 127); //254/8 = 31,75

  set_Knob("gain", expression.gain.value * 254 - 127);

  set_Knob("cutoff",  Math.log( parseInt(filter.frequency.value.toString()) / 20) / Math.log(20000 / 20) * 254 - 127 );

  set_Knob("octave",  pres.oscillator.octave  / 4 * 127);
  set_Knob("semitone", pres.oscillator.detune / 1000 / 12 * 127);
  set_Knob("fine-tuning", pres.oscillator.detune * 10);

  set_Knob("attack",  pres.envelope.attack  * 200 - 127);
  set_Knob("decay",   pres.envelope.decay   * 100 - 127);
  set_Knob("sustain", pres.envelope.sustain * 254 - 127);
  set_Knob("release", pres.envelope.release * 100 - 127);

  console.info("Knobs set!");
}

/*                             -                           Set tempo UI                                          -                                                */
let up = document.getElementById("tempoUp");
let down = document.getElementById("tempDown");
let value = document.getElementById("tempoValue");

let tempoValue: number = 120;

if (up && down && value) {
  up.addEventListener("click", function (e) {
    tempoValue++;
    value.textContent = tempoValue.toString();
    Transport.bpm.value = tempoValue;
  });

  down.addEventListener("click", function (e) {
    tempoValue--;
    value.textContent = tempoValue.toString();
    Transport.bpm.value = tempoValue;
  });
}
/*                             -                           Set sequencer UI                                          -                                                */

document.getElementById("play")?.addEventListener("click", () => {
  sequencer.on = true;
  seq.start();
  seq.loop = true;
  sequencer.recording = true;
  sequencer.recStart = Transport.seconds;
  console.info("sequencer started");
});

document.getElementById("pause")?.addEventListener("click", () => {
  if (!sequencer.on) return
  sequencer.recording = false;
  seq.loop = false;
  seq.stop();
  sequencer.on = false;
  console.info("sequencer stoped");
});

document.getElementById("record")?.addEventListener("click", () => {
  if (!sequencer.on) return
  sequencer.recording = !sequencer.recording;
  console.info("sequencer recording: ", sequencer.recording);
});
/*                             -                           Set switches UI                                          -                                                */

document.addEventListener('DOMContentLoaded', () => {
  const switches = document.querySelectorAll<HTMLImageElement>('.switch');
  switches.forEach((switchC) => {
    switchC.style.position = "absolute";
    switchC.style.top = "50%";
    switchC.style.right = "33%";

    switchC.addEventListener('click', (e: MouseEvent) => {
      if (switchC.dataset.works === "off") {
        switchC.src = "./media/switchRight.png";
        switchC.dataset.works = "on";
        switchC.style.top = "50%";
        switchC.style.left = "66%";
      } else {
        switchC.src = "./media/switchLeft.png";
        switchC.dataset.works = "off";
        switchC.style.top = "50%";
        switchC.style.right = "33%";
      }
      manageSwitches(switchC.id.replace("-switch", ""), switchC.dataset.works === "on");
      console.log(`Switch [${switchC.id}]: ${switchC.dataset.works}`);
    });
  });
});

/*                             -                           Set caps UI                                          -                                                */
document.addEventListener('DOMContentLoaded', () => {
  const caps = document.querySelectorAll<HTMLImageElement>('.cap');

  caps.forEach((cap) => {
    let currentY = 60;

    cap.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();

      const container = cap.parentElement;
      const track = container?.querySelector<HTMLImageElement>('.slider');
      if (!track) return;

      const totalTravel = track.offsetHeight - cap.offsetHeight;
      const minY = -totalTravel;
      const maxY = 0;

      let startY = e.clientY;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaY = moveEvent.clientY - startY;
        startY = moveEvent.clientY;

        currentY = Math.min(maxY, Math.max(minY, currentY + deltaY));

        cap.style.transform = `translateY(${currentY}px)`;;

        manageCaps(cap.id.replace("-cap", ""), Math.round(((maxY - currentY) / totalTravel) * 100));
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


/*
  position: absolute;
  top: 50%;
  right: 48%;
*/