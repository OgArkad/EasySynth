import * as Tone from "tone";
export { sequencer, sustain, switchSustain, unison, reverb, chorus, chorusSend, reverbSend, effects };
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
    sequence: [],
    sequences: "8n"
};
const reverb = new Tone.Reverb({
    decay: 2,
    wet: 0.3
});
reverb.generate();
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
}).start();
const chorusSend = new Tone.Gain(0);
chorus.connect(chorusSend);
const phaser = new Tone.Phaser({
    frequency: 80,
    octaves: 3,
    baseFrequency: 1000
});
const stereowidener = new Tone.StereoWidener(0);
const distortion = new Tone.Distortion(0.8);
const bitcrusher = new Tone.BitCrusher(4);
const tremolo = new Tone.Tremolo(9, 0.75);
const vibrato = new Tone.Vibrato(4, 0.5);
const autoFilter = new Tone.AutoFilter("4n");
const autoPanner = new Tone.AutoPanner("4n");
const cheby = new Tone.Chebyshev(50);
const pingPong = new Tone.PingPongDelay("4n", 0.2);
const pitchShift = new Tone.PitchShift(5);
const autoWah = new Tone.AutoWah({
    baseFrequency: 50,
    octaves: 6,
    sensitivity: -30,
    Q: 6
});
const effects = [phaser, stereowidener, distortion, bitcrusher, tremolo, vibrato, pingPong, autoWah];
//# sourceMappingURL=effects.js.map