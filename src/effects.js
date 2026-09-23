import * as Tone from "tone"; //only needed in TS, remove before production
export { sequencer, sustain, switchSustain, unison, reverb, chorus, chorusSend, reverbSend, /* delay, phaser, stereowidener, distortion, bitcrusher, tremolo, vibrato, /** / autoFilter, autoPanner, cheby, pingPong, pitchShift, autoWah/**/ };
let sustain = false;
function switchSustain(value = !sustain) {
    sustain = value;
}
const unison = {
    on: false,
    detune: 10,
    voices: 3
};
const sequencer = {
    on: false,
    sequence: ["C4"],
    sequences: "8n"
};
sequencer.sequence.length = 0; //removing C4, but needed in declaration, because of type, else null
const reverb = new Tone.Reverb({
    decay: 2,
    wet: 0.3
});
const reverbSend = new Tone.Gain(0);
reverb.connect(reverbSend);
const delay = new Tone.FeedbackDelay({
    delayTime: "8n",
    feedback: 0.5,
    wet: 0.3
});
const chorus = new Tone.Chorus({
    frequency: 1.5,
    delayTime: 3.5,
    depth: 0.7
});
const chorusSend = new Tone.Gain(0);
chorus.connect(chorusSend);
/*
const phaser: Tone.Phaser = new Tone.Phaser({
    frequency: 80,
    octaves: 3,
    baseFrequency: 1000
});
const stereowidener: Tone.StereoWidener = new Tone.StereoWidener(0);//0: mid, 1: side
const distortion: Tone.Distortion       = new Tone.Distortion(0.8);
const bitcrusher: Tone.BitCrusher       = new Tone.BitCrusher(4);
const tremolo: Tone.Tremolo             = new Tone.Tremolo(9, 0.75);
const vibrato: Tone.Vibrato             = new Tone.Vibrato(4, 0.5);
/** /
const autoFilter: Tone.AutoFilter       = new Tone.AutoFilter("4n");
const autoPanner: Tone.AutoPanner       = new Tone.AutoPanner("4n");
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
//# sourceMappingURL=effects.js.map