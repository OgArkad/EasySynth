import * as Tone from "tone";
import { loadPreset, presets, currentPreset } from "./presets.js";
import { sustain, unison } from "./effects.js";

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

export { synth, filter, lfo, panner, expression, synths, manageKnobs};

function manageKnobs (knob: string, degree: number){ // degree: -127 - 127
    const preset = presets[currentPreset];
    if (!preset) return;

    switch (knob){
        case "attack": //ADSR envelope
            preset.envelope.attack = (degree + 127) / 200; //0 - 1,27
            break;
        case "decay":
            preset.envelope.decay = (degree + 127) / 100; //0 - 2,54
            break;
        case "sustain":
            preset.envelope.sustain = (degree + 127) / 100; //0 - 2,54
            break;
        case "release":
            preset.envelope.release = (degree + 127) / 100; //0 - 2,54
            break;

        case "octave": //tuning
            preset.oscillator.octave = Math.round(degree / 127 * 4); //8 oktave
            break;
        case "semitone":
            break;//To-do
        default:
            console.error("Unexpected knob: " + knob + ": " + degree);
            return;
    }
    if (!unison.on) loadPreset(preset, synth);
    else synths.forEach((synth) => loadPreset(preset, synth));
}