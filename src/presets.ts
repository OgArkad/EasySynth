import * as Tone from "tone"; //no need in the js file, but dependency in ts. remove before final build
export {defaultPreset, cleanSaw, superSaw};

type PresetOscillatorType =
    | "sine"
    | "square"
    | "triangle"
    | "sawtooth"
    | "fatsine"
    | "fatsquare"
    | "fattriangle"
    | "fatsawtooth";

export interface SynthPreset {
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
        enabled: boolean;
        frequency: number;
        depth: number;
    };
}


const defaultPreset: SynthPreset = {
    name: "Default",
    oscillator: {
        type: "sine",
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

}

const cleanSaw: SynthPreset = {
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
}


const superSaw: SynthPreset = {
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
        enabled: true,
        frequency: 4,
        depth: 500
    }
}