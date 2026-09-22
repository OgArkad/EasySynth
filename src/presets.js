import * as Tone from "tone";
import { setKnobs } from "./UI.js";
export { loadPreset, currentPreset, presets };
function loadPreset(preset, Synth, Filter, Lfo, set = true) {
    if (!preset)
        throw new Error("Preset is undefined!");
    Synth.set({
        oscillator: preset.oscillator,
        envelope: preset.envelope
    });
    if (preset.filter && Filter) {
        Filter.set(preset.filter);
    }
    if (preset.lfo && Lfo) {
        Lfo.set(preset.lfo);
        if (!Lfo.state || Lfo.state === "stopped") {
            Lfo.start();
        }
    }
    else if (Lfo) {
        Lfo.stop();
    }
    if (set)
        setKnobs();
}
const defaultPreset = {
    name: "Default",
    oscillator: { type: "square", octave: 0, detune: 0, volume: -1 },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 1 }
};
const cleanSaw = {
    name: "Clean Saw",
    oscillator: { type: "sawtooth", octave: 0, detune: 0, volume: -1 },
    filter: { type: "lowpass", frequency: 2000, Q: 1 },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 1 }
};
const superSaw = {
    name: "Super Saw",
    oscillator: { type: "sawtooth", octave: 0, detune: 0, volume: 1 },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.5 },
    filter: { type: "lowpass", frequency: 2500, Q: 2 },
    lfo: { frequency: 4, min: 2000, max: 4000, phase: 0, type: "sine" }
};
const triangle = {
    name: "Triangles",
    oscillator: { type: "triangle", octave: 0, detune: 0, volume: 1 },
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.1, release: 0.1 },
    filter: { type: "lowpass", frequency: 2500, Q: 2 }
};
const brightLead = {
    name: "Bright Lead",
    oscillator: { type: "sawtooth", octave: 0, detune: 0, volume: -3 },
    filter: { type: "lowpass", frequency: 5000, Q: 2 },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.75, release: 0.25 }
};
const softLead = {
    name: "Soft Lead",
    oscillator: { type: "triangle", octave: 0, detune: 0, volume: -2 },
    filter: { type: "lowpass", frequency: 2800, Q: 1.5 },
    envelope: { attack: 0.08, decay: 0.2, sustain: 0.65, release: 0.35 }
};
const deepBass = {
    name: "Deep Bass",
    oscillator: { type: "square", octave: -1, detune: 0, volume: -4 },
    filter: { type: "lowpass", frequency: 700, Q: 4 },
    envelope: { attack: 0.01, decay: 0.25, sustain: 0.8, release: 0.3 }
};
const subBass = {
    name: "Sub Bass",
    oscillator: { type: "sine", octave: -2, detune: 0, volume: -2 },
    filter: { type: "lowpass", frequency: 350, Q: 1 },
    envelope: { attack: 0.02, decay: 0.15, sustain: 1, release: 0.4 }
};
const pluck = {
    name: "Pluck",
    oscillator: { type: "sawtooth", octave: 0, detune: 0, volume: -5 },
    filter: { type: "lowpass", frequency: 3500, Q: 3 },
    envelope: { attack: 0.005, decay: 0.18, sustain: 0.05, release: 0.2 }
};
const warmPad = {
    name: "Warm Pad",
    oscillator: { type: "fatsawtooth", octave: 0, detune: -8, volume: -8 },
    filter: { type: "lowpass", frequency: 1800, Q: 1 },
    envelope: { attack: 0.8, decay: 0.5, sustain: 0.75, release: 1.8 }
};
const dreamPad = {
    name: "Dream Pad",
    oscillator: { type: "fattriangle", octave: 0, detune: 5, volume: -6 },
    filter: { type: "lowpass", frequency: 2400, Q: 0.8 },
    envelope: { attack: 1.2, decay: 0.8, sustain: 0.7, release: 2.5 },
    lfo: { frequency: 0.25, min: 1200, max: 2800, phase: 0, type: "sine" }
};
const wobble = {
    name: "Wobble",
    oscillator: { type: "sawtooth", octave: 0, detune: 0, volume: -5 },
    filter: { type: "lowpass", frequency: 1800, Q: 7 },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.8, release: 0.25 },
    lfo: { frequency: 4, min: 300, max: 2200, phase: 0, type: "sine" }
};
const acid = {
    name: "Acid",
    oscillator: { type: "sawtooth", octave: 0, detune: 0, volume: -4 },
    filter: { type: "lowpass", frequency: 900, Q: 12 },
    envelope: { attack: 0.005, decay: 0.3, sustain: 0.15, release: 0.15 }
};
const retroGame = {
    name: "Retro Game",
    oscillator: { type: "square", octave: 0, detune: 0, volume: -5 },
    filter: { type: "lowpass", frequency: 3500, Q: 1 },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0.65, release: 0.08 }
};
const cosmic = {
    name: "Cosmic",
    oscillator: { type: "fatsine", octave: 0, detune: -12, volume: -7 },
    filter: { type: "lowpass", frequency: 4000, Q: 1.5 },
    envelope: { attack: 0.4, decay: 0.6, sustain: 0.8, release: 2 },
    lfo: { frequency: 0.12, min: 1800, max: 5000, phase: 90, type: "sine" }
};
const organ = {
    name: "Organ",
    oscillator: { type: "square", octave: 0, detune: 0, volume: -6 },
    filter: { type: "lowpass", frequency: 5000, Q: 0.5 },
    envelope: { attack: 0.03, decay: 0.05, sustain: 0.9, release: 0.15 }
};
const darkDrone = {
    name: "Dark Drone",
    oscillator: { type: "fatsawtooth", octave: -1, detune: -15, volume: -10 },
    filter: { type: "lowpass", frequency: 800, Q: 5 },
    envelope: { attack: 2, decay: 1, sustain: 1, release: 3 },
    lfo: { frequency: 0.08, min: 400, max: 1100, phase: 180, type: "triangle" }
};
const laser = {
    name: "Laser",
    oscillator: { type: "square", octave: 1, detune: 0, volume: -7 },
    filter: { type: "highpass", frequency: 1200, Q: 5 },
    envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.15 },
    lfo: { frequency: 8, min: 1000, max: 7000, phase: 0, type: "sawtooth" }
};
let currentPreset = 0;
const presets = [
    defaultPreset,
    cleanSaw,
    superSaw,
    triangle,
    brightLead,
    softLead,
    deepBass,
    subBass,
    pluck,
    warmPad,
    dreamPad,
    wobble,
    acid,
    retroGame,
    cosmic,
    organ,
    darkDrone,
    laser
];
function toSynthPreset(x) {
    if (x === undefined)
        throw new Error("Undefined preset found!!!");
    let name = x.replace("{name:", "").split(",").slice(0, 5)[0];
    if (name === undefined)
        name = "undef";
    const pres = {
        name: name,
        oscillator: { type: "square", octave: 1, detune: 0, volume: -7 },
        filter: { type: "highpass", frequency: 1200, Q: 5 },
        envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.15 },
        lfo: { frequency: 8, min: 1000, max: 7000, phase: 0, type: "sawtooth" }
    };
    return pres;
}
function loadLocalPresets() {
    let i = 0;
    let x = localStorage.getItem("preset" + i);
    while ((x != null || x != undefined) && i < 150) //max 150 items
     {
        presets.push(toSynthPreset(x));
        i++;
    }
    console.log(i + " presets loaded from local machine");
}
loadLocalPresets();
//# sourceMappingURL=presets.js.map