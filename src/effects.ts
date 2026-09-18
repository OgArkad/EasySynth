import * as Tone from "tone";//only needed in TS, remove before production
export {reverb, delay, chorus, phaser, stereowidener, distortion, bitcrusher, tremolo, vibrato/** /, autoFilter, autoPanner, cheby, pingPong, pitchShift, autoWah/**/};

const reverb: Tone.Reverb = new Tone.Reverb({
    decay: 5,
    wet: 0.3
});
const delay: Tone.FeedbackDelay = new Tone.FeedbackDelay({
    delayTime: "8n",
    feedback: 0.5,
    wet: 0.3
});
const chorus: Tone.Chorus = new Tone.Chorus({
    frequency: 4,
    depth: 2,
    wet: 0.3
});
const phaser: Tone.Phaser = new Tone.Phaser({
    frequency: 80,
    octaves: 3,
    baseFrequency: 1000
});
const stereowidener: Tone.StereoWidener = new Tone.StereoWidener(0);//0: mid, 1: side
const distortion: Tone.Distortion       = new Tone.Distortion(0.8);
const bitcrusher: Tone.BitCrusher       = new Tone.BitCrusher(4);
const tremolo: Tone.Tremolo             = new Tone.Tremolo(9, 0.75).start();
const vibrato: Tone.Vibrato             = new Tone.Vibrato(4, 0.5);
/** /
const autoFilter: Tone.AutoFilter       = new Tone.AutoFilter("4n").start();
const autoPanner: Tone.AutoPanner       = new Tone.AutoPanner("4n").start();
const cheby: Tone.Chebyshev             = new Tone.Chebyshev(50);
const pingPong: Tone.PingPongDelay      = new Tone.PingPongDelay("4n", 0.2);
const pitchShift: Tone.PitchShift       = new Tone.PitchShift(5);
const autoWah: Tone.AutoWah             = new Tone.AutoWah({
    baseFrequency: 50,
    octaves: 6,
    sensitivity: -30,
    Q: 6
});
/**/