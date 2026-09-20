import MIDI from "./MIDI.js";
import * as Effect from "./effects.js";
import * as Tone from "tone"; //npm install tone
import { synth, filter, lfo, panner, expression, synths } from "./instrument.js";
import * as Preset from "./presets.js";
//npm run dev localhosthoz, véglegessen pedig npm run build
const midi = new MIDI;
let started = false;
export const waveform = new Tone.Waveform(1024); //ez inkább az instrument.ts-be illik...
const keyboardonehun = {
    w: "C#5", e: "D#5", t: "F#5", z: "G#5", u: "A#5",
    a: "C5", s: "D5", d: "E5", f: "F5", g: "G5", h: "A5", j: "B5", k: "C6"
};
const keyboardtwohun = {
    3: "C#5", 4: "D#5", 6: "F#5", 7: "G#5", 8: "A#5",
    w: "C5", e: "D5", r: "E5", t: "F5", z: "G5", u: "A5", i: "B5", o: "C6",
    s: "C#4", d: "D#4", g: "F#4", h: "G#4", j: "A#4",
    y: "C4", x: "D4", c: "E4", v: "F4", b: "G4", n: "A4", m: "B4", ',': "C5",
};
const keyboardoneeng = {
    ...keyboardonehun,
    y: "G#5",
    z: undefined,
};
;
const keyboardtwoeng = {
    ...keyboardtwohun,
    y: "G5",
    z: "C4",
};
let keyboard = keyboardtwohun;
const pressed = new Set();
document.getElementById("start")?.addEventListener("click", async (e) => {
    e.currentTarget.remove();
    if (!started) {
        await Tone.start();
        synth.connect(filter);
        filter.connect(panner);
        panner.connect(expression);
        expression.connect(Effect.reverb);
        Effect.reverb.connect(Effect.chorus);
        Effect.chorus.connect(waveform);
        Effect.chorus.toDestination();
        lfo.connect(filter.frequency);
    }
    synth.releaseAll(0);
    synths.forEach((synth) => synth.triggerRelease());
    Preset.loadPreset(Preset.presets[Preset.currentPreset], synth); //after every button state change need to be called
    try {
        await midi.init();
    }
    catch (err) {
        console.error(err);
    }
    synth.releaseAll(0);
    started = true;
    console.log("Synth started/reseted!");
});
document.addEventListener("keydown", (e) => {
    if (e.repeat || !started)
        return;
    console.log(e.key);
    let note = keyboard[e.key];
    if (note != undefined) {
        if (!Effect.unison.on)
            synth.triggerAttack(note);
        else
            synths.forEach((synth) => synth.triggerAttack(note));
        pressed.add(note);
    }
});
document.addEventListener("keyup", (e) => {
    let note = keyboard[e.key];
    if (note != undefined && !Effect.sustain) {
        if (!Effect.unison.on)
            synth.triggerRelease(note);
        else
            synths.forEach((synth) => synth.triggerRelease());
        pressed.delete(note);
    }
});
console.log("script.js loaded!");
// (x,e *3, g, 6 *3, m, i * 3, b,z *3 ) 
//# sourceMappingURL=script.js.map