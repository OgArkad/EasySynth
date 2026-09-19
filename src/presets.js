import * as Tone from "tone"; //no need in the js file, but dependency in ts. remove before final build
import { filter, lfo, synth } from "./instruments.js";
export { loadPreset, currentPreset, presets };
function loadPreset(preset, synth) {
    if (!preset)
        throw new Error("Preset is undefined!");
    synth.set({
        oscillator: preset.oscillator,
        envelope: preset.envelope
    });
    if (preset.filter) {
        filter.set(preset.filter);
    }
    if (preset.lfo) {
        lfo.set(preset.lfo);
        if (!lfo.state || lfo.state === "stopped")
            lfo.start();
    }
    else {
        lfo.stop();
    }
}
const defaultPreset = {
    name: "Default",
    oscillator: {
        type: "square",
        octave: 0,
        detune: 0,
        volume: -1
    },
    envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 1
    }
};
const cleanSaw = {
    name: "Clean Saw",
    oscillator: {
        type: "sawtooth",
        octave: 0,
        detune: 0,
        volume: -1
    },
    filter: {
        type: "lowpass",
        frequency: 2000,
        Q: 1
    },
    envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 1
    }
};
const superSaw = {
    name: "Super Saw",
    oscillator: {
        type: "sawtooth",
        octave: 0,
        detune: 0,
        volume: 1
    },
    envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.7,
        release: 0.5
    },
    filter: {
        type: "lowpass",
        frequency: 2500,
        Q: 2
    },
    lfo: {
        frequency: 4,
        min: 2000,
        max: 4000,
        phase: 0,
        type: "sine"
    }
};
const triangle = {
    name: "Triangles",
    oscillator: {
        type: "triangle",
        octave: 0,
        detune: 0,
        volume: 1
    },
    envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.1,
        release: 0.1
    },
    filter: {
        type: "lowpass",
        frequency: 2500,
        Q: 2
    }
};
let currentPreset = 0;
const presets = [defaultPreset, cleanSaw, superSaw, triangle];
//# sourceMappingURL=presets.js.map