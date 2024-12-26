import {  SimpleImage } from './GL.js';

class End{
	Voltage:number
	// capacity of the rails is effectively infinite
	// so the solver should 
	example(){
		let other:Stub
		if (other.capacity==undefined) var end=other as End;
	}
}

class Stub extends End{
	Voltage:number
	charge:number
	capacity:number
	//current(voltage:number):number
}

/*
class Stub implements Wire{
	voltage:number
	resistance:number
	current(voltage:number):number{
		return (voltage-this.voltage)/this.resistance
	}
}
*/
// Signal propagation will be fun to follow, but first let's get right the steady state. Gates have capacity.
// Let's give the wires an impedance .. ah uh, just start with a resistance for a simpe RC elemement.
// How do I deal with source ( emitted charge carriers ) and drain ( overflow? )
// Looks to me like these metal parts need a capacity .. at least in the simulation with local and discrete steps.
// But locally I just overflow. Right now I don't couple charge
// So what about routing where I have charge and potential at all ends?

// Only capacity at each end allows me to redistribute charge. Otherwise everyone gets the same. This will not flow
class Route{
	end:End[]
	isGoverned=false

	constructor(End_count:number,formal_drain?:MosFet){
		this.end=new Array<End>(End_count)
		if (formal_drain!=undefined) {
			this.end[this.end.length-1] = formal_drain.electrode[1]
			//formal_drain.electrode[1].
		}
	}

	Voltage:number
	//
	environment_and_charge_to_voltage(){
		let charge=0,  capacity=0, charge_after_distribution=0,bound_charge=0, voltage_wo_divergence=0
		let pinned_voltage:number=null

		// Harvest field on the other side of the dielectic of the gate ( addition to capacity to ground )
		// Collect charge on elementary capacitors of the gate
		this.end.forEach( (end:(End|Stub|Gate))=>{

			if ( (end as Stub).capacity ==undefined) {pinned_voltage=end.Voltage;return} // no gate
			if ( (end as Gate).channel=undefined) {return} // source or drain, nothing to do here
			if (pinned_voltage!=null ) return  // gates will be overpowered

			let gate

			let ch:Channel=gate.channel, len=ch.potential.length-2, gate_count=ch.gate.length
			let gate_width=len*gate.index/gate_count
			let start=gate.index*gate_width
			gate.channel_voltage=0
			for(let i=start;i<start+gate_width;i++){
				gate.channel_voltage+=ch.potential[i]
			}
			gate.channel_voltage=gate.channel_voltage/(ch.potential.length-2)
		})

		// collect charge to GND . I use the old voltage to keep values small and make it physical
		if (pinned_voltage!=null ) {var voltage=pinned_voltage } else {
			// total charge on our side
			// This works like divergence, just with more neighbors.
			// Capacity 2 is like 2 neighbors
			this.end.forEach((stub:Stub)=>{
				bound_charge+=stub.Voltage*stub.capacity // Gates have like 4 times the capacity, while electrodes are more Ohmic
				capacity+=stub.capacity
				// charge flows freely between all ends
				charge+=stub.charge // from emission or overflow and previous time-step

				voltage_wo_divergence+=0 // Environment is at 0. Does this make sense?

				if ((stub as Gate).channel_capacity != undefined) {
					voltage_wo_divergence+=(stub as Gate).channel_capacity*stub.Voltage
					capacity+=(stub as Gate).channel_capacity
					bound_charge+=(stub as Gate).channel_capacity*(stub.Voltage-(stub as Gate).channel_voltage)
				}
			})
			// our voltage ( Metal contains no field)
			voltage_wo_divergence /= capacity
			var voltage= voltage_wo_divergence +charge/capacity 
		}

		// Redistribute charge and broadcast the voltage
		this.end.forEach((stub:Stub)=>{
			if ( (stub).capacity ==undefined) {return} // no stub . No defined capacity. No way to distribute charge here.
			stub.Voltage=voltage
			let c= voltage *stub.capacity // Gates have like 4 times the capacity, while electrodes are more Ohmic. 
			let maybe_gate=	stub as Gate		
			if (maybe_gate.channel_voltage != undefined) {
				c+= (voltage-maybe_gate.channel_voltage) * maybe_gate.channel_capacity
			}
			stub.charge=c, charge_after_distribution+=c  // second one is a check
		})


	}
}


class Gate extends Stub{
	capacity_per_element: number;
		dielectric_thickness: number=1;
	capacity_to_GND:number
	len:number
	voltage:number // With multiple gates this is measured at the point closest to the source . Gates are simulated voltag -> charge -> voltage -> charge . I need this for mutliple gates with meaningles V_GS
	channel_voltage:number

	polarization:number=0
	doping_electroferric: number
	channel_capacity: number;
	V_Gd(){
		return this.voltage+this.doping_electroferric
	}
	charge:number

	channel:Channel
	index:number	
	constructor(channel,index){
		super()
		this.channel=channel
		this.index=index
	}
	//wire = new Stub()
	propagete_field_from_channel_to_gate(net_Potential:number):number{
			// Metal   mirror charge on one side to compensate the channel. 
			// Mirror charges is mathematical charge living deep in the metal. Real charge sits on the surface
			// The distribution is given by the need to eat the field lines. That is where dielectric thickness comes into play
			// Evenly distributed charge on the other side to let the gate float until Ohmic relaxation.			

			// this is stable because changes in potential on either side get damped before the pull on the other side. Also: negative feedback. Charge dampens. Maybe add artificial dammping later.
			return this.voltage / this.capacity_to_GND  +  (this.voltage- net_Potential) / this.dielectric_thickness
	}
/*	// Mostly serves encapsulation. Or should a gate own the wire up to the next node?
	propagete_voltage_2_charge(voltage:number){
		this.charge += this.wire.current(voltage)
	}*/
	divergence(potential:number,charge_density:number):number{
		let charged_bound_by_capcitor=(potential-this.voltage)*this.capacity_per_element
		return charge_density-charged_bound_by_capcitor
	}
}
// Capacitor as an object is not compatible with the simulation loop over time and alternating between carriers and field
// static information is per gate
class Capacitor{
	capacity:number=1;  // for the whole elctrode backsite. Small compared to gate dielectric. I may give the channel capacity to ground and then not tota .. I don't see any advantage. There is no field along a metal electronde!
	carrier:number[]=new Array<number>(1) // 0=gate side, 1=channel . Usually they compensate each other. 
	polarization=0 // ferro-electric dielectric is most simple to simulate, even when I may show an opposite gate instead. Tune between switches and pull-ups
	divergence():number{
		// the gates have capacity towards GND. I need to reach GND on both sides (per cell). Charge needs to be slow for a stupid simulation .. fast charge on gates seems to need linear algebra.
		// So even with gates: charge -> electric field
				return this.carrier[1]-this.carrier[0]+this.polarization
	}
}

// Looks like the simulation needs to decide on a source and drain for efficient ( stable ) simulation
class field_along_carriers{
	average_potential_for_gate:number // gate voltage is "protected" by the dielectic. Cannot change directly
	V_drain:number
}

class Channel{   // kinda inner part of Mosfet. Needs access to a lot of elements. hmm
	len:number
	element:Capacitor[]
	potential:number[]
	field:number[]  // So the distance thanks to the gate dielectric allows the channel to have field . Maybe with JFETs and the wide depletion zone this is easier to grasp?
	// This field is weak, but all we have?
	// total sum of mirror charge stays .. implicit -- noone cares (about the distribution)
	// charge is compensated by the gate charge, but there is some deviation
	// let's just assume that some given part of the charge affects the field along the channel
	// So we integrate up here two times.
	// For test, go through this program . For simulation: repeat at a fast pace
	// this is like const charge density across a vacuum gap or a wide diode:
	// Where is my doping ? Doping just changes the threshold voltage. No new physics happens. Ohmic - Saturation needs to funciton without
	// So there is no fixed part to affect the field along. Think of a transfer gate, wide open, low V_DS.  V_DS=0 . V_GS=1 . elementary capacity =1 . Charge density =1 => divergence=0
	// Simulation of the electrid field starts with a constant field so that the potential connects source with drain (Ohmic region)
	// then charge density gets lower towards drain  (mirror charge follows)   (<= capacity of the elementary capacitors)
	// for a fixed flow, the lower density charge needs to flow faster
	//  flow simulation will create a hill of charge carriers in the middle of the gate: Slows down carriers at source, speeds up carriers at drain
	// So how do I not shield this hill? The channel does not grow in thickness, rather the lower voltage accross the dielectric reduces the carriers in the electrode.
	// The metal electrode still is field free, just across the dielectric there is a lower field ( gate and drain are both positive ).
	// So divergence is created by charge which does not match the capacitor charge given by the voltage in my start state
	// Along the channel : many carriers, divergence, high field

	// to check this, I plot a bitmap where each row represents a channel with the given color scheme.
	// From row to row I increase VDS (maybe even add the "negative" half.)

	// The characteristic graph emerges, when I animate VGS. Testing goes from wide open (see above) to closed (minimal leakage)

	gate:Gate[] // nMOSFET with single gates was used by Commodore for high frequency circuits, but generally, MOSFETs strive on multiple gates

	current_Gate:number
	/*
	get_Gate(i:number){
		// cstr current_Gate=0
		if (i<this.Gate[current_Gate].right ) return this.Gate[current_Gate];
		this.Gate[current_Gate].average_potential=this.average_potential;this.average_potential=0
		this.current_Gate++
	}*/

	conductivity=1
	carrier_density: number[];
	


	V_GS: number; // at the start of the channel: The first gate. Where to store? I need to store state! Absolute potential actually. V_GS is only for functions!
	propagate_carrier_to_field(electrode:number[],gate:number[]){
		let field=0,potential=this.V_GS,carrier_on_gate=0,sum_p=0
		// Like in the 2d simulation I need to criss cross? But I don't accumulate .. should I? I do ping pong within in the channel. This should be stable if I don't have a bug
		// Kinda like, when charge -> field -> charge don't agree, something is not consistent?

		// This is kinda futile with multiple gates : if (V_S>V_G) ; // go from source to drain. But what about Ohmic region? 

		let gate_length=(this.element.length-2)/gate.length
		this.potential[0]=electrode[0]
		this.potential[this.potential.length-1]=electrode[1]
		// Probably I could apply currying here? But I fail to see the benefit
		// Left and right interleaved. Start at the electrodes to work well with Source or Drain on either side (Ohmic region, transfer gate)
		for(let i=1;i<this.element.length-1;i++){
			let k=i
			for(let j=0;j<2;j++){
				this.potential[k]= (2*(this.potential[k-1]+this.potential[k+1])+gate[Math.floor((k-1)/gate.length)])/4  + this.carrier_density[k]  // As long as gates all have the same size, I don't need to match this capacisty with the route.capacity .
				k=this.element.length-i
			}
		}
	}

	propagete_field_to_carriers(){
		// semiconductor in channel
		// source . Drain gets the same population. Should have no effect usually. For a transfer gate it is exactly what we want
		this.element[this.len-1].carrier[1]=this.element[0].carrier[1]=1  // What is this? Temperature at source? Doping. I don't know why I ( my process in the fab ) vary this. All population is relative to this "this.source.population"

		let next_channel_carrier=new Array<number>(this.len-2)
		for(let i=1;i<this.len-1;i++){
			next_channel_carrier[i] = this.element[i+1][1]+Math.abs(this.field[i])*this.conductivity*this.element[i+Math.sign(this.field[i])].carrier[1]
		}
	}
}

class MosFet{
	V_drain: number;
	// The characteristic graph emerges, when I animate VGS. Testing goes from wide open (see above) to closed (minimal leakage)
	channel2bitmapRow(current_Row: Uint8Array, V_source: number, V_drain: number) { // V gate is in the gate array. For the first test, gate is at 0. Threshold is confusing
		for (let i=0,k = 0; k < this.channel.len;) {
			// bluescreen
			current_Row[i++] = 0
			current_Row[i++] = this.channel.potential[k]
			current_Row[i++] = this.channel.carrier_density[k++]
			current_Row[i++] = 255
		}
	}

	gate:Gate[]
	electrode:Stub[]

	constructor(gateCount:number, electrode:Stub[], routes:Route[])
	{
		this.gate=new Array<Gate>(gateCount)
		for(let i=0;i<routes.length;i++){			
			routes[i].end.push( this.gate[i] )
		}
		this.electrode=electrode.concat( new Array<Gate>(2- electrode.length) )
	}

	channel:Channel

	solve(){ // self consisten  /  fine time-steps		
		// Types suggest that I should not send raw numbers .. Maybe in the end the channel comes back into the MosFET
		this.channel.propagate_carrier_to_field(this.electrode.map(e=>e.Voltage),this.gate.map(g=>g.Voltage))  // I need the real V_G as in the 2d simulation. There may be some mathematical shot cuts, but it probably has no educational worth and does not help debugging. And is there really? V_G globally pulls in carriers. In the end (haha pun) this is V_GS. The main parameter in any textbook (channel potential is pinned to V_S on the source site. While solving, this (information) propagates through the whole channel) . This an the next call replace the 2d poisson solution of the grid based simulation.
		let voltages:field_along_carriers


		// On the one hand the gate provides the voltage .. like a function to pull from
		// On the other hand the simulation in the channel should just run through the gaps between the gates. I rather not specify any function parameters and return values.
		//this.channel.propagate_carrier_to_field(gates:gate[])
		this.channel.propagete_field_to_carriers()

		/*
		this.channel.get_drained()

		this.gate.forEach(g=>{
			g.propagete_to_field( potential_in_channel_between  );// field to voltage using capacity. No array. Metal is mixes carriers and fields. I could claim high dielectric constant, but that would be difficult to solve
			let voltages=g.propagete_voltage_2_charge()			
		});

		let carrier_overflow = g.propagete_field_to_carriers()  // Ohmic resistor to wire. No array  // 

		this.V_drain=voltages.V_drain
		this.CarrierSlammedIntoDrain=voltages.CarrierOverflow

		// voltage and charge propagation  is part of the wire?  Overall loop toggles between MosFet and Wires . coupled by voltage is the gate.

		this.channel.propagete_field_to_carriers()  // Ohmic from element to element
		*/
	}



}

// This is not an object. The lifetime is too short for my taste because voltages change and source and drain switch roles
//class Source{
	//population:number=1 // needed for tuning. Physcially it is source temperature and doping. Same in cathode : temperature and work function. I don't do field effect here anymore
function emission(voltage:number):number{
		return voltage * this.population
	}
//}

// The website should play like a YouTube video, but even then it needs a clock: which can also act as Single Step
class Button extends Stub{
name:string
constructor(name:string, default_voltage?:number){
	super()
	this.name=name
	this.Voltage=default_voltage  // I don't want to translate undefined to null
}
}

// looks very similar to MosFet and hence should reside in the same file
// Looks like I come back to the original Poisson solver from university
// Go over each element and adjuat potential there to satisfy the environment
// So it seems that I still go over the elements in the channel, but take the old field right of me into account, just like the gate voltage.
// Boundary condidtions are just that, even in 2d
// Now, should I do the same with the electrodes and gates?

// I don't need this for my first tests, but want to give an outlook. It seems like I need to read a netlist format, not VHDL. Logsim is XML .. JS has a parser -- nice.
// Logisim has circuit tag (nice!), but then there are wires. I may revert to wires, but right now I have routes, which can have more than one end.
// Logisim uses coordinates to model releation-ships. I would rather like to use a tree when I specify test cases. Layout is of secondary concern here.
// component would probably be my MosFets. For some reasons components in Logisim have no children. Connection to wires happens via coordinates. Need to know the footprint to read the file?
// Maybe I can steel stuff from Chisel, though I really don't know about all those types.

// The test circuit is not defined like this, but accesses propteries of the Mosfet directly (for now).
class Circuit{
	name: string;
	Buttons: Button[];
	constructor(logsim_file:string){
		this.name="RS latch"
		this.Buttons=new Array<Button>(2)
		this.Buttons[0]=new Button("Set")  // default is undefined  =  high Z
		this.Buttons[1]=new Button("Clear")
		this.Buttons[2]=new Button("GND",0)
		this.Buttons[3]=new Button("Vcc",1)

		this.MosFets=new Array<MosFet>(3)
		this.route=new Array<Route>(3)
		this.route[0]=new Route(0)
		this.route[0].end.push(this.Buttons[0])
		this.MosFets[0]=new MosFet(2,[],[this.route[0]])


		this.route[0]=new Route(2,this.MosFets[0])  // I need a way to iterate over all Routes exactly once. With Multiplexers, one route is connected to multiple drains.		
		// There are multiple ports on the MosFet. It is difficult to name them here ( Logisim and their cooridinates?). I only allow designated "drain"

		// So on here the Parameter is source? Source is GND usually. So it is the first gate? No weird one element Arrays. But why 2 gates counted a .. union type
		this.MosFets[1]=new MosFet(2,[],[this.route[1]])  // I don't use transfer gates right now. For a compact file format, I should use the tree structure aggressively, even if it breaks symmetry. This is an optionial parameter

		this.route[1]=new Route(2,this.MosFets[1])  // I need a way to iterate over all Routes exactly once. With Multiplexers, one route is connected to multiple drains.	

		// Todo: Make a method for this:
		let g=new Gate(this.MosFets[0].channel,2)
		this.route[1].end.push(g)
		this.MosFets[0].gate.push( g );//)
			// Bidirectional links connect mosfet 0 to route 1
	}
	MosFets: MosFet[]
	route:Route[]
	solve(){
		this.MosFets.forEach(t=>t.solve() );
	}
}

export {MosFet}


/*
class LongWire implements Wire{
	
	impedance: number;
	solve(){
		back_current=forh_current + current_to_gate
		back_voltage=back_current*this.impedance
	}

	current(current_to_gate){
		return back_current-forth_current 
	}

	voltage(){
		return back_voltage+forth_voltage
	}
}*/