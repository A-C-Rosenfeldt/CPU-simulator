class Device{
    ref:FinFet;
    position:number;
}
class Wire{
    // these have fixed impedance. Carrier=Voltage

    lenght:number=100;
    flow :number[][];
    
    blanced:boolean; // SRAM register file is blanced. ALU is not.

    terminatedByPullUp:boolean[]; // ...resistor .. transistor

    devices:Device[];

    constructor(length:number){
        this.lenght=length;
        this.flow =[new Array(this.lenght),new Array(this.lenght)];
        this.terminatedByPullUp=[false,false];
    }

}