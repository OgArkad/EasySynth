import * as Tone from "tone";
import { loadPreset, presets, currentPreset } from "./presets.js";
import { unison } from "./effects.js";

const synth: Tone.PolySynth = new Tone.PolySynth();

let volume = new Tone.Gain(1);

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

export { synth, filter, lfo, panner, expression, synths, manageKnobs, volume};

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
            preset.envelope.sustain = (degree + 127) / 254; //0 - 1
            break;
        case "release":
            preset.envelope.release = (degree + 127) / 100; //0 - 2,54
            break;

        case "octave": //tuning
            preset.oscillator.octave = Math.round(degree / 127 * 4); //9 oktave
            break;
        case "semitone":
            preset.oscillator.detune = Math.round(degree / 127 * 12) * 1000;// -120 - 120
            break;
        case "tuning":
            preset.oscillator.detune = degree / 10; //-12,7 - 12,7
            break;

        case "cutoff":
            if (!preset.filter) return;
            preset.filter.frequency = 20 * Math.pow(20000 / 20, (degree + 127) / 254); //min 20, max: 20000
            break;
        case "unison":
            unison.on = degree > 0;
            break;

        case "filter":
            break;
        case "waveform":
            break;
        case "sequencer":
            break;
        case "velocity":
            expression.gain.rampTo((degree + 127) / 254, 0.02);
            break;

            
        default:
            console.error("Unexpected knob: " + knob + ": " + degree);
            return;
    }
    if (!unison.on) loadPreset(preset, synth);
    else synths.forEach((synth) => loadPreset(preset, synth));
}