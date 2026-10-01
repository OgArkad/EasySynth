import {start, Transport} from "tone"; //npm install tone
import MIDI from "./MIDI.js";
import * as Effect from "./effects.js";
import {synth, filter, lfo, panner, expression, synths, volume, waveform, seq} from "./instrument.js";
import * as Preset from "./presets.js";
import { drawOscilloscope } from "./oscilloscope.js";
//localhost: npm run dev, build: npm run build

const midi: MIDI = new MIDI;
let started: boolean = false;

const keyboardonehun: Record<string, string> = {//higher notes, because usually you hear them cleaner (due to technologycal issues)
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

let keyboard:Record<string, string | undefined> = keyboardtwohun;


document.getElementById("start")?.addEventListener("click", async (e) => {
    if (started) return;

    await start(); //aka Tone.start
    Transport.start();

    const startElem = document.getElementById("start");
    if (startElem) startElem.style.display = "none";

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

    //lfo.connect(filter.frequency);

    synth.releaseAll(0);
    synths.forEach((s) => s.triggerRelease());

    Preset.loadLocalPresets();
    Preset.loadPreset(Preset.presets[Preset.currentPreset], synth);

    drawOscilloscope();

    midi.init().catch((err) => {
        console.warn("MIDI initialization warning/error:", err);
    });

    started = true;
    console.log("Synth started/reset!");
});

window.onblur = function(){synth.releaseAll(0);
    synths.forEach((synth) => synth.triggerRelease());
};

document.addEventListener("keydown", (e) => {
    if (e.repeat || !started) return;
    let note = keyboard[e.key];
    if (note === undefined) return;
    if (!Effect.unison.on) synth.triggerAttack(note);
    else synths.forEach((synth) => synth.triggerAttack(note));
    if (Effect.sequencer.recording) seq.add((Transport.seconds - Effect.sequencer.recStart) % Effect.sequencer.length, note);
});

document.addEventListener("keyup", (e) => {
    if (e.key === 'Enter'){
        if (Effect.sequencer.on){
            seq.loop = false;
            seq.stop();
            Effect.sequencer.on = false;
            Effect.sequencer.recording = false;
            console.info("sequencer paused");
        }else{
            seq.start();
            seq.loop = true;
            Effect.sequencer.recording = true;
            Effect.sequencer.recStart = Transport.seconds;
            Effect.sequencer.on = true;
            console.info("sequencer started");
        }
        return;
    }
    if (e.key === ' '){
        if (!Effect.sequencer.on){
            seq.start();
            seq.loop = true;
            Effect.sequencer.recording = true;
            Effect.sequencer.recStart = Transport.seconds;
            Effect.sequencer.on = true;
            console.info("sequencer started");
        }
        Effect.sequencer.recording = !Effect.sequencer.recording;
        return;
    }
    if (e.key === 'Backspace'){
        seq.loop = false;
        seq.stop();
        Effect.sequencer.on = false;
        Effect.sequencer.recording = false;
        seq.clear();
        console.info("sequencer stopped");
    }

    let note = keyboard[e.key]
    if (note === undefined || Effect.sustain) return;

    if (!Effect.unison.on) synth.triggerRelease(note);
    else synths.forEach((synth) => synth.triggerRelease());
});

console.debug("script.js loaded!");

// (x,e *3, g, 6 *3, m, i * 3, b,z *3 )