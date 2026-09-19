import * as Tone from "tone";
import { loadPreset, presets, currentPreset } from "./presets.js";
import { unison } from "./effects.js";

const synth: Tone.PolySynth = new Tone.PolySynth();
const filter = new Tone.Filter();
const lfo = new Tone.LFO({
    min: 500,
    max: 5000,
    phase: 0,
});
const panner = new Tone.Panner(0);
const expression = new Tone.Gain(1);

const synths = Array.from({ length: unison.voices }, (_, i) => { 
    const singleSynth = new Tone.Synth();
    loadPreset(presets[currentPreset], singleSynth, filter, lfo);
    
    const panner = new Tone.Panner((i - (i / 2)) * 0.32);
    singleSynth.connect(panner);
    panner.toDestination();
    singleSynth.detune.value = (i - 2) * unison.detune; 
    
    return singleSynth;
});

export { synth, filter, lfo, panner, expression, synths };