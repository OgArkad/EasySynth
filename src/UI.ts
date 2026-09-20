import { manageKnobs} from "./instrument.js";

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
  'velocity-knob':    { minAngle: -127, maxAngle: 127, sensitivity: 2.0 },//ennek pedig 127-ről kéne indulnia
  'cutoff-knob':      { minAngle: -127, maxAngle: 127 },
  'unison-knob':      { minAngle: -127, maxAngle: 127, steps: 4 },
  'octave-knob':      { minAngle: -90,  maxAngle: 90,  steps: 5 }, //ennek a 4. oktávról kéne indulnia, és összesen 8 lépés kéne bele (meg egy kicsit fura az animációja)
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