import { expression, manageKnobs, filter, seq } from "./instrument.js";
import { presets, currentPreset } from "./presets.js";
import { sequencer } from "./effects.js";
import { Recorder, Transport } from "tone";
export { setKnobs };
import * as Tone from "tone";
const KNOB_CONFIGS = {
    'filter-knob': { minAngle: -127, maxAngle: 127, steps: 7 },
    'waveform-knob': { minAngle: -100, maxAngle: 100, steps: 8 },
    'sequencer-knob': { minAngle: -127, maxAngle: 127, steps: 8 },
    'gain-knob': { minAngle: -127, maxAngle: 127, sensitivity: 2.0 },
    'cutoff-knob': { minAngle: -127, maxAngle: 127 },
    'unison-knob': { minAngle: -127, maxAngle: 127, steps: 4 },
    'octave-knob': { minAngle: -90, maxAngle: 90, steps: 8 },
    'semitone-knob': { minAngle: -127, maxAngle: 127, steps: 25 },
    'fine-tuning-knob': { minAngle: -127, maxAngle: 127, sensitivity: 0.5 },
    'attack-knob': { minAngle: -127, maxAngle: 127 },
    'decay-knob': { minAngle: -127, maxAngle: 127 },
    'sustain-knob': { minAngle: -127, maxAngle: 127 },
    'release-knob': { minAngle: -127, maxAngle: 127 }
};
document.addEventListener('DOMContentLoaded', () => {
    const knobs = document.querySelectorAll('.knob-image');
    knobs.forEach((knob) => {
        const config = KNOB_CONFIGS[knob.id] || { minAngle: -127, maxAngle: 127 };
        const { minAngle, maxAngle, steps, sensitivity = 1.5 } = config;
        let currentAngle = minAngle;
        knob.style.transform = `rotate(${currentAngle}deg)`;
        knob.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            let startY = e.clientY;
            const onPointerMove = (moveEvent) => {
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
                }
                else {
                    currentAngle = targetAngle;
                    knob.style.transform = `rotate(${currentAngle}deg)`;
                }
                manageKnobs(knob.id.replace("-knob", ""), currentAngle);
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
function setKnobs() {
    function set_Knob(knob, deg) {
        const x = document.getElementById(knob + "-knob");
        if (x == null)
            return;
        x.style.transform = `rotate(${deg}deg)`;
    }
    const pres = presets[currentPreset];
    if (pres === undefined)
        throw new Error("This shouldn't have happened, you selected a non-existing preset! (Trying to rotate knobs in position)");
    set_Knob("cutoff", Math.log(parseInt(filter.frequency.value.toString()) / 20) / Math.log(20000 / 20) * 254 - 127);
    set_Knob("octave", pres.oscillator.octave / 4 * 127);
    set_Knob("semitone", pres.oscillator.detune / 1000 / 12 * 127);
    set_Knob("fine-tuning", pres.oscillator.detune * 10);
    set_Knob("attack", pres.envelope.attack * 200 - 127);
    set_Knob("decay", pres.envelope.decay * 100 - 127);
    set_Knob("sustain", pres.envelope.sustain * 254 - 127);
    set_Knob("release", pres.envelope.release * 100 - 127);
    set_Knob("filter", ["lowpass", "highpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"].indexOf(filter.type) / 6 * 254 - 127);
    set_Knob("waveform", ["sine", "square", "triangle", "sawtooth", "fatsine", "fatsquare", "fattriangle", "fatsawtooth"].indexOf(pres.oscillator.type) * 32 - 127); //254/8 = 31,75
    set_Knob("octave", pres.oscillator.octave / 4 * 127);
    set_Knob("semitone", pres.oscillator.detune / 1000 / 12 * 127);
    set_Knob("fine-tuning", pres.oscillator.detune * 10);
    //set_Knob("unison", unison.on ? 127 : -127); // no need, because it's an outer variable
    set_Knob("gain", expression.gain.value * 254 - 127);
    console.info("Knobs set!");
}
let up = document.getElementById("tempoUp");
let down = document.getElementById("tempDown");
let value = document.getElementById("tempoValue");
let tempoValue = 120;
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
document.getElementById("play")?.addEventListener("click", () => {
    sequencer.on = true;
    seq.start();
    seq.loop = true;
    sequencer.recording = true;
    sequencer.recStart = Transport.seconds;
    console.info("sequencer started");
});
document.getElementById("pause")?.addEventListener("click", () => {
    if (!sequencer.on)
        return;
    sequencer.recording = false;
    seq.loop = false;
    seq.stop();
    sequencer.on = false;
    console.info("sequencer stopped");
});
document.getElementById("record")?.addEventListener("click", () => {
    if (!sequencer.on)
        return;
    sequencer.recording = !sequencer.recording;
    console.info("sequencer recording: ", sequencer.recording);
});
document.addEventListener('DOMContentLoaded', () => {
    const switches = document.querySelectorAll('.switch');
    switches.forEach((switchOne) => {
        switchOne.style.left = "-30px";
        switchOne.addEventListener('click', () => {
            const isOff = switchOne.dataset.works === "off";
            if (isOff) {
                switchOne.src = "./media/switchRight.png";
                switchOne.dataset.works = "on";
                switchOne.style.left = "30px";
            }
            else {
                switchOne.src = "./media/switchLeft.png";
                switchOne.dataset.works = "off";
                switchOne.style.left = "-30px";
            }
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const caps = document.querySelectorAll('.cap');
    caps.forEach((cap) => {
        let currentY = 0;
        cap.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            const container = cap.parentElement;
            const track = container?.querySelector('.slider');
            if (!track)
                return;
            const totalTravel = track.offsetHeight - cap.offsetHeight;
            const minY = -totalTravel;
            const maxY = 0;
            let startY = e.clientY;
            const onPointerMove = (moveEvent) => {
                const deltaY = moveEvent.clientY - startY;
                startY = moveEvent.clientY;
                let targetY = currentY + deltaY;
                currentY = Math.min(maxY, Math.max(minY, targetY));
                cap.style.transform = `translateX(-50%) translateY(${currentY}px)`;
                const value = Math.round(((maxY - currentY) / totalTravel) * 100);
                const paramId = cap.id.replace(/-(cap|knob)$/, '');
                if (typeof window.manageKnobs === 'function') {
                    window.manageKnobs(paramId, value);
                }
                else {
                    console.log(`Slider [${paramId}]: ${value}%`);
                }
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
    startBtn.addEventListener("click", async () => {
        if (typeof Tone.start === "function") {
            await Tone.start();
        }
        if (screen.orientation && typeof screen.orientation.lock === "function") {
            try {
                await screen.orientation.lock("landscape");
            }
            catch (err) {
                console.warn("Screen orientation lock not supported or allowed:", err);
            }
        }
        startBtn.style.display = "none";
    });
}
//# sourceMappingURL=UI.js.map