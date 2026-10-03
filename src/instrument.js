import { PolySynth, Gain, Filter, LFO, Panner, Synth, Waveform, Part } from "tone";
import { loadPreset, presets, currentPreset } from "./presets.js";
import { sequencer, unison, effects, currentEffect, SwitchCurrentEffect } from "./effects.js";
const waveform = new Waveform(512); //1024 before, but for performance 512 is still enough
export const seq = new Part((time, note) => {
    if (!unison.on)
        synth.triggerAttackRelease(note, "8n", time);
    else
        synths.forEach((synth) => synth.triggerAttackRelease(note, "8n", time));
}, []);
seq.loopEnd = sequencer.length;
const synth = new PolySynth();
let volume = new Gain(1);
const filter = new Filter({
    type: "lowpass",
    frequency: 15000,
    Q: 1
});
const lfo = new LFO({
    min: 500,
    max: 5000,
    phase: 0,
});
const panner = new Panner(0);
const expression = new Gain(1);
let synths = Array.from({ length: unison.voices }, (_, i) => {
    const singleSynth = new Synth();
    loadPreset(presets[currentPreset], singleSynth, filter, lfo, false);
    const panner = new Panner((i - (i / 2)) * 0.32);
    singleSynth.connect(panner);
    panner.toDestination();
    singleSynth.detune.value = (i - 2) * unison.detune;
    return singleSynth;
});
function regenerateSynths() {
    for (const synth of synths) {
        synth.dispose();
    }
    synths = Array.from({ length: unison.voices }, (_, i) => {
        const singleSynth = new Synth();
        loadPreset(presets[currentPreset], singleSynth, filter, lfo, false);
        if (i > 100)
            throw new Error("Unexpected error: unison.voices > 100, this shouldn't have happened.");
        if (i < 5)
            synth.connect(waveform);
        const panner = new Panner(unison.voices === 1 ? 0 : (i / (unison.voices - 1)) * 2 - 1);
        singleSynth.connect(panner);
        panner.toDestination();
        singleSynth.detune.value = (i - 2) * unison.detune;
        return singleSynth;
    });
}
export { waveform, synth, filter, lfo, panner, expression, synths, manageKnobs, volume, manageCaps, manageSwitches };
function manageKnobs(knob, degree) {
    const preset = presets[currentPreset];
    if (!preset)
        return;
    switch (knob) {
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
            preset.oscillator.detune = Math.round(degree / 127 * 12) * 100; // -120 - 120
            break;
        case "fine-tuning":
            preset.oscillator.detune = degree / 10; //-12,7 - 12,7
            break;
        case "cutoff":
            const frequency = Math.floor(50 * Math.pow(15000 / 50, ((degree + 127) / 254))); // min: 50, max: 15000
            filter.frequency.value = frequency;
            break;
        case "unison":
            unison.on = degree > 0;
            break;
        case "filter":
            const filter_types = ["lowpass", "highpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"];
            let xtype = filter_types[Math.floor((degree + 127) / 254 * 6)];
            if (xtype == undefined)
                throw new Error("undefined filter type.");
            filter.type = xtype;
            break;
        case "waveform":
            const types = ["sine", "square", "triangle", "sawtooth", "fatsine", "fatsquare", "fattriangle", "fatsawtooth"]; //8
            const x = types[Math.min(types.length - 1, Math.floor(((degree + 127) / 254) * types.length))];
            if (x === undefined)
                throw new Error("This shouldn't have happened, knob went throu limits");
            preset.oscillator.type = x;
            break;
        case "effect":
            let effectIndex = Math.floor((degree + 127) / 254 * effects.length); //0-effects.length
            if (currentEffect === effectIndex)
                return;
            if (currentEffect !== null) {
                const effectOld = effects[currentEffect];
                if (effectOld === undefined)
                    throw new Error("Unexpected indexing error in effects (stoping).");
                synth.disconnect(effectOld.node);
                effectOld.stop?.();
                SwitchCurrentEffect(null);
            }
            if (effectIndex === 0)
                return;
            effectIndex -= 1;
            const effect = effects[effectIndex];
            if (effect === undefined)
                throw new Error("Unexpected indexing error in effects (starting).");
            synth.connect(effect.node);
            effect.start?.();
            SwitchCurrentEffect(effectIndex);
            console.log("Effect connected: " + effect.node.constructor.name);
            break;
        case "gain":
            expression.gain.rampTo((degree + 127) / 254, 0.2);
            break;
        default:
            throw new Error("Unexpected knob: " + knob + ": " + degree);
    }
    if (!unison.on)
        loadPreset(preset, synth, undefined, undefined, false);
    else
        synths.forEach((synth) => loadPreset(preset, synth, undefined, undefined, false));
    const x = presets[currentPreset];
    if (x != undefined && x.itemId)
        localStorage.setItem(x.itemId, JSON.stringify(preset));
}
function manageCaps(cap, state) {
    switch (cap) {
        case "detune":
            unison.detune = state; //0 - 100
            synths.forEach((synth, i) => { synth.detune.value = (i - 2) * unison.detune; });
            break;
        case "voices":
            synths.forEach((synth) => synth.triggerRelease("+1"));
            if (state <= 2)
                state = 3;
            unison.voices = Math.floor(state * 0.4); //2-40
            regenerateSynths();
            break;
        default:
            throw new Error("Unexpected cap: " + cap + ": " + state);
    }
}
function manageSwitches(switchName, state) {
    switch (switchName) {
        case "unison":
            if (!state)
                synths.forEach((synth) => synth.triggerRelease("+1"));
            else
                synth.releaseAll("+1");
            unison.on = state;
            break;
        case "effect":
            break;
        case "lfo":
            if (state)
                lfo.start();
            else
                lfo.stop();
            break;
        default:
            throw new Error("Unexpected switch: " + switchName + ": " + state);
    }
}
/*
effect*/ 
//# sourceMappingURL=instrument.js.map