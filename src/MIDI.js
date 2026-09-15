export default class MIDI {
    access;
    input;
    playSound;
    releaseSound;
    async init() {
        if (!navigator.requestMIDIAccess)
            throw new Error("Your browser does not support MIDI! :(\n Or you have to give permission to use it. In this case check out our README.md!");
        this.access = await navigator.requestMIDIAccess();
        this.access.addEventListener("statechange", () => this.refreshInputs());
        this.refreshInputs();
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
            const msg = this.parse(e.data);
            console.log(msg);
            this.handleMessage(msg);
        };
    }
    ///0: released
    ///1: pressed
    parse(msg) {
        if (msg === null || msg[0] === undefined || msg[1] === undefined || msg[2] === undefined)
            return;
        console.log(msg);
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
    }
}
//# sourceMappingURL=MIDI.js.map