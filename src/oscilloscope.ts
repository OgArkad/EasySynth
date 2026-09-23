import { waveform } from "./script.js";

const canvas = document.getElementById("oscilloscope-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

export function drawOscilloscope() {
  requestAnimationFrame(drawOscilloscope);

  const values = waveform.getValue();

  ctx.fillStyle = "#121212";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#00ffcc";
  ctx.beginPath();

  const sliceWidth = canvas.width / values.length;
  let x = 0;

  for (let i = 0; i < values.length; i++) {
    const v = (values[i] as number);
    const y = ((v + 1) / 2) * canvas.height;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.stroke();
}