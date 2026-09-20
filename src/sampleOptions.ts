import { presets, loadPreset, type SynthPreset } from "./presets.js";
import { synth, filter, lfo } from "./instrument.js";

const options = document.getElementById("sampleOptions") as HTMLSelectElement | null;
const add = document.getElementById("sampleAddOptions") as HTMLElement | null;

function renderPresetOptions() {
  if (!options) return;
  options.innerHTML = ""; 

  presets.forEach((preset, index) => {
    const opt = document.createElement("option");
    opt.value = index.toString(); 
    opt.textContent = preset.name; 
    options.appendChild(opt);
  });
}

renderPresetOptions();

options?.addEventListener("change", (e) => {
  const selectedIndex = parseInt((e.target as HTMLSelectElement).value, 10);
  const selectedPreset = presets[selectedIndex];

  if (selectedPreset) {
    loadPreset(selectedPreset, synth, filter, lfo);
    console.log(`Loaded preset: ${selectedPreset.name}`);
  }
});

add?.addEventListener("click", () => {
  const title = prompt("Sample name:") || "Untitled";

  const newPreset: SynthPreset = {
    name: title,
    oscillator: {
      type: "sawtooth", 
      octave: 0,
      detune: 0,
      volume: 0
    },
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.5,
      release: 1
    }
  };

  presets.push(newPreset);

  renderPresetOptions();
  if (options) {
    options.value = (presets.length - 1).toString();
    loadPreset(newPreset, synth, filter, lfo);
  }
});