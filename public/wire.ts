/*
For the electrodes I average U over all cells. Then impedance => current (in the global current timeStep)
*/
import {Contact} from './fields.js'
import {FinFet} from './fieldStatic.js'

// Todo: For Display I want to draw wires next to the patches. Use curves? Use less ressources? Bridges => netlist . How to edit?

class Segment{}
// parallel wires going around stuff. Not really MVP
class Coax extends Segment{
    impedance:number
}
class Arc extends Coax{
    center:number[]
    angle:number
}
// shortest path through free space
class Line extends Coax{
    nextPoint:number[] // use z dimension to give hints at crossings
} 

// speed of light is for the eye to follow, but also for physics ( Cray )
// impedance is already important to explain amplifiers on 6502
// that is a directed signal and 6502 does not have resistors
// simplified Device
class Y extends Segment{

}
class Device extends Y{
    ref:FinFet;
    contact:Contact
    constructor(ref:FinFet,position:number){
        super()
        this.ref=ref
        this.contact=ref.contacts[position]
    }

    impedance=1 // needed for Y. Without Y: 1 == 50 Ohm
    layout:Segment // reference start of segment for taps. Taps are instantanous
}



class WireLayout{
    points:Segment
}
export class Wire extends WireLayout{
    contacts:Device[]
    // these have fixed impedance. Carrier=Voltage
    // static
    length:number=100;
    flow :number[];//=new Number[2*this.length];

    impedance:number=50; // Ohm. I set it to 1 internally.

    constructor(length:number){
        super()
        this.length=length;
        this.flow =new Array(this.length*2)  //,new Array(this.length)];
        //this.terminatedByPullUp=[false,false];
    }
    
    // dynamic
    rotaryPos: number=0

    getVoltage(position:number) {
        var for_ward=(this.rotaryPos+position) % (2*length);
        if (for_ward===0 || for_ward==this.length-1){
            return [];
        }
        var backward=(this.rotaryPos+this.length-position) % (2*length)
        return [this.flow[for_ward],this.flow[backward]] // We get back 2 currents
    }

    setCurrent(position:number, voltages:number[]) {
        var for_ward=(this.rotaryPos+position) % (2*length);
        if (for_ward===0 || for_ward==this.length-1){
            return [];
        }
        var backward=(this.rotaryPos+this.length-position) % (2*length)
        return [this.flow[for_ward],this.flow[backward]] // We get back 2 currents
    }
    // this is more of a modelling aspect, like templating: blanced:boolean; // SRAM register file is blanced. ALU is not.

    // No, this is explicitely modelled by a contact to a semiconductor:  terminatedByPullUp:boolean[]; // ...resistor .. transistor

    // contacts point here. Only single link.  devices:Device[];
}

// todo: generate coax field to patch to PDE

class /*SemiconductorMetal*/ DynamicContact extends Contact {

    column:number[]; // dated maybe? A column full of contacts? But I only have sparse contacts and be have two in complex gates
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
    Flow(voltageInSemi : number){ // flow into the node
  
      var voltages=this.wire.getVoltage(this.wirePos);
  
      // ODE
      var currentIntoSemi=voltages.map(v => v-voltageInSemi /* /R */ );
  
      // After solution of local voltage and current: Set outgoing signals on each side.
      // Since the wire uses a rotating pointer into a fixed array, we need to update the values
      // Otherwise the signal would just pass through us.
      this.wire.setCurrent(this.wirePos,currentIntoSemi); // Todo: Wire is connected via R (parallel R made of both directions). So: set current in Flow step, get voltage in Field step
  
      // equation from above as matrix. Square to be invertable
      const R=//[
        //,[,],
        [-1/* new col only  */,+1 /*new col and row*/] // we only add I to the homognous side.
      //];
      //this.matrix.row.push(new Row(this.matrix.row.length,0,[[],R,[]])); //V
      // new interface to Row
      const a=new Array<Span<number>>(3)
      a[0]=new Span<number>(0,0)
      a[1]=FromRaw<number>(-1,+1)//R)
      a[2]=new Span<number>(0,0)
      this.matrix.row.push(new Row(a));
  
      //matrix.appendOnDiagonal(R); //I
      const VoltageInWire=3;
      this.column.concat(R.map(r=>VoltageInWire*r) /*, 2 ???]*/);
    }
   // static properties
  
   // this is added to the matrix (not the map)
   OdeInhomogenous: number = 3; // Voltage in cable
   Ode__homogenous: number = 50; // Impedance
    
  
   // owned by FinFet
    wire: Wire; // ref to. Hmm who owns a wire?
    wirePos: number; // we just store the position on the wire also her
  
    semiPos: number;
    //fromVss: number; // length=2
    
    // dynamic variables -- these need to be solved by the matrix inverter. All currents are calculated within
   // voltages: number[]; // Signals coming from both sides
    //currents: number[]; // The solution is quite simple: A passing current going through the wire and the current coming from the semiconductor split between two equal resistors in parallel.
  
  
  
  }