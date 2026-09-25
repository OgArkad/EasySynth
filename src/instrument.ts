import { PolySynth, Sequence, Gain, Filter, LFO, Panner, Synth, Transport, Waveform } from "tone";
import { loadPreset, presets, currentPreset, type PresetOscillatorType } from "./presets.js";
import { sequencer, unison } from "./effects.js";

const waveform: Waveform = new Waveform(1024);

export const seq: Sequence<string> = new Sequence((time, note) => {
    if (unison.on) synths.forEach((synth) => synth.triggerAttackRelease(note, "8n", time));
    else synth.triggerAttackRelease(note, "8n", time);
    console.log("sequencing it");
}, sequencer.sequence, "8n");

const synth: PolySynth = new PolySynth();

let volume: Gain<"gain"> = new Gain(1);

const filter = new Filter();
const lfo = new LFO({
    min: 500,
    max: 5000,
    phase: 0,
});
const panner = new Panner(0);
const expression = new Gain(1);

const synths = Array.from({ length: unison.voices }, (_, i) => {
    const singleSynth = new Synth();
    loadPreset(presets[currentPreset], singleSynth, filter, lfo, false);

    const panner = new Panner((i - (i / 2)) * 0.32);
    singleSynth.connect(panner);
    panner.toDestination();
    singleSynth.detune.value = (i - 2) * unison.detune;

    return singleSynth;
});

export {waveform, synth, filter, lfo, panner, expression, synths, manageKnobs, volume};

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
            preset.oscillator.detune = Math.round(degree / 127 * 12) * 100;// -120 - 120
            break;
        case "fine-tuning":
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
            console.debug(degree);
            const frequency = Math.floor(50 * Math.pow(15000 / 50, ((degree + 127) / 254)));// min: 50, max: 15000
            console.debug(frequency);
            filter.frequency.rampTo(frequency, 0.2);
            console.debug(filter.frequency.value);
            break;
        case "waveform":
            const types: PresetOscillatorType[] =
            ["sine", "square", "triangle", "sawtooth", "fatsine", "fatsquare", "fattriangle", "fatsawtooth"];//8

            const x = types[ Math.min(types.length - 1,Math.floor(((degree + 127) / 254) * types.length))];
            if (x === undefined) throw new Error("This shouldn't have happened, knob went throu limits");
            preset.oscillator.type = x;
            break;
        case "sequencer":
            sequencer.on = degree > 0;
            if (sequencer.on){
                seq.start(0);
                Transport.start();
            }
            else {
                seq.stop();
                sequencer.sequence.length = 0;
            }
            break;
        case "gain":
            expression.gain.rampTo((degree + 127) / 254, 0.2);
            break;


        default:
            console.error("Unexpected knob: " + knob + ": " + degree);
            return;
    }
    if (!unison.on) loadPreset(preset, synth, undefined, undefined, false);
    else synths.forEach((synth) => loadPreset(preset, synth, undefined, undefined, false));
}

