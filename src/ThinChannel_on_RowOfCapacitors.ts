import {  SimpleImage } from './GL.js';

interface Wire{
	current(voltage:number):number
}

class Stub implements Wire{
	voltage:number
	resistance:number
	current(voltage:number):number{
		return (voltage-this.voltage)/this.resistance
	}
}

// Signal propagation will be fun to follow, but first let's get right the steady state. Gates have capacity.
// Let's give the wires an impedance .. ah uh, just start with a resistance for a simpe RC elemement.
// How do I deal with source ( emitted charge carriers ) and drain ( overflow? )
// Looks to me like these metal parts need a capacity .. at least in the simulation with local and discrete steps.
// But locally I just overflow. Right now I don't couple charge
// So what about routing where I have charge and potential at all ends?

// Only capacity at each end allows me to redistribute charge. Otherwise everyone gets the same. This will not flow
class Route{
	const capacity=1


	//
	environment_and_charge_to_voltage(){
		let charge=0, voltage_per_capacity=0
		// This works like divergence, just with more neighbors.
		// Capacity 2 is like 2 neighbors
		for(){
			average_voltage+=voltage[i]*capacity[i] // Gates have like 4 times the capacity, while electrodes are more Ohmic
			this.capacity+=this.capacity[i]
			// charge flows freely between all ends
			charge+=s.charge // from emission or overflow and previous time-step
		}
		let voltage_avg=average_voltage/capacity 

	}


}


class Gate{
	capacity_to_GND:number
	len:number
	V_G:number // With multiple gates this is measured at the point closest to the source . Gates are simulated voltag -> charge -> voltage -> charge . I need this for mutliple gates with meaningles V_GS
	charge:number
	dielectric_thickness: number=1;
	polarization:number=0
	capacity_per_element: number;
	constructor(){

	}
	wire:Wire = new Stub()
	propagete_field_from_channel_to_gate(net_Potential:number):number{
			// Metal   mirror charge on one side to compensate the channel. 
			// Mirror charges is mathematical charge living deep in the metal. Real charge sits on the surface
			// The distribution is given by the need to eat the field lines. That is where dielectric thickness comes into play
			// Evenly distributed charge on the other side to let the gate float until Ohmic relaxation.			

			// this is stable because changes in potential on either side get damped before the pull on the other side. Also: negative feedback. Charge dampens. Maybe add artificial dammping later.
			return this.V_G / this.capacity_to_GND  +  (this.V_G- net_Potential) / this.dielectric_thickness
	}
	// Mostly serves encapsulation. Or should a gate own the wire up to the next node?
	propagete_voltage_2_charge(voltage:number){
		this.charge += this.wire.current(voltage)
	}
	divergence(potential:number,charge_density:number):number{
		let charged_bound_by_capcitor=(potential-this.V_G)*this.capacity_per_element
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

class Channel{
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
	get_Gate(i:number){
		// cstr current_Gate=0
		if (i<this.Gate[current_Gate].right ) return this.Gate[current_Gate];
		this.Gate[current_Gate].average_potential=this.average_potential;this.average_potential=0
		this.current_Gate++
	}

	source:Source
	conductivity=1
	carrier_density: number[];
	
	V_GS: number; // at the start of the channel: The first gate. Where to store? I need to store state! Absolute potential actually. V_GS is only for functions!
	propagate_carrier_to_field(V_Source:number):field_along_carriers{
		let field=0,potential=this.V_GS,carrier_on_gate=0,sum_p=0
		// Like in the 2d simulation I need to criss cross? But I don't accumulate .. should I? I do ping pong within in the channel. This should be stable if I don't have a bug
		// Kinda like, when charge -> field -> charge don't agree, something is not consistent?

		// This is kinda futile with multiple gates : if (V_S>V_G) ; // go from source to drain. But what about Ohmic region? 

		// Probably I could apply currying here? But I fail to see the benefit
		for(let i=0;i<this.element.length;i++){
			this.charge2field_elm(i) // Not local. So it should not be a method on the element
			this.element[i].charge2field()
		}

		for(let i=this.element.length-1;i>=0;i--){
			this.element[i].charge2field()
		}

		// I need to go from left and right. Blend over.
		
		// Only then should I calculate charge per gate!


		this.element.forEach((e,i)=>{

			let V_G=this.get_Gate(i)

			// This is simple divergence with 3 directions: channel left and right and towards the gate, weaked by dielectic. The dielectric towards to body is so thick that it does not count.

			this.potential[i]= (2*(this.potential[i-1]+this.potential[i+1])+V_G)/4   // As long as gates all have the same size, I don't need to match this capacisty with the route.capacity .

			field+=this.gate[0].divergence(this.potential[i],this.carrier_density[i]) // After solution, field within the electrode is zero. All is in the channel. Carrier density in the elctrode mimics this potential.
			potential+=field
			this.field[i]=field
			this.potential[i]=potential
			sum_p+=potential
			carrier_on_gate+=e.carrier[0]
		});

		let V_G=this.get_Gate(1000) // number > element_count
	}

	propagete_field_to_carriers(){
		// semiconductor in channel
		// source . Drain gets the same population. Should have no effect usually. For a transfer gate it is exactly what we want
		this.element[this.len-1].carrier[1]=this.element[0].carrier[1]=this.source.population

		let next_channel_carrier=new Array<number>(this.len-2)
		for(let i=1;i<this.len-1;i++){
			next_channel_carrier[i] = this.element[i+1][1]+Math.abs(this.field[i])*this.conductivity*this.element[i+Math.sign(this.field[i])].carrier[1]
		}
		this.carrier_density=next_channel_carrier

		return carrier_on_gate + this.V_GS
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
	channel:Channel

	solve(){ // self consisten  /  fine time-steps		
		let average_potential=this.channel.propagate_carrier_to_field(this.channel.V_GS)  // I need the real V_G as in the 2d simulation. There may be some mathematical shot cuts, but it probably has no educational worth and does not help debugging. And is there really? V_G globally pulls in carriers. In the end (haha pun) this is V_GS. The main parameter in any textbook (channel potential is pinned to V_S on the source site. While solving, this (information) propagates through the whole channel) . This an the next call replace the 2d poisson solution of the grid based simulation.
		let voltages:field_along_carriers


		// On the one hand the gate provides the voltage .. like a function to pull from
		// On the other hand the simulation in the channel should just run through the gaps between the gates. I rather not specify any function parameters and return values.
this.channel.propagate_carrier_to_field(gates:gate[])
this.channel.propagete_field_to_carriers()


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
	}

	constructor(threshold:number){ // for CMOS this would be channel carriers polarity. Kinda in a real MOSFET it all boils down to doping (with sign).
		let len=30
		this.gate.len=len // singel gate
		this.channel.len=len+2 // reservoir in source and drain
	}


}
class Source{
	population:number=1 // needed for tuning. Physcially it is source temperature and doping. Same in cathode : temperature and work function. I don't do field effect here anymore
	current(voltage:number):number{
		return voltage * this.population
	}
}

// looks very similar to MosFet and hence should reside in the same file
// Looks like I come back to the original Poisson solver from university
// Go over each element and adjuat potential there to satisfy the environment
// So it seems that I still go over the elements in the channel, but take the old field right of me into account, just like the gate voltage.
// Boundary condidtions are just that, even in 2d
// Now, should I do the same with the electrodes and gates?
class Circuit{
	MosFets: MosFet[];
	solve(){
		this.MosFets.forEach();
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