import * as Tone from "tone";
export { /*AMSynth, DuoSynth, FMynth, membraneSynth, metalSynth, noiseSynth, pluckSynth, */ synth, filter, lfo, panner, expression /**/ };
/** /const AMSynth = new Tone.AMSynth();
const DuoSynth = new Tone.DuoSynth();
const FMynth = new Tone.FMSynth();
const membraneSynth = new Tone.MembraneSynth();
const metalSynth = new Tone.MetalSynth();
const noiseSynth = new Tone.NoiseSynth();
const pluckSynth = new Tone.PluckSynth();/**/
const synth = new Tone.PolySynth();
const filter = new Tone.Filter();
const lfo = new Tone.LFO({
    min: 500,
    max: 5000,
    phase: 0,
});
const panner = new Tone.Panner(0);
const expression = new Tone.Gain(1);
//# sourceMappingURL=instruments.js.map