import * as Tone from "tone";
import {loadPreset, presets, currentPreset} from "./presets.js";
import {unison} from "./effects.js";
export {synth, filter, lfo, panner, expression, synths};

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
    const synth = new Tone.Synth();
    loadPreset(presets[currentPreset], synth);
    const panner = new Tone.Panner((i-(i/2))*0.32);//-0.8 - 0.8
    synth.connect(panner);
    panner.toDestination();
    synth.detune.value = (i - 2) * unison.detune;
    return synth;
});

/*Other types of synth: MSynth, DuoSynth, FMynth, membraneSynth, metalSynth, noiseSynth, pluckSynth,  (they not all support all our given parameters)*/