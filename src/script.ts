import {start, Transport} from "tone"; //npm install tone
import MIDI from "./MIDI.js";
import * as Effect from "./effects.js";
import {synth, filter, lfo, panner, expression, synths, volume, waveform, seq} from "./instrument.js";
import * as Preset from "./presets.js";
import {keyboard} from "./UI.js";
//localhost: npm run dev, build: npm run build

const midi: MIDI = new MIDI;
let started: boolean = false;

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

    lfo.connect(filter.frequency);

    synth.releaseAll(0);
    synths.forEach((s) => s.triggerRelease());

    Preset.loadPreset(Preset.presets[Preset.currentPreset], synth);

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