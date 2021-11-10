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
// Y in serialized form will have at least one ref
//      it is stored as directed graph
//      in a list with segments to store a graph in a compact way
// for computation
//  Y Node has to do linalg and keep a Matrix ( array ) for this. The type has nothing in common wit Segment anymore
class Y extends Segment {
}
class Device extends Y {
    constructor(ref, position) {
        super();
        // distributed electrode - surface becomes transmission line?
        // We want this to make the hand-over point between coax and field less critical
        // Also typically an electrode will try to reduce parasitic capacity, so impedance is low,
        // So even with the typical T shape the combined impedance will probably lower that our coax default. With multiple coax connecting or fan out at the plate/drain/collector even more so.
        // when too much charge flows in, voltage rises in the default simulation due to capacity and charge flows back. We have resistance on all edges of the node and thus I don't expect excess oscillations.
        // To further harmonize field and coax, the inverter could use the same config value
        // to force influence on cells > distance to 0.
        // We cannot have B in field because it would slow down to the speed of the electrons.
        // Plane waves already make only minimal sense for our electrodes ( 1D ), I am not gonna expand that to 2d.
        // So to overcompensate the missing B ( LC effect ), we could double the distance in pure E ( RC )
        // Charge simulation: I first try it out in semiconductor. Like the old software used for electron optics. Later move on.
        // My main motivation was to reproduce the  pinch-off  of the FET and I can do it with this
        // My second motivation was to show how n-FET pulls through the voltages between hi and low without pulling two much on hi and without need for too much supply voltage. We can do this with our current model
        // Electron need to have a velocity comparable to light, so that the user sees the signals running around ( guide to the eye )
        // Biggest problem with electrons is that I must simulate space charge. So I need to lock the steps.
        // We use the grid and smearing to reduce the artefact of no enough electrons. In reality I want a single electron transistor! Just think about all the noise due to multiple electrons!
        // With a fixed field I maybe could convert to a hexagonal grid and have triangles between potential points
        // those triangles have homogenous electric field and electrons would fly along a parabola.
        // Multiple steps would occure because the electron hits multiple edges in a given time step.
        // Like in my pool billard sim I feel the need still sort by time .. uh and ignore mirror charge ( far away ), but closest 4 electrons
        // This complicates code, leads to artefacts and should only be implemented if slowing coax is a problem
        // Maybe I can sell it as artistic freedom? I need coax for crossings and nice bends ( map description )
        // Of course most of the stuff should work by GateDelay, so I only need a small hint
        // Todays computers are very fast. If I aim at 240 fps LCD, and have these field simulation steps,
        // 1/10 for a signal crossing the screen may already be too fast for most viewers and already then I display 24 time steps
        // Let's just assume that we live in the world of cray and fs-lasers.
        // We assume that the device has a large electrode and voltage dominates the transmission lines
        //   still we could calculate a limit for capacity: outer conductor is shell around electrode withe one cell distance
        //    so transmission line has 1 cell wire thickness and 1 cell dielectrick thickness?
        // field sim recalculates voltage of electrode. we could do this while we set all contacted cells to outer conductor ( + level shift )
        // transmission line should not appear slower than electrode charge redistribution
        // sectors vs sparse matrix => electrode speed. Speed of light cuts of cells far away from main.
        //    step creates potential: steps at the boundary will be corrected next step.
        // Boundary is a circle? So speed of light is like 16 cells / time step? Magnetic field may be able to soften the front, but could as well be included later.
        // transmission line is kind of a solution to E-B like this circle. The outer conductor is visible in out maps.
        //   How many frames do we display? At 60 Hz and fullHD, 16 px speed looks arcade like. But how fast does our field solution change? Electrons which need multiple cylces for one cell?
        // So voltage of transmission line is measured realtive to electrode and this gives us the currents
        // currents change the charge on the electrode
        // the device electrode acts more like a capcitor then a resistor.
        this.capacity = 1; // ah, contact wants to calculate this? I propese: watch historical values?
        // in a single step the surface area is most important
        // linalg solves field and charge on electrode, but that is a different phase of the solver
        // I don't want learning because that can become unstable
        // I like to simulate trajectory in metal like in semiconductor
        // I mean, it is nice to be able to solve via linalg, but when contacts don't work that way?
        // So current flows in the current step, and then voltage changes .. uh should I do that at the contacts? So I reuse step width of current in semi ?
        // Ohmic would be a rate limiter for our capacity solver?
        // we have charge and voltage (potential). We need capacity to solve the equation.
        this.impedance = 1; // needed for Y. Without Y: 1 == 50 Ohm
        this.ref = ref;
        this.contact = ref.contacts[position];
    }
}
// This is dispaly on screen
class WireLayout {
}
// this is simulation
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
// Todo: Remove? ContactPoint should be on the border to capture most of the field in the map.  // Why?: todo: generate coax field to patch to PDE
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