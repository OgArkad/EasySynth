import { waveform } from "./script.js";
const canvas = document.getElementById("oscilloscope-canvas");
const ctx = canvas.getContext("2d");
function drawOscilloscope() {
    requestAnimationFrame(drawOscilloscope);
    // Get current audio signal buffer values (-1 to 1)
    const values = waveform.getValue();
    // Clear previous frame
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw waveform path
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#00ffcc"; // Hardware glowing color
    ctx.beginPath();
    const sliceWidth = canvas.width / values.length;
    let x = 0;
    for (let i = 0; i < values.length; i++) {
        // Map audio value range [-1, 1] to canvas height [0, canvas.height]
        const v = values[i];
        const y = ((v + 1) / 2) * canvas.height;
        if (i === 0) {
            ctx.moveTo(x, y);
        }
        else {
            ctx.lineTo(x, y);
        }
        x += sliceWidth;
    }
    ctx.stroke();
}
// Start visualizer loop
drawOscilloscope();
//# sourceMappingURL=oscilloscope.js.map