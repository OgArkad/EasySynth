import MIDI from "./MIDI.js";
import * as Effect from "./effects.js";
import * as Tone from "tone"; //npm install tone
import { synth } from "./instruments.js";
import * as Preset from "./presets.js";
//npm run dev localhosthoz, véglegessen pedig npm run build
const midi = new MIDI;
let started = false;
const filter = new Tone.Filter();
const lfo = new Tone.LFO();
const keyboardonehun = {
    w: "C#4", e: "D#4", t: "F#4", z: "G#4", u: "A#4",
    a: "C4", s: "D4", d: "E4", f: "F4", g: "G4", h: "A4", j: "B4", k: "C5"
};
const keyboardtwohun = {
    3: "C#4", 4: "D#4", 6: "F#4", 7: "G#4", 8: "A#4",
    w: "C4", e: "D4", r: "E4", t: "F4", z: "G4", u: "A4", i: "B4", o: "C5",
    s: "C#3", d: "D#3", g: "F#3", h: "G#3", j: "A#3",
    y: "C3", x: "D3", c: "E3", v: "F3", b: "G3", n: "A3", m: "B3", ',': "C3",
};
const keyboardoneeng = keyboardonehun;
const keyboardtwoeng = keyboardtwohun;
async function playnote(note, synt) {
    synt.triggerAttack(note);
}
async function playSound(note, velocity) {
    synth.triggerAttack(Tone.Frequency(note, "midi").toFrequency(), undefined, velocity / 127);
}
function loadPreset(preset) {
    synth.set({
        oscillator: preset.oscillator,
        envelope: preset.envelope
    });
    if (preset.filter) {
        filter.set(preset.filter);
    }
    if (preset.lfo) {
        lfo.set(preset.lfo);
    }
}
async function releaseSound(note) {
    synth.triggerRelease(Tone.Frequency(note, "midi").toFrequency());
}
document.getElementById("start")?.addEventListener("click", async (e) => {
    await Tone.start();
    synth.connect(filter);
    filter.toDestination();
    lfo.connect(filter.frequency);
    lfo.start();
    synth.toDestination();
    loadPreset(Preset.triangle); //after every button state change need to be called
    midi.playSound = playSound;
    midi.releaseSound = releaseSound;
    try {
        await midi.init();
    }
    catch (err) {
        console.error(err);
    }
    synth.releaseAll(0);
    started = true;
    synth.chain(Effect.vibrato, Tone.getDestination()); //optional
    console.log("Synth started/reseted!");
});
document.addEventListener("keydown", (e) => {
    if (e.repeat || !started)
        return;
    console.log(e.key);
    let note = keyboardtwohun[e.key];
    if (note != undefined)
        playnote(note, synth);
});
document.addEventListener("keyup", (e) => {
    let note = keyboardtwohun[e.key];
    if (note != undefined)
        synth.triggerRelease(note);
});
console.log("script.js loaded!");
//# sourceMappingURL=script.js.map