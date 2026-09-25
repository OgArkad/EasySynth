import {start} from "tone"; //npm install tone
import MIDI from "./MIDI.js";
import * as Effect from "./effects.js";
import {synth, filter, lfo, panner, expression, synths, volume, waveform} from "./instrument.js";
import * as Preset from "./presets.js";
import { sequencer } from "./effects.js";
import { drawOscilloscope } from "./oscilloscope.js";
//localhost: npm run dev, build: npm run build

const midi: MIDI = new MIDI;
let started: boolean = false;

const keyboardonehun: Record<string, string> = {//higher notes, because usually you hear thet cleaner (due to technology)
        w: "C#5", e: "D#5",        t: "F#5", z: "G#5", u: "A#5",
    a: "C5", s: "D5", d: "E5", f: "F5", g: "G5", h: "A5", j: "B5", k: "C6"
};

const keyboardtwohun: Record<string, string> = {
        3: "C#5", 4: "D#5",        6: "F#5", 7: "G#5", 8: "A#5",
    w: "C5", e: "D5", r: "E5", t: "F5", z: "G5", u: "A5", i: "B5", o: "C6",
        s: "C#4", d: "D#4",        g: "F#4", h: "G#4", j: "A#4",
    y: "C4", x: "D4", c: "E4", v: "F4", b: "G4", n: "A4", m: "B4", ',': "C5",
};

const keyboardoneeng: Record<string, string | undefined> = {
    ...keyboardonehun,
    y: "G#5",
    z: undefined,
};;

const keyboardtwoeng: Record<string, string> = {
    ...keyboardtwohun,
    y: "G5",
    z: "C4",
};

let keyboard = keyboardtwohun;

const pressed: Set<string> = new Set<string>();

document.getElementById("start")?.addEventListener("click", async (e) => {
    if (started) return;

    await start(); //aka Tone.start

    const startElem = document.getElementById("start");
    if (startElem) startElem.style.display = "none";
    started = true;

    // 3. Load presets & connect audio chain
    Preset.loadLocalPresets();

    await start();// aka Tone.start();

    synths.forEach((synth) => {
        synth.connect(volume);
        volume.connect(filter);
        filter.connect(panner);
        panner.connect(expression);
        expression.connect(Effect.reverb);
        Effect.reverb.connect(Effect.chorus);
        Effect.chorus.connect(waveform);
        Effect.chorus.toDestination();
    });
    synth.connect(volume);
    volume.connect(filter);
    filter.connect(panner);
    panner.connect(expression);
    expression.connect(Effect.reverb);
    Effect.reverb.connect(Effect.chorus);
    Effect.chorus.connect(waveform);
    Effect.chorus.toDestination();

    lfo.connect(filter.frequency);

    synth.releaseAll(0);
    synths.forEach((s) => s.triggerRelease());

    Preset.loadPreset(Preset.presets[Preset.currentPreset], synth);

    drawOscilloscope();

    midi.init().catch((err) => {
        console.warn("MIDI initialization warning/error:", err);
    });

    console.log("Synth started/reset!");
});

window.onblur = function(){synth.releaseAll(0);
    synths.forEach((synth) => synth.triggerRelease());
};

document.addEventListener("keydown", (e) => {
    if (e.repeat || !started) return;
    let note = keyboard[e.key];
    if (note != undefined){
        if (!Effect.unison.on) synth.triggerAttack(note);
        else synths.forEach((synth) => synth.triggerAttack(note));
        pressed.add(note);
        if (Effect.sequencer.recording) sequencer.sequence.push(note);
    }
});

document.addEventListener("keyup", (e) => {
    let note = keyboard[e.key]
    if (note != undefined && !Effect.sustain){
        if (!Effect.unison.on) synth.triggerRelease(note);
        else synths.forEach((synth) => synth.triggerRelease());
        pressed.delete(note);
    }
});

console.debug("script.js loaded!");

// (x,e *3, g, 6 *3, m, i * 3, b,z *3 )