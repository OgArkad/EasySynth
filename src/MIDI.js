import { chorus, chorusSend, reverbSend, switchSustain } from "./effects.js";
import { synth, filter, lfo, panner, expression } from "./instrument.js";
import { Frequency } from "tone";
export default class MIDI {
    access;
    input;
    async playSound(note, velocity) {
        synth.triggerAttack(Frequency(note, "midi").toFrequency(), undefined, velocity / 127);
    }
    async releaseSound(note) {
        synth.triggerRelease(Frequency(note, "midi").toFrequency());
    }
    async init() {
        if (!navigator.requestMIDIAccess)
            throw new Error("Your browser does not support MIDI! :(\n Or you have to give permission to use it. In this case check out our README.md!");
        this.access = await navigator.requestMIDIAccess();
        this.access.addEventListener("statechange", () => this.refreshInputs());
        const inputs = [...(this.access?.inputs.values() ?? [])];
        for (const input of inputs) {
            input.addEventListener("midimessage", (e) => {
                this.selectInput(input.id);
                this.handleMessage(this.parse(e.data));
            });
        }
        ;
        console.info("MIDI inited");
    }
    refreshInputs() {
        if (!this.access)
            return;
        this.access.inputs.forEach((inp) => {
            console.log("MIDI input: " + inp.name + " : " + inp.id);
        });
    }
    selectInput(id) {
        if (!this.access)
            return;
        const inp = this.access.inputs.get(id);
        if (!inp)
            throw new Error("MIDI input not found with id " + id + ".");
        this.input = inp;
        this.input.onmidimessage = (e) => {
            this.handleMessage(this.parse(e.data));
        };
    }
    ///0: released
    ///1: pressed
    parse(msg) {
        if (msg === null || msg[0] === undefined || msg[1] === undefined || msg[2] === undefined)
            return;
        //console.log(msg);
        const type = msg[0] & 0xF0;
        const note = msg[1];
        const velocity = msg[2];
        if (type === 0x90 && velocity > 0)
            return [1, note, velocity];
        if (type === 0x80 || (type === 0x90 && velocity === 0))
            return [0, note];
        return [type, note, velocity];
    }
    handleMessage(msg) {
        if (msg === undefined || this.playSound === undefined || this.releaseSound === undefined)
            throw new Error("MIDI error: no message to handle, or play/releaseSound was not defined!");
        if (msg[0] === 1)
            this.playSound(msg[1], msg[2]);
        if (msg[0] === 0)
            this.releaseSound(msg[1]);
        if (msg[0] === 0xB0) {
            switch (msg[1]) {
                case 1: //modulation
                    lfo.frequency.value = msg[2] / 127 * 10;
                    break;
                case 2: //breath
                    break;
                case 7: //volume
                    synth.volume.value = (msg[2] - 127) / 2;
                    break;
                case 10: //pan
                    panner.pan.rampTo(((msg[2] / 127) * 2 - 1), 0.02);
                    break;
                case 11: //expression
                    expression.gain.rampTo(msg[2] / 127, 0.02);
                    break;
                case 64: //sustain
                    if (msg[2] >= 64)
                        switchSustain(true);
                    else
                        switchSustain(false);
                    break;
                case 65: //portamento
                    break;
                case 71: //resonance
                    filter.Q.rampTo(msg[2] / 127 * 15, 0.02);
                    break;
                case 74: //filter cutoff
                    const frequency = 50 * Math.pow(15000 / 50, msg[2] / 127); // min: 50, max: 15000
                    filter.frequency.rampTo(frequency, 0.02);
                    break;
                case 91: //reverb
                    reverbSend.gain.rampTo(msg[2] / 127, 0.02);
                    break;
                case 93: //chorus
                    if (msg[2] / 127 >= 0) {
                        chorus.start();
                        chorusSend.gain.rampTo(msg[2] / 127, 0.02);
                    }
                    else {
                        chorusSend.gain.rampTo(msg[2] / 127, 0.02);
                        chorus.stop();
                    }
                    break;
                default:
                    console.warn("Unhandled MIDI CC message: " + msg[1]);
                    return;
            }
        }
    }
}
//# sourceMappingURL=MIDI.js.map