import * as Tone from "tone";
export {
  sequencer,
  sustain,
  switchSustain,
  unison,
  reverb,
  chorus,
  chorusSend,
  reverbSend,
  effects,
  currentEffect,
  SwitchCurrentEffect
};

let sustain: boolean = false;

function SwitchCurrentEffect(effectIndex: number | null){
    currentEffect = effectIndex;
}

function switchSustain(value: boolean = !sustain){
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
    recStart: 0 as number,
    length: Tone.Time("1m").toSeconds()
}

const reverb: Tone.Reverb = new Tone.Reverb({
  decay: 2,
  wet: 0.65
});
reverb.generate();//you should await it, but here it causes magical bugs

const reverbSend: Tone.Gain<"gain"> = new Tone.Gain(0);
reverb.connect(reverbSend);

const delay: Tone.FeedbackDelay = new Tone.FeedbackDelay({
  delayTime: "8n",
  feedback: 0.5,
  wet: 0.65
});

const chorus: Tone.Chorus = new Tone.Chorus({
  frequency: 1.5,
  delayTime: 3.5,
  depth: 0.7
}).start();

const chorusSend: Tone.Gain<"gain"> = new Tone.Gain(0);
chorus.connect(chorusSend);

const phaser: Tone.Phaser = new Tone.Phaser({
  frequency: 80,
  octaves: 3,
  baseFrequency: 1000
});
const stereowidener: Tone.StereoWidener = new Tone.StereoWidener(0.85);
const distortion: Tone.Distortion = new Tone.Distortion(0.8);
const bitcrusher: Tone.BitCrusher = new Tone.BitCrusher(4);
const tremolo: Tone.Tremolo = new Tone.Tremolo(9, 0.75);
const vibrato: Tone.Vibrato = new Tone.Vibrato(4, 0.8);

const autoFilter: Tone.AutoFilter = new Tone.AutoFilter("4n");
const autoPanner: Tone.AutoPanner = new Tone.AutoPanner("4n");
const cheby: Tone.Chebyshev = new Tone.Chebyshev(50);
const pingPong = new Tone.PingPongDelay({
    delayTime: "4n",
    feedback: 0.2,
    wet: 0.7
});
const pitchShift: Tone.PitchShift = new Tone.PitchShift(5);
const autoWah: Tone.AutoWah = new Tone.AutoWah({
  baseFrequency: 50,
  octaves: 6,
  sensitivity: -30,
  Q: 6
});

type EffectM = {
  node: Tone.InputNode,
  start?: () => void,
  stop?: () => void
};

const effects: EffectM[] = [
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

let currentEffect: number | null = null;
