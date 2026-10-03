import { presets, loadPreset, currentPreset, switchPreset, type SynthPreset, loadLocalPresets } from "./presets.js";
import { synth, filter, lfo } from "./instrument.js";

const options = document.getElementById("sampleOptions") as HTMLSelectElement | null;
const add = document.getElementById("sampleAddOptions") as HTMLElement | null;
let presIndex: number = 0;

function renderPresetOptions() {
  if (!options) return;
  options.innerHTML = "";
  loadLocalPresets();

  presets.forEach((preset, index) => {
    const opt = document.createElement("option");
    opt.value = index.toString();
    opt.textContent = preset.name;
    options.appendChild(opt);
  });
}

renderPresetOptions();

options?.addEventListener("change", (e) => {
  switchPreset(parseInt((e.target as HTMLSelectElement).value, 10));
  const selectedPreset = presets[currentPreset];

  if (selectedPreset) {
    loadPreset(selectedPreset, synth, filter, lfo, true);
    console.log(`Loaded preset: ${selectedPreset.name}`);
  }
});

add?.addEventListener("click", () => {
  const title = prompt("Sample name:") || "Untitled";

  if (presets.some((preset) => preset.name === title)) {
    alert(`Preset with the name "${title}" already exists!\nPlease choose a different name.`);
    return;
  }

  const newPreset: SynthPreset = {
    name: title,
    itemId: "preset" + presIndex,
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

  presets.push(newPreset);//wil not update
  localStorage.setItem("preset" + presIndex, JSON.stringify(newPreset));
  presIndex++;

  renderPresetOptions();
  if (options) {
    options.value = (presets.length - 1).toString();
    loadPreset(newPreset, synth, filter, lfo, true);
  }
});