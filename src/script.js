import MIDI from "./MIDI.js";
import * as effect from "./effects.js";
import * as Tone from "tone"; //works via the tone.js package
//npm run dev localhosthoz, véglegessen pedig npm run build
const synth = new Tone.PolySynth(Tone.Synth);
let notes = [];
const midi = new MIDI;
let started = false;
const keyboard = {
    w: "C#4", e: "D#4", t: "F#4", z: "G#4", u: "A#4",
    a: "C4", s: "D4", d: "E4", f: "F4", g: "G4", h: "A4", j: "B4", k: "C5"
};
async function playnote(note, synt) {
    if (!notes.includes(note))
        notes.push(note);
    synt.triggerAttack(note);
}
async function playSound(note, velocity) {
    synth.triggerAttack(Tone.Frequency(note, "midi").toFrequency(), undefined, velocity / 127);
}
async function releaseSound(note) {
    synth.triggerRelease(Tone.Frequency(note, "midi").toFrequency());
}
document.getElementById("start")?.addEventListener("click", async (e) => {
    synth.toDestination();
    if (!midi.inited) {
        try {
            await midi.init();
        }
        catch (err) {
            console.error(err);
        }
    }
    if (midi.access?.inputs.values() === undefined)
        return;
    for (const input of midi.access?.inputs.values()) {
        console.log({
            id: input.id,
            name: input.name,
            manufacturer: input.manufacturer,
            state: input.state,
            connection: input.connection
        });
    }
    let inp = midi.access?.inputs.values().next().value?.id;
    if (inp)
        midi.selectInput(inp, playSound, releaseSound);
    await Tone.start();
    notes.forEach(e => {
        synth.triggerRelease(e, 0);
    });
    started = true;
    synth.chain(effect.vibrato, Tone.getDestination());
    console.log("Synth started/reseted!");
});
document.addEventListener("keydown", (e) => {
    if (e.repeat || !started)
        return;
    console.log(e.key);
    let note = keyboard[e.key];
    if (note != undefined)
        playnote(note, synth);
});
document.addEventListener("keyup", (e) => {
    let note = keyboard[e.key];
    if (note != undefined) {
        synth.triggerRelease(note);
        notes.splice(notes.indexOf(note), 1);
    }
});
console.log("script.js loaded!");
//# sourceMappingURL=script.js.map