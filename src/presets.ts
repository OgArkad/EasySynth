import * as Tone from "tone";
export {loadPreset, currentPreset, presets};

type PresetOscillatorType =
    | "sine"
    | "square"
    | "triangle"
    | "sawtooth"
    | "fatsine"
    | "fatsquare"
    | "fattriangle"
    | "fatsawtooth";

interface SynthPreset {
    name: string;
    oscillator: {
        type: PresetOscillatorType;
        octave: number;
        detune: number;
        volume: number;
    };
    filter?: {
        type: Tone.FilterOptions["type"];
        frequency: number;
        Q: number;
    };
    envelope: {
        attack: number;
        decay: number;
        sustain: number;
        release: number;
    };
    lfo?: {
        frequency: number;
        min: number;
        max: number;
        phase: number;
        type: Tone.LFOOptions["type"];
    };
}

function loadPreset(
    preset: SynthPreset | undefined,
    Synth: Tone.PolySynth | Tone.Synth,
    Filter?: Tone.Filter,
    Lfo?: Tone.LFO
) {
    if (!preset) throw new Error("Preset is undefined!");

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
    } else if (Lfo) {
        Lfo.stop();
    }
}

const defaultPreset: SynthPreset = {
    name: "Default",
    oscillator: { type: "square", octave: 0, detune: 0, volume: -1 },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 1 }
};

const cleanSaw: SynthPreset = {
    name: "Clean Saw",
    oscillator: { type: "sawtooth", octave: 0, detune: 0, volume: -1 },
    filter: { type: "lowpass", frequency: 2000, Q: 1 },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 1 }
};

const superSaw: SynthPreset = {
    name: "Super Saw",
    oscillator: { type: "sawtooth", octave: 0, detune: 0, volume: 1 },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.5 },
    filter: { type: "lowpass", frequency: 2500, Q: 2 },
    lfo: { frequency: 4, min: 2000, max: 4000, phase: 0, type: "sine" }
};

const triangle: SynthPreset = {
    name: "Triangles",
    oscillator: { type: "triangle", octave: 0, detune: 0, volume: 1 },
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.1, release: 0.1 },
    filter: { type: "lowpass", frequency: 2500, Q: 2 }
};

let currentPreset: number = 0;
 const presets: SynthPreset[] = [defaultPreset, cleanSaw, superSaw, triangle];
