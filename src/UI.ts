import { expression, manageKnobs, filter, seq, manageCaps, manageSwitches } from "./instrument.js";
import { presets, currentPreset, type PresetOscillatorType, type SynthPreset } from "./presets.js";
import { sequencer } from "./effects.js";
import { Transport, start } from "tone";
export { setKnobs , keyboard};
import * as Tone from "tone";

interface KnobConfig {
  minAngle: number;
  maxAngle: number;
  steps?: number;
  sensitivity?: number;
}

const KNOB_CONFIGS: Record<string, KnobConfig> = {
  'filter-knob':      { minAngle: -127, maxAngle: 127, steps: 7 },
  'waveform-knob':    { minAngle: -100, maxAngle: 100, steps: 8 },
  'sequencer-knob':   { minAngle: -127, maxAngle: 127, steps: 8 },
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
    const { minAngle, maxAngle, steps, sensitivity = 1.2 } = config;

    const getRotationFromElement = (el: HTMLElement): number => {
      const transform = el.style.transform;
      const match = transform.match(/rotate\(([-?\d.]+)deg\)/);
      const val = match?.[1];
      return val !== undefined ? parseFloat(val) : minAngle;
    };
    
    knob.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      
      knob.setPointerCapture(e.pointerId);

      let startY = e.clientY;
      let continuousAngle = getRotationFromElement(knob);

      const onPointerMove = (moveEvent: PointerEvent) => {
        const deltaY = startY - moveEvent.clientY;
        startY = moveEvent.clientY;

        continuousAngle += deltaY * sensitivity;
        continuousAngle = Math.min(maxAngle, Math.max(minAngle, continuousAngle));

        let displayAngle = continuousAngle;

        if (steps && steps > 1) {
          const range = maxAngle - minAngle;
          const stepSize = range / (steps - 1);
          const currentStep = Math.round((continuousAngle - minAngle) / stepSize);
          displayAngle = minAngle + currentStep * stepSize;
        }

        knob.style.transform = `rotate(${displayAngle}deg)`;
        manageKnobs(knob.id.replace("-knob", ""), displayAngle);
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        knob.releasePointerCapture(upEvent.pointerId);
        knob.removeEventListener('pointermove', onPointerMove);
        knob.removeEventListener('pointerup', onPointerUp);
      };

      knob.addEventListener('pointermove', onPointerMove);
      knob.addEventListener('pointerup', onPointerUp);
    });
  });
});

function setKnobs() {
  function set_Knob(knob: string, deg: number) {
    const x: HTMLElement | null = document.getElementById(knob + "-knob");
    if (x == null) return;
    x.style.transform = `rotate(${deg}deg)`;
  }

  const pres: SynthPreset | undefined = presets[currentPreset];
  if (pres === undefined) throw new Error("This shouldn't have happened, you selected a non-existing preset! (Trying to rotate knobs in position)");

  set_Knob("filter", ["lowpass", "highpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"].indexOf(filter.type)/6 * 254 - 127);
  set_Knob("waveform", ["sine", "square", "triangle", "sawtooth", "fatsine", "fatsquare", "fattriangle", "fatsawtooth"].indexOf(pres.oscillator.type) * 32 - 127); //254/8 = 31,75

  set_Knob("gain", expression.gain.value * 254 - 127);

  set_Knob("cutoff",  Math.log( parseInt(filter.frequency.value.toString()) / 20) / Math.log(20000 / 20) * 254 - 127 );

  set_Knob("attack",  pres.envelope.attack  * 200 - 127);
  set_Knob("decay",   pres.envelope.decay   * 100 - 127);
  set_Knob("sustain", pres.envelope.sustain * 254 - 127);
  set_Knob("release", pres.envelope.release * 100 - 127);

  console.info("Knobs set!");
}

let up = document.getElementById("tempoUp");
let down = document.getElementById("tempDown");
let value = document.getElementById("tempoValue");

let tempoValue: number = 120;

if (up && down && value) {
  up.addEventListener("click", function () {
    tempoValue++;
    value.textContent = tempoValue.toString();
    Transport.bpm.value = tempoValue;
  });

  down.addEventListener("click", function () {
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
  if (!sequencer.on) return;
  sequencer.recording = false;
  seq.loop = false;
  seq.stop();
  sequencer.on = false;
  console.info("sequencer stopped");
});

document.getElementById("record")?.addEventListener("click", () => {
  if (!sequencer.on) return;
  sequencer.recording = !sequencer.recording;
  console.info("sequencer recording: ", sequencer.recording);
});

const keyboardonehun: Record<string, string> = {//higher notes, because usually you hear them cleaner (due to technologycal issues)
        w: "C#5", e: "D#5",        t: "F#5", z: "G#5", u: "A#5",
    a: "C5", s: "D5", d: "E5", f: "F5", g: "G5", h: "A5", j: "B5", k: "C6"
};

const keyboardtwohun: Record<string, string> = {
        3: "C#5", 4: "D#5",        6: "F#5", 7: "G#5", 8: "A#5",
    w: "C5", e: "D5", r: "E5", t: "F5", z: "G5", u: "A5", i: "B5", o: "C6",
        s: "C#4", d: "D#4",        g: "F#4", h: "G#4", j: "A#4",
    y: "C4", x: "D4", c: "E4", v: "F4", b: "G4", n: "A4", m: "B4", ',': "C5",
};

const keyboardoneeng: Record<string, string | undefined> = {
    ...keyboardonehun,
    y: "G#5",
    z: undefined,
};;

const keyboardtwoeng: Record<string, string> = {
    ...keyboardtwohun,
    y: "G5",
    z: "C4",
};

let keyboard: Record<string, string | undefined> = keyboardtwohun;

document.getElementById("keyboardOptions")?.addEventListener("change", (e) => {
  console.info("Keyboard option selected: ", (e.target as HTMLSelectElement).value);
  switch((e.target as HTMLSelectElement).value) {
    case "2hun":
      keyboard = keyboardtwohun;
      break;
    case "2eng":
      keyboard = keyboardtwoeng;
      break;
    case "1hun":
      keyboard = keyboardonehun;
      break;
    case "1eng":
      keyboard = keyboardoneeng;
      break;

    default:
      throw new Error("Invalid keyboard option selected.");
  }
});
/*                             -                           Set switches UI                                          -                                                */

document.addEventListener('DOMContentLoaded', () => {
  const switches = document.querySelectorAll<HTMLImageElement>('.switch');

  switches.forEach((switchOne) => {
    switchOne.style.left = "-30px";

    switchOne.addEventListener('click', () => {
      const isOff = switchOne.dataset.works === "off";

      if (isOff) {
        switchOne.src = "./media/switchRight.png";
        switchOne.dataset.works = "on";
        switchOne.style.left = "30px";
      } else {
        switchOne.src = "./media/switchLeft.png";
        switchOne.dataset.works = "off";
        switchOne.style.left = "-30px";
      }
      manageSwitches(switchOne.id.replace("-switch", ""), switchOne.dataset.works === "on");
    });
  });
});

/*                             -                           Set caps UI                                          -                                                */
document.addEventListener('DOMContentLoaded', () => {
  const caps = document.querySelectorAll<HTMLImageElement>('.cap');

  caps.forEach((cap) => {
    const container = cap.parentElement;
    const track = container?.querySelector<HTMLImageElement>('.slider');

    let currentY = 0;
    if (track) {
      const totalTravel = track.offsetHeight - cap.offsetHeight;

      currentY = -(totalTravel / 2);
      cap.style.transform = `translateX(-50%) translateY(${currentY}px)`;
    }

    cap.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();

      if (!track) return;

      const totalTravel = track.offsetHeight - cap.offsetHeight;
      const minY = -totalTravel;
      const maxY = 0;

      let startY = e.clientY;

      const onPointerMove = (moveEvent: PointerEvent) => {
        const deltaY = moveEvent.clientY - startY;
        startY = moveEvent.clientY;

        currentY = Math.min(maxY, Math.max(minY, currentY + deltaY));

        cap.style.transform = `translateX(-50%) translateY(${currentY}px)`;

        manageCaps(cap.id.replace("-cap", ""), Math.round(((maxY - currentY) / totalTravel) * 100));
      };

      const onPointerUp = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    });
  });
});


const startBtn = document.getElementById("start");

if (startBtn) {
  const handleStart = async (e: Event) => {
    e.preventDefault();

    if (typeof (Tone as any).start === "function") {
      await (Tone as any).start();
    }

    if (screen.orientation && typeof screen.orientation.lock === "function") {
      try {
        await screen.orientation.lock("landscape");
      } catch (err) {
        console.warn("Screen orientation lock not supported or allowed:", err);
      }
    }

    startBtn.style.display = "none";
  };

  startBtn.addEventListener("click", handleStart);
  startBtn.addEventListener("pointerdown", handleStart);
}
