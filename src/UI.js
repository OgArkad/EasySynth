import { expression, manageKnobs, filter, seq } from "./instrument.js";
import { presets, currentPreset } from "./presets.js";
import { sequencer } from "./effects.js";
import { Transport } from "tone";
export { setKnobs };
const KNOB_CONFIGS = {
<<<<<<< Updated upstream
    'filter-knob': { minAngle: -127, maxAngle: 127, steps: 7 },
    'waveform-knob': { minAngle: -100, maxAngle: 100, steps: 8 },
=======
    'filter-knob': { minAngle: -127, maxAngle: 127 },
    'waveform-knob': { minAngle: -127, maxAngle: 127, steps: 8 },
>>>>>>> Stashed changes
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
    initKnobs();
    initSliders();
    initSwitches();
    initTransportUI();
});
function initKnobs() {
    const knobs = document.querySelectorAll('.knob-image');
    knobs.forEach((knob) => {
        const config = KNOB_CONFIGS[knob.id] || { minAngle: -127, maxAngle: 127 };
        const { minAngle, maxAngle, steps, sensitivity = 1.5 } = config;
        knob.dataset.angle = String(minAngle);
        knob.style.transform = `rotate(${minAngle}deg)`;
        knob.addEventListener('mousedown', (e) => {
            e.preventDefault();
            let startY = e.clientY;
            let currentAngle = parseFloat(knob.dataset.angle || String(minAngle));
            const onMouseMove = (moveEvent) => {
                const deltaY = startY - moveEvent.clientY;
                startY = moveEvent.clientY;
                let targetAngle = currentAngle + deltaY * sensitivity;
                targetAngle = Math.min(maxAngle, Math.max(minAngle, targetAngle));
                if (steps && steps > 1) {
                    const range = maxAngle - minAngle;
                    const stepSize = range / (steps - 1);
                    const currentStep = Math.round((targetAngle - minAngle) / stepSize);
                    currentAngle = minAngle + currentStep * stepSize;
                }
                else {
                    currentAngle = targetAngle;
                }
                knob.dataset.angle = String(currentAngle);
                knob.style.transform = `rotate(${currentAngle}deg)`;
                const paramId = knob.id.replace("-knob", "");
                manageKnobs(paramId, currentAngle);
            };
            const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    });
}
function initSliders() {
    const caps = document.querySelectorAll('.cap');
    caps.forEach((cap) => {
        let currentY = 0;
        cap.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const container = cap.parentElement;
            const track = container?.querySelector('.slider');
            if (!track)
                return;
            const totalTravel = track.offsetHeight - cap.offsetHeight;
            const minY = -totalTravel;
            const maxY = 0;
            let startY = e.clientY;
            const onMouseMove = (moveEvent) => {
                const deltaY = moveEvent.clientY - startY;
                startY = moveEvent.clientY;
                currentY = Math.min(maxY, Math.max(minY, currentY + deltaY));
                cap.style.transform = `translateY(${currentY}px)`;
                const value = Math.round(((maxY - currentY) / totalTravel) * 100);
                const paramId = cap.id.replace(/-(cap|knob)$/, '');
                manageKnobs(paramId, value);
            };
            const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    });
}
function initSwitches() {
    const switches = document.querySelectorAll('.switch');
    switches.forEach((switchOne) => {
        switchOne.addEventListener('click', () => {
            const isOn = switchOne.dataset.works === "on";
            switchOne.dataset.works = isOn ? "off" : "on";
            switchOne.src = isOn ? "./media/switchLeft.png" : "./media/switchRight.png";
            switchOne.classList.toggle('active', !isOn);
        });
    });
}
function initTransportUI() {
    const up = document.getElementById("tempoUp");
    const down = document.getElementById("tempDown");
    const value = document.getElementById("tempoValue");
    let tempoValue = 120;
    if (up && down && value) {
        up.addEventListener("click", () => {
            tempoValue++;
            value.textContent = tempoValue.toString();
            Transport.bpm.value = tempoValue;
        });
        down.addEventListener("click", () => {
            tempoValue--;
            value.textContent = tempoValue.toString();
            Transport.bpm.value = tempoValue;
        });
    }
    document.getElementById("play")?.addEventListener("click", () => {
        if (sequencer.on)
            return;
        seq.start(0);
        Transport.start();
        sequencer.recording = true;
    });
    document.getElementById("pause")?.addEventListener("click", () => {
        if (!sequencer.on)
            return;
        seq.stop();
        sequencer.sequence.length = 0;
    });
    document.getElementById("record")?.addEventListener("click", () => {
        if (!sequencer.on)
            return;
        sequencer.recording = !sequencer.recording;
    });
}
function setKnobs() {
    function set_Knob(knobId, deg) {
        const el = document.getElementById(knobId + "-knob");
        if (!el)
            return;
        el.dataset.angle = String(deg);
        el.style.transform = `rotate(${deg}deg)`;
    }
    const pres = presets[currentPreset];
<<<<<<< Updated upstream
    if (pres === undefined)
        throw new Error("This shouldn't have happened, you selected a non-existing preset! (Trying to rotate knobs in position)");
    set_Knob("cutoff", Math.log(parseInt(filter.frequency.value.toString()) / 20) / Math.log(20000 / 20) * 254 - 127);
    set_Knob("filter", ["lowpass", "highpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"].indexOf(filter.type) / 6 * 254 - 127);
=======
    if (!pres)
        throw new Error("Selected non-existing preset!");
    if (pres.filter) {
        set_Knob("cutoff", Math.log(pres.filter.frequency / 20) / Math.log(20000 / 20) * 254 - 127);
    }
>>>>>>> Stashed changes
    set_Knob("attack", pres.envelope.attack * 200 - 127);
    set_Knob("decay", pres.envelope.decay * 100 - 127);
    set_Knob("sustain", pres.envelope.sustain * 254 - 127);
    set_Knob("release", pres.envelope.release * 100 - 127);
    const waveIndex = ["sine", "square", "triangle", "sawtooth", "fatsine", "fatsquare", "fattriangle", "fatsawtooth"].indexOf(pres.oscillator.type);
    set_Knob("waveform", waveIndex * 32 - 127);
    set_Knob("octave", (pres.oscillator.octave / 4) * 127);
    set_Knob("semitone", (pres.oscillator.detune / 1000 / 12) * 127);
    set_Knob("fine-tuning", pres.oscillator.detune * 10);
    set_Knob("gain", expression.gain.value * 254 - 127);
}
<<<<<<< Updated upstream
/*                             -                           Set tempo UI                                          -                                                */
let up = document.getElementById("tempoUp");
let down = document.getElementById("tempDown");
let value = document.getElementById("tempoValue");
let tempoValue = 120;
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
document.getElementById("play")?.addEventListener("click", () => {
    if (sequencer.on)
        return;
    seq.start(0);
    Transport.start();
    sequencer.recording = true;
});
document.getElementById("pause")?.addEventListener("click", () => {
    if (!sequencer.on)
        return;
    seq.stop();
    sequencer.sequence.length = 0;
});
document.getElementById("record")?.addEventListener("click", () => {
    if (!sequencer.on)
        return;
    sequencer.recording = !sequencer.recording;
});
document.addEventListener('DOMContentLoaded', () => {
    const switches = document.querySelectorAll('.switch');
    switches.forEach((switchOne) => {
        switchOne.style.position = "absolute";
        switchOne.style.top = "50%";
        switchOne.style.right = "33%";
        switchOne.addEventListener('click', (e) => {
            if (switchOne.dataset.works === "off") {
                switchOne.src = "./media/switchRight.png";
                switchOne.dataset.works = "on";
                switchOne.style.top = "50%";
                switchOne.style.right = "66%";
            }
            else {
                switchOne.src = "./media/switchLeft.png";
                switchOne.dataset.works = "off";
                switchOne.style.top = "50%";
                switchOne.style.right = "33%";
            }
        });
    });
});
/*
  position: absolute;
  top: 50%;
  right: 48%;
*/ 
=======
>>>>>>> Stashed changes
//# sourceMappingURL=UI.js.map