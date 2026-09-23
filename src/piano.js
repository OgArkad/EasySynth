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
if (synthDest) {
    const keyWidth = 2.5;
    const StartLeft = 3;
    for (let white = 0; white < 17; white++) {
        let whiteNote = document.createElement("img");
        whiteNote.src = "./white.png";
        whiteNote.style.position = "absolute";
        whiteNote.style.top = "51vh";
        whiteNote.style.left = `${StartLeft + (white * keyWidth)}vw`;
        whiteNote.style.width = `${keyWidth}vw`;
        whiteNote.style.height = "auto";
        const note = WhiteNotes[white];
        if (note) {
            whiteNote.addEventListener("mousedown", (e) => { e.preventDefault(); synth.triggerAttack(note); });
            whiteNote.addEventListener("mouseup", () => synth.triggerRelease(note));
            whiteNote.addEventListener("mouseleave", () => synth.triggerRelease(note));
        }
        synthDest.appendChild(whiteNote);
    }
    const blackButtons = [0.5, 1.6, 3.6, 4.6, 5.6, 7.6, 8.6, 10.6, 11.6, 12.6, 14.6, 15.6];
    blackButtons.forEach((buttonIndex, index) => {
        let blackNote = document.createElement("img");
        blackNote.src = "./black.png";
        blackNote.style.position = "absolute";
        blackNote.style.top = "50vh";
        blackNote.style.left = `${StartLeft + (buttonIndex * keyWidth)}vw`;
        blackNote.style.width = `${keyWidth * 1}vw`;
        blackNote.style.height = "auto";
        blackNote.style.zIndex = "2";
        const note = BlackNotes[index];
        if (note) {
            blackNote.addEventListener("mousedown", (e) => { e.preventDefault(); synth.triggerAttack(note); blackNote.classList.add('.noteIs-hovered'); });
            blackNote.addEventListener("mouseup", () => synth.triggerRelease(note));
            blackNote.addEventListener("mouseleave", () => synth.triggerRelease(note));
        }
        synthDest.appendChild(blackNote);
    });
}
//# sourceMappingURL=piano.js.map