import { start, Transport } from "tone";
import MIDI from "./MIDI.js";
import * as Effect from "./effects.js";
import { synth, filter, lfo, panner, expression, synths, volume, waveform, seq } from "./instrument.js";
import * as Preset from "./presets.js";
import { drawOscilloscope } from "./oscilloscope.js";
import * as Tone from "tone";

const midi: MIDI = new MIDI();
let started: boolean = false;

const keyboardonehun: Record<string, string> = {
  w: "C#5", e: "D#5", t: "F#5", z: "G#5", u: "A#5",
  a: "C5", s: "D5", d: "E5", f: "F5", g: "G5", h: "A5", j: "B5", k: "C6"
};

const keyboardtwohun: Record<string, string> = {
  3: "C#5", 4: "D#5", 6: "F#5", 7: "G#5", 8: "A#5",
  w: "C5", e: "D5", r: "E5", t: "F5", z: "G5", u: "A5", i: "B5", o: "C6",
  s: "C#4", d: "D#4", g: "F#4", h: "G#4", j: "A#4",
  y: "C4", x: "D4", c: "E4", v: "F4", b: "G4", n: "A4", m: "B4", ',': "C5"
};

let keyboard: Record<string, string | undefined> = keyboardtwohun;

async function autoStartAudio() {
  if (started) return;

  try {
    await start();
    if (Tone.getContext().state !== "running") {
      await Tone.getContext().resume();
    }
    Transport.start();

    if (screen.orientation && typeof screen.orientation.lock === "function") {
      screen.orientation.lock("landscape").catch(() => {});
    }

    synths.forEach((s: any) => s.connect(volume));
    synth.connect(volume);
    volume.connect(filter);
    filter.connect(panner);
    panner.connect(expression);
    expression.connect(Effect.reverb);
    Effect.reverb.connect(Effect.chorus);
    Effect.chorus.connect(waveform);
    Effect.chorus.toDestination();

    synth.releaseAll(0);
    synths.forEach((s: any) => s.triggerRelease());

    Preset.loadLocalPresets();
    Preset.loadPreset(Preset.presets[Preset.currentPreset], synth);

    drawOscilloscope();

    midi.init().catch((err: unknown) => {
      console.warn("MIDI init warning:", err);
    });

    started = true;

    const startElem = document.getElementById("start");
    if (startElem) startElem.style.display = "none";
  } catch (err: unknown) {
    console.error("Audio activation failed:", err);
  }
}

window.addEventListener("pointerdown", autoStartAudio, { once: true });
window.addEventListener("touchstart", autoStartAudio, { once: true });

window.onblur = function () {
  synth.releaseAll(0);
  synths.forEach((s: any) => s.triggerRelease());
};

document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.repeat || !started) return;
  let note = keyboard[e.key];
  if (note === undefined) return;
  if (!Effect.unison.on) synth.triggerAttack(note);
  else synths.forEach((s: any) => s.triggerAttack(note));
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

  let note = keyboard[e.key];
  if (note === undefined || Effect.sustain) return;

  if (!Effect.unison.on) synth.triggerRelease(note);
  else synths.forEach((s: any) => s.triggerRelease());
});

function handleKeyPlay(target: HTMLElement | null) {
  if (!target) return;
  const keyElem = target.closest<HTMLElement>("[data-note]");
  if (!keyElem) return;

  const note = keyElem.getAttribute("data-note");
  if (note) {
    if (!Effect.unison.on) synth.triggerAttack(note);
    else synths.forEach((s: any) => s.triggerAttack(note));
  }
}

function handleKeyRelease(target: HTMLElement | null) {
  if (!target) return;
  const keyElem = target.closest<HTMLElement>("[data-note]");
  if (!keyElem) return;

  const note = keyElem.getAttribute("data-note");
  if (note && !Effect.sustain) {
    if (!Effect.unison.on) synth.triggerRelease(note);
    else synths.forEach((s: any) => s.triggerRelease());
  }
}

document.addEventListener("pointerdown", (e: PointerEvent) => {
  if (!started) autoStartAudio();
  handleKeyPlay(e.target as HTMLElement);
});

document.addEventListener("pointerup", (e: PointerEvent) => {
  handleKeyRelease(e.target as HTMLElement);
});

document.addEventListener("pointercancel", (e: PointerEvent) => {
  handleKeyRelease(e.target as HTMLElement);
});

async function unlockAudio() {
  if (started) return;

  try {
    await start();
    if (Tone.getContext().state !== "running") {
      await Tone.getContext().resume();
    }

    const ctx = Tone.getContext().rawContext as AudioContext;
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    Transport.start();

    synths.forEach((s: any) => s.connect(volume));
    synth.connect(volume);
    volume.connect(filter);
    filter.connect(panner);
    panner.connect(expression);
    expression.connect(Effect.reverb);
    Effect.reverb.connect(Effect.chorus);
    Effect.chorus.connect(waveform);
    Effect.chorus.toDestination();

    synth.releaseAll(0);
    synths.forEach((s: any) => s.triggerRelease());

    Preset.loadLocalPresets();
    Preset.loadPreset(Preset.presets[Preset.currentPreset], synth);

    drawOscilloscope();

    midi.init().catch((err: unknown) => {
      console.warn("MIDI init warning:", err);
    });

    started = true;

    const startElem = document.getElementById("start");
    if (startElem) startElem.style.display = "none";
  } catch (err: unknown) {
    console.error("Audio activation failed:", err);
  }
}