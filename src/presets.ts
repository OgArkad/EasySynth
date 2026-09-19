import * as Tone from "tone";

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

export function loadPreset(
    preset: SynthPreset | undefined,
    targetSynth: Tone.PolySynth | Tone.Synth,
    targetFilter?: Tone.Filter,
    targetLfo?: Tone.LFO
) {
    if (!preset) throw new Error("Preset is undefined!");

    targetSynth.set({
        oscillator: preset.oscillator,
        envelope: preset.envelope
    });

    if (preset.filter && targetFilter) {
        targetFilter.set(preset.filter);
    }

    if (preset.lfo && targetLfo) {
        targetLfo.set(preset.lfo);
        if (!targetLfo.state || targetLfo.state === "stopped") {
            targetLfo.start();
        }
    } else if (targetLfo) {
        targetLfo.stop();
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

export let currentPreset: number = 0;
export const presets: SynthPreset[] = [defaultPreset, cleanSaw, superSaw, triangle];
