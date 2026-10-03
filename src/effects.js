import * as Tone from "tone";
export { sequencer, sustain, switchSustain, unison, reverb, chorus, chorusSend, reverbSend, effects, currentEffect, SwitchCurrentEffect };
let sustain = false;
function SwitchCurrentEffect(effectIndex) {
    currentEffect = effectIndex;
}
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
    sequences: "8n",
    recording: false,
    recStart: 0,
    length: Tone.Time("1m").toSeconds()
};
const reverb = new Tone.Reverb({
    decay: 2,
    wet: 0.65
});
reverb.generate(); //you should await it, but here it causes magical bugs
const reverbSend = new Tone.Gain(0);
reverb.connect(reverbSend);
const delay = new Tone.FeedbackDelay({
    delayTime: "8n",
    feedback: 0.5,
    wet: 0.65
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
const stereowidener = new Tone.StereoWidener(0.85);
const distortion = new Tone.Distortion(0.8);
const bitcrusher = new Tone.BitCrusher(4);
const tremolo = new Tone.Tremolo(9, 0.75);
const vibrato = new Tone.Vibrato(4, 0.8);
const autoFilter = new Tone.AutoFilter("4n");
const autoPanner = new Tone.AutoPanner("4n");
const cheby = new Tone.Chebyshev(50);
const pingPong = new Tone.PingPongDelay({
    delayTime: "4n",
    feedback: 0.2,
    wet: 0.7
});
const pitchShift = new Tone.PitchShift(5);
const autoWah = new Tone.AutoWah({
    baseFrequency: 50,
    octaves: 6,
    sensitivity: -30,
    Q: 6
});
const effects = [
    { node: phaser.toDestination() },
    { node: stereowidener.toDestination() },
    { node: distortion.toDestination() },
    { node: bitcrusher.toDestination() },
    {
        node: autoFilter.toDestination(),
        start: () => autoFilter.start(),
        stop: () => autoFilter.stop()
    },
    {
        node: autoPanner.toDestination(),
        start: () => autoPanner.start(),
        stop: () => autoPanner.stop()
    },
    {
        node: tremolo.toDestination(),
        start: () => tremolo.start(),
        stop: () => tremolo.stop()
    },
    { node: vibrato.toDestination() },
    { node: pingPong.toDestination() },
    { node: autoWah.toDestination() },
    { node: delay.toDestination() },
    { node: chorus.toDestination(),
        start: () => chorus.start(),
        stop: () => chorus.stop()
    },
    { node: cheby.toDestination() },
    { node: pitchShift.toDestination() },
    { node: reverb.toDestination() }
];
let currentEffect = null;
//# sourceMappingURL=effects.js.map