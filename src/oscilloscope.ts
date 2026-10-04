import * as Tone from "tone";
import { waveform } from "./instrument.js";

type VizMode = "waveform" | "fft" | "xy";

let currentMode: VizMode = "waveform";

export const fftNode = new Tone.FFT(64);
export const splitNode = new Tone.Split(2);
export const leftWaveform = new Tone.Waveform(512);
export const rightWaveform = new Tone.Waveform(512);

Tone.getDestination().connect(fftNode);
Tone.getDestination().connect(splitNode);
splitNode.connect(leftWaveform, 0);
splitNode.connect(rightWaveform, 1);

const canvas = document.getElementById("oscilloscope-canvas") as HTMLCanvasElement;
const ctx = canvas ? canvas.getContext("2d")! : null!;

document.addEventListener("DOMContentLoaded", () => {
  const modeButtons = document.querySelectorAll<HTMLButtonElement>(".viz-btn");
  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = (btn.dataset.mode as VizMode) || "waveform";
    });
  });

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.clientWidth || 300;
    canvas.height = canvas.clientHeight || 150;
  }
  
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
});

export function drawOscilloscope() {
  requestAnimationFrame(drawOscilloscope);

  if (!canvas || !ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  ctx.fillStyle = "rgba(18, 18, 18, 0.35)";
  ctx.fillRect(0, 0, width, height);

  switch (currentMode) {
    case "waveform":
      drawWaveform(width, height);
      break;
    case "fft":
      drawFFT(width, height);
      break;
    case "xy":
      drawVectorscope(width, height);
      break;
  }
}

function drawWaveform(width: number, height: number) {
  const values = waveform.getValue();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#00ffcc";
  ctx.beginPath();

  const sliceWidth = width / values.length;
  let x = 0;

  for (let i = 0; i < values.length; i++) {
    const v = values[i] as number;
    const y = ((v + 1) / 2) * height;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.stroke();
}

function drawFFT(width: number, height: number) {
  const values = fftNode.getValue();
  const barWidth = (width / values.length) * 0.85;
  const gap = (width / values.length) * 0.15;

  for (let i = 0; i < values.length; i++) {
    const db = values[i] as number;
    const norm = Math.max(0, (db + 100) / 100);
    const barHeight = norm * height;

    const x = i * (barWidth + gap);
    const y = height - barHeight;

    const hue = (i / values.length) * 280;
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(x, y, barWidth, barHeight);
  }
}

function drawVectorscope(width: number, height: number) {
  const leftVal = leftWaveform.getValue();
  const rightVal = rightWaveform.getValue();
  const len = Math.min(leftVal.length, rightVal.length);

  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) * 0.4;

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#00e5ff";
  ctx.beginPath();

  for (let i = 0; i < len; i++) {
    const l = leftVal[i] as number;
    const r = rightVal[i] as number;

    const x = centerX + (l - r) * 0.707 * scale;
    const y = centerY - (l + r) * 0.707 * scale;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
}

function updateCanvasDimensions() {
  if (!canvas) return;
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

updateCanvasDimensions();
window.addEventListener("resize", updateCanvasDimensions);