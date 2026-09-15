import MIDI from "./MIDI.js";
import * as effect from "./effects.js";
import * as Tone from "tone"; //npm install tone
import {synth} from "./instruments.js";
//npm run dev localhosthoz, véglegessen pedig npm run build

const midi: MIDI = new MIDI;
let started: boolean = false;

const keyboard: Record<string, string> = {
        w: "C#4", e: "D#4",        t: "F#4", z: "G#4", u: "A#4",
    a: "C4", s: "D4", d: "E4", f: "F4", g: "G4", h: "A4", j: "B4", k: "C5"
};

async function playnote(note: string, synt: Tone.PolySynth<Tone.Synth<Tone.SynthOptions>>){
    synt.triggerAttack(note);
}

async function playSound(note: number, velocity: number){
    synth.triggerAttack(
            Tone.Frequency(note, "midi").toFrequency(),
            undefined,
            velocity / 127
        );
}

async function releaseSound(note: number){
    synth.triggerRelease(Tone.Frequency(note, "midi").toFrequency())
}

document.getElementById("start")?.addEventListener("click", async (e) => {
    synth.toDestination();
    await Tone.start();

    midi.playSound = playSound;
    midi.releaseSound = releaseSound;
    try {
        await midi.init();
    } catch (err) {
        console.error(err);
    }
    
    synth.releaseAll(0);
    started = true;
    synth.chain(effect.vibrato, Tone.getDestination());//optional
    console.log("Synth started/reseted!");
});

document.addEventListener("keydown", (e) => {
    if (e.repeat || !started) return;
    console.log(e.key);
    let note = keyboard[e.key];
    if (note != undefined)
        playnote(note, synth);
});

document.addEventListener("keyup", (e) => {
    let note = keyboard[e.key]
    if (note != undefined)
        synth.triggerRelease(note);
});

console.log("script.js loaded!");