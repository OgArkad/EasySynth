import { PolySynth, Gain, Filter, LFO, Panner, Synth, Waveform, Part, type SynthOptions } from "tone";
import { loadPreset, presets, currentPreset, type PresetOscillatorType, presetdefs } from "./presets.js";
import { sequencer, unison, effects, currentEffect, SwitchCurrentEffect} from "./effects.js";

const waveform: Waveform = new Waveform(1024);

export const seq = new Part((time, note) => {
    if (!unison.on) synth.triggerAttackRelease(note, "8n", time);
    else synths.forEach((synth) => synth.triggerAttackRelease(note, "8n", time));
}, []);
seq.loopEnd = sequencer.length;

const synth: PolySynth = new PolySynth();

let volume: Gain<"gain"> = new Gain(1);

const filter: Filter = new Filter({
    type: "lowpass",
    frequency: 15000,
    Q: 1
});

const lfo: LFO = new LFO({
    min: 500,
    max: 5000,
    phase: 0,
});
const panner: Panner = new Panner(0);
const expression: Gain<"gain"> = new Gain(1);

let synths: Synth<SynthOptions>[] = Array.from({ length: unison.voices }, (_, i) => {
    const singleSynth = new Synth();
    loadPreset(presets[currentPreset], singleSynth, filter, lfo, false);

    const panner = new Panner((i - (i / 2)) * 0.32);
    singleSynth.connect(panner);
    panner.toDestination();
    singleSynth.detune.value = (i - 2) * unison.detune;

    return singleSynth;
});

function regenerateSynths() {
    synths = Array.from({ length: unison.voices }, (_, i) => {
    const singleSynth = new Synth();
    loadPreset(presets[currentPreset], singleSynth, filter, lfo, false);

    if (i > 100) throw new Error("Unexpected error: unison.voices > 100, this shouldn't have happened.");
    const x = (((i - (i / 2)) * 0.02)-0.5)*2;
    const panner = new Panner(x);
    singleSynth.connect(panner);
    panner.toDestination();
    panner.connect(waveform);
    singleSynth.detune.value = (i - 2) * unison.detune;

    return singleSynth;
});
}


export {waveform, synth, filter, lfo, panner, expression, synths, manageKnobs, volume, manageCaps, manageSwitches};

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
            preset.oscillator.detune = Math.round(degree / 127 * 1200); //9 oktave
            break;
        case "semitone":
            preset.oscillator.detune = Math.round(degree / 127 * 12) * 100;// -120 - 120
            break;
        case "fine-tuning":
            preset.oscillator.detune = degree / 10; //-12,7 - 12,7
            break;

        case "cutoff":
            const frequency = Math.floor(50 * Math.pow(15000 / 50, ((degree + 127) / 254)));// min: 50, max: 15000
            filter.frequency.value = frequency;
            break;
        case "unison":
            unison.on = degree > 0;
            break;

        case "filter":
            const filter_types: BiquadFilterType[] = ["lowpass", "highpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"];
            let xtype: BiquadFilterType | undefined = filter_types[Math.floor((degree + 127) / 254 * 6)];
            if (xtype == undefined) throw new Error("undefined filter type.");
            filter.type = xtype;
            break;
        case "waveform":
            const types: PresetOscillatorType[] = ["sine", "square", "triangle", "sawtooth", "fatsine", "fatsquare", "fattriangle", "fatsawtooth"];//8

            const x = types[ Math.min(types.length - 1,Math.floor(((degree + 127) / 254) * types.length))];
            if (x === undefined) throw new Error("This shouldn't have happened, knob went throu limits");
            preset.oscillator.type = x;
            break;
        case "effect":
            let effectIndex = Math.floor((degree + 127) / 254 * effects.length);//0-effects.length

            if (currentEffect === effectIndex) return;
            console.log("Effect index: " + effectIndex);

            if (currentEffect !== null){
                const effectOld = effects[currentEffect];
                if (effectOld === undefined) throw new Error("Unexpected indexing error in effects (stoping).");
                synth.disconnect(effectOld.node);
                effectOld.start?.();
                SwitchCurrentEffect(null);
                console.log("Effect disconnected: " + effectOld.node.constructor.name);
            }
            if (effectIndex === 0) return;

            effectIndex -= 1;
            const effect = effects[effectIndex];
            if (effect === undefined) throw new Error("Unexpected indexing error in effects (starting).");

            synth.connect(effect.node);
            effect.start?.();
            SwitchCurrentEffect(effectIndex);

            console.log("Effect connected: " + effect.node.constructor.name);
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
    const x = presets[currentPreset];
    if (x != undefined && x.itemId) localStorage.setItem(x.itemId, JSON.stringify(preset));
}

function manageCaps (cap: string, state: number){//0-100
    switch (cap){
        case "detune":
            unison.detune = state; //0 - 100
            synths.forEach((synth, i) => {synth.detune.value = (i - 2) * unison.detune;});
            break;
        case "voices"://bragadnak néha a hangok
            if (state <= 2) state = 3;
            unison.voices = Math.floor(state * 0.4); //2-40
            regenerateSynths();
            break;

        default:
            console.error("Unexpected cap: " + cap + ": " + state);
            return;
    }
}

function manageSwitches (switchName: string, state: boolean){
    switch (switchName){
        case "unison":
            unison.on = state;
            break;
        case "effect":
            break;
        case "lfo":
            lfo.start();
            if (!state) lfo.stop();
            break;

        default:
            console.error("Unexpected switch: " + switchName + ": " + state);
            return;
    }
}