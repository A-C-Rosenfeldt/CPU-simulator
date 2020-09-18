/*
For the electrodes I average U over all cells. Then impedance => current (in the global current timeStep)
*/
import {FinFet} from './fields.js'

class Device{
    ref:FinFet;
    position:number;
}
export class Wire{
    // these have fixed impedance. Carrier=Voltage
    // static
    length:number=100;
    flow :number[];//=new Number[2*this.length];

    impedance:number=50; // Ohm. I set it to 1 internally.

    constructor(length:number){
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