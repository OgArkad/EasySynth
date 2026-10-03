import { synth } from "./instrument.js";
let synthDest = document.querySelector(".synth-chassis");
const WhiteNotes = [
    "C4", "D4", "E4", "F4", "G4", "A4", "B4",
    "C5", "D5", "E5", "F5", "G5", "A5", "B5",
    "C6", "D6", "E6"
];
const BlackNotes = [
    "C#4", "D#4", "F#4", "G#4", "A#4",
    "C#5", "D#5", "F#5", "G#5", "A#5",
    "C#6", "D#6"
];
function buildPiano() {
    if (!synthDest)
        return;
    const existingKeys = synthDest.querySelectorAll('.piano-key');
    existingKeys.forEach(k => k.remove());
    const isMobile = window.innerWidth <= 768;
    const totalWhiteKeys = WhiteNotes.length;
    if (isMobile) {
        const containerWidth = window.innerWidth;
        const whiteKeyWidth = containerWidth / totalWhiteKeys;
        const blackKeyWidth = whiteKeyWidth * 0.65;
        for (let i = 0; i < totalWhiteKeys; i++) {
            const whiteNote = document.createElement("img");
            whiteNote.src = "./white.png";
            whiteNote.className = "piano-key white-key-mobile";
            whiteNote.style.position = "absolute";
            whiteNote.style.bottom = "0";
            whiteNote.style.left = `${i * whiteKeyWidth}px`;
            whiteNote.style.width = `${whiteKeyWidth}px`;
            whiteNote.style.height = "85vh";
            whiteNote.style.touchAction = "none";
            whiteNote.style.zIndex = "1";
            const note = WhiteNotes[i];
            if (note) {
                whiteNote.addEventListener("pointerdown", (e) => { e.preventDefault(); synth.triggerAttack(note); });
                whiteNote.addEventListener("pointerup", () => synth.triggerRelease(note));
                whiteNote.addEventListener("pointerleave", () => synth.triggerRelease(note));
            }
            synthDest.appendChild(whiteNote);
        }
        const blackKeyIndices = [0.65, 1.7, 3.65, 4.7, 5.7, 7.65, 8.7, 10.65, 11.7, 12.7, 14.65, 15.7];
        blackKeyIndices.forEach((posIndex, index) => {
            const blackNote = document.createElement("img");
            blackNote.src = "./black.png";
            blackNote.className = "piano-key black-key-mobile";
            blackNote.style.position = "absolute";
            blackNote.style.top = "15vh";
            blackNote.style.left = `${posIndex * whiteKeyWidth}px`;
            blackNote.style.width = `${blackKeyWidth}px`;
            blackNote.style.height = "50vh";
            blackNote.style.zIndex = "2";
            blackNote.style.touchAction = "none";
            const note = BlackNotes[index];
            if (note) {
                blackNote.addEventListener("pointerdown", (e) => {
                    e.preventDefault();
                    synth.triggerAttack(note);
                    blackNote.classList.add('noteIs-hovered');
                });
                blackNote.addEventListener("pointerup", () => {
                    synth.triggerRelease(note);
                    blackNote.classList.remove('noteIs-hovered');
                });
                blackNote.addEventListener("pointerleave", () => {
                    synth.triggerRelease(note);
                    blackNote.classList.remove('noteIs-hovered');
                });
            }
            synthDest.appendChild(blackNote);
        });
    }
    else {
        const keyWidth = 2.5;
        const StartLeft = 3;
        for (let white = 0; white < totalWhiteKeys; white++) {
            let whiteNote = document.createElement("img");
            whiteNote.src = "./white.png";
            whiteNote.className = "piano-key";
            whiteNote.style.position = "absolute";
            whiteNote.style.top = "51vh";
            whiteNote.style.left = `${StartLeft + (white * keyWidth)}vw`;
            whiteNote.style.width = `${keyWidth}vw`;
            whiteNote.style.height = "auto";
            const note = WhiteNotes[white];
            if (note) {
                whiteNote.addEventListener("pointerdown", (e) => { e.preventDefault(); synth.triggerAttack(note); });
                whiteNote.addEventListener("pointerup", () => synth.triggerRelease(note));
                whiteNote.addEventListener("pointerleave", () => synth.triggerRelease(note));
            }
            synthDest.appendChild(whiteNote);
        }
        const blackButtons = [0.5, 1.6, 3.6, 4.6, 5.6, 7.6, 8.6, 10.6, 11.6, 12.6, 14.6, 15.6];
        blackButtons.forEach((buttonIndex, index) => {
            let blackNote = document.createElement("img");
            blackNote.src = "./black.png";
            blackNote.className = "piano-key";
            blackNote.style.position = "absolute";
            blackNote.style.top = "50vh";
            blackNote.style.left = `${StartLeft + (buttonIndex * keyWidth)}vw`;
            blackNote.style.width = `${keyWidth * 1}vw`;
            blackNote.style.height = "auto";
            blackNote.style.zIndex = "2";
            const note = BlackNotes[index];
            if (note) {
                blackNote.addEventListener("pointerdown", (e) => {
                    e.preventDefault();
                    synth.triggerAttack(note);
                    blackNote.classList.add('noteIs-hovered');
                });
                blackNote.addEventListener("pointerup", () => {
                    synth.triggerRelease(note);
                    blackNote.classList.remove('noteIs-hovered');
                });
                blackNote.addEventListener("pointerleave", () => {
                    synth.triggerRelease(note);
                    blackNote.classList.remove('noteIs-hovered');
                });
            }
            synthDest.appendChild(blackNote);
        });
    }
}
window.addEventListener("DOMContentLoaded", buildPiano);
window.addEventListener("resize", buildPiano);
window.addEventListener("orientationchange", buildPiano);
//# sourceMappingURL=piano.js.map