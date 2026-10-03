import { start, Transport } from "tone";
import MIDI from "./MIDI.js";
import * as Effect from "./effects.js";
import { synth, filter, lfo, panner, expression, synths, volume, waveform, seq } from "./instrument.js";
import * as Preset from "./presets.js";
import {keyboard} from "./UI.js";
import * as Tone from "tone";

const midi: MIDI = new MIDI();
let started: boolean = false;

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

    lfo.connect(filter.frequency);

    synth.releaseAll(0);
    synths.forEach((s: any) => s.triggerRelease());

    Preset.loadPreset(Preset.presets[Preset.currentPreset], synth);

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

document.addEventListener("keyup", (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    if (Effect.sequencer.on) {
      seq.loop = false;
      seq.stop();
      Effect.sequencer.on = false;
      Effect.sequencer.recording = false;
    } else {
      seq.start();
      seq.loop = true;
      Effect.sequencer.recording = true;
      Effect.sequencer.recStart = Transport.seconds;
      Effect.sequencer.on = true;
    }
    return;
  }
  if (e.key === ' ') {
    Effect.sequencer.recording = !Effect.sequencer.recording;
    return;
  }
  if (e.key === 'Backspace') {
    seq.loop = false;
    seq.stop();
    Effect.sequencer.on = false;
    Effect.sequencer.recording = false;
    seq.clear();
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