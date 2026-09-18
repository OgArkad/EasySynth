import * as Tone from "tone";
export { synth, filter, lfo, panner, expression /**/ };
const synth = new Tone.PolySynth();
const filter = new Tone.Filter();
const lfo = new Tone.LFO({
    min: 500,
    max: 5000,
    phase: 0,
});
const panner = new Tone.Panner(0);
const expression = new Tone.Gain(1);
/*Other types of synth: MSynth, DuoSynth, FMynth, membraneSynth, metalSynth, noiseSynth, pluckSynth,  (they not all support all our given parameters)*/ 
//# sourceMappingURL=instrument.js.map