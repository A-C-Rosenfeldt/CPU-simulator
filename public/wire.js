/*
For the electrodes I average U over all cells. Then impedance => current (in the global current timeStep)
*/
import { FromRaw, Row, Span } from './enforcePivot.js';
import { Contact } from './fields.js';
// Todo: For Display I want to draw wires next to the patches. Use curves? Use less ressources? Bridges => netlist . How to edit?
class Segment {
}
// parallel wires going around stuff. Not really MVP
class Coax extends Segment {
}
class Arc extends Coax {
}
// shortest path through free space
class Line extends Coax {
}
// speed of light is for the eye to follow, but also for physics ( Cray )
// impedance is already important to explain amplifiers on 6502
// that is a directed signal and 6502 does not have resistors
// simplified Device
class Y extends Segment {
}
class Device extends Y {
    constructor(ref, position) {
        super();
        this.impedance = 1; // needed for Y. Without Y: 1 == 50 Ohm
        this.ref = ref;
        this.contact = ref.contacts[position];
    }
}
class WireLayout {
}
export class Wire extends WireLayout {
    constructor(length) {
        super();
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
// todo: generate coax field to patch to PDE
class DynamicContact extends Contact {
    constructor() {
        super(...arguments);
        // static properties
        // this is added to the matrix (not the map)
        this.OdeInhomogenous = 3; // Voltage in cable
        this.Ode__homogenous = 50; // Impedance
        //fromVss: number; // length=2
        // dynamic variables -- these need to be solved by the matrix inverter. All currents are calculated within
        // voltages: number[]; // Signals coming from both sides
        //currents: number[]; // The solution is quite simple: A passing current going through the wire and the current coming from the semiconductor split between two equal resistors in parallel.
    }
    /*
    contacts lead to shielded wires. So the differential equation needs to exhbit the impedance:
      Current flows => voltage appears  ..
    // .. relative to the voltage in the cable. This voltage is the sum of the forward and backwards signal
       (I will use voltage for it => no sign change on the end).
    // When the differential equation is solved, this will be the case.
       Shielded wires act as resistors to the voltage comming in (both sides). Current comes in from both sides.
    // This would have to be modelled like 2 times the voltage as a source and then a resistor connected
       to the semiconductor (to get absolute and differential voltage right).
    // termination at the end is made by means of transistors.
    */
    Flow(voltageInSemi) {
        var voltages = this.wire.getVoltage(this.wirePos);
        // ODE
        var currentIntoSemi = voltages.map(v => v - voltageInSemi /* /R */);
        // After solution of local voltage and current: Set outgoing signals on each side.
        // Since the wire uses a rotating pointer into a fixed array, we need to update the values
        // Otherwise the signal would just pass through us.
        this.wire.setCurrent(this.wirePos, currentIntoSemi); // Todo: Wire is connected via R (parallel R made of both directions). So: set current in Flow step, get voltage in Field step
        // equation from above as matrix. Square to be invertable
        const R = //[
         
        //,[,],
        [-1 /* new col only  */, +1 /*new col and row*/]; // we only add I to the homognous side.
        //];
        //this.matrix.row.push(new Row(this.matrix.row.length,0,[[],R,[]])); //V
        // new interface to Row
        const a = new Array(3);
        a[0] = new Span(0, 0);
        a[1] = FromRaw(-1, +1); //R)
        a[2] = new Span(0, 0);
        this.matrix.row.push(new Row(a));
        //matrix.appendOnDiagonal(R); //I
        const VoltageInWire = 3;
        this.column.concat(R.map(r => VoltageInWire * r) /*, 2 ???]*/);
    }
}
//# sourceMappingURL=wire.js.map