class Device {
}
export class Wire {
    constructor(length) {
        // these have fixed impedance. Carrier=Voltage
        // static
        this.length = 100;
        this.impedance = 50; // Ohm. I set it to 1 internally.
        // dynamic
        this.rotaryPos = 0;
        this.length = length;
        this.flow = new Array(this.length * 2); //,new Array(this.length)];
        //this.terminatedByPullUp=[false,false];
    }
    getVoltage(position) {
        var for_ward = (this.rotaryPos + position) % (2 * length);
        if (for_ward === 0 || for_ward == this.length - 1) {
            return [];
        }
        var backward = (this.rotaryPos + this.length - position) % (2 * length);
        return [this.flow[for_ward], this.flow[backward]]; // We get back 2 currents
    }
    setCurrent(position, voltages) {
        var for_ward = (this.rotaryPos + position) % (2 * length);
        if (for_ward === 0 || for_ward == this.length - 1) {
            return [];
        }
        var backward = (this.rotaryPos + this.length - position) % (2 * length);
        return [this.flow[for_ward], this.flow[backward]]; // We get back 2 currents
    }
}
//# sourceMappingURL=wire.js.map