import MIDI from "./MIDI.js";
import * as Effect from "./effects.js";
import * as Tone from "tone"; //npm install tone
import {synth, filter, lfo, panner, expression} from "./instrument.js";
import * as Preset from "./presets.js";
//npm run dev localhosthoz, véglegessen pedig npm run build

const midi: MIDI = new MIDI;
let started: boolean = false;


const keyboardonehun: Record<string, string> = {
        w: "C#5", e: "D#5",        t: "F#5", z: "G#5", u: "A#5",
    a: "C5", s: "D5", d: "E5", f: "F5", g: "G5", h: "A5", j: "B5", k: "C5"
};

const keyboardtwohun: Record<string, string> = {
        3: "C#5", 4: "D#5",        6: "F#5", 7: "G#5", 8: "A#5",
    w: "C5", e: "D5", r: "E5", t: "F5", z: "G5", u: "A5", i: "B5", o: "C5",
        s: "C#4", d: "D#4",        g: "F#4", h: "G#4", j: "A#4",
    y: "C4", x: "D4", c: "E4", v: "F4", b: "G4", n: "A4", m: "B4", ',': "C4",
};

const keyboardoneeng: Record<string, string> = keyboardonehun;

const keyboardtwoeng: Record<string, string> = keyboardtwohun;

function loadPreset(preset: Preset.SynthPreset){
    synth.set({
        oscillator: preset.oscillator,
        envelope: preset.envelope
    });

    if (preset.filter) {
        filter.set(preset.filter);
    }
    if (preset.lfo) {
        lfo.set(preset.lfo);
        lfo.start();
    }
    else {
        lfo.stop();
    }
}

document.getElementById("start")?.addEventListener("click", async (e) => {
    (e.currentTarget as HTMLElement).remove();

    await Tone.start();

    if (!started){
        synth.connect(filter);
        filter.connect(panner);
        panner.connect(expression);
        expression.connect(Effect.reverb);
        Effect.chorus.start();
        Effect.reverb.connect(Effect.chorus);
        filter.toDestination();

        lfo.connect(filter.frequency);
    }
    synth.releaseAll(0);

    loadPreset(Preset.defaultPreset); //after every button state change need to be called

    try {
        await midi.init();
    } catch (err) {
        console.error(err);
    }

    synth.releaseAll(0);
    started = true;
    console.log("Synth started/reseted!");
}); 

document.addEventListener("keydown", (e) => {
    if (e.repeat || !started) return;
    console.log(e.key);
    let note = keyboardtwohun[e.key];
    if (note != undefined)
        synth.triggerAttack(note);
});

document.addEventListener("keyup", (e) => {
    let note = keyboardtwohun[e.key]
    if (note != undefined)
        synth.triggerRelease(note);
});

export const waveform = new Tone.Waveform(1024);

Effect.chorus.connect(waveform);
Effect.chorus.toDestination();

console.log("script.js loaded!");

// (x,e *3, g, 6 *3, m, i * 3, b,z *3 ) 