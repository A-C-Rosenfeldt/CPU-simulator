import {  SimpleImage } from './GL.js';

class Wire{
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
}
class Gate{
	capacity_to_GND:number
	len:number
	V_GS:number // With multiple gates this is measured at the point closest to the source 
	solve(totalCharge:number){
			// Metal   mirror charge on one side to compensate the channel. 
			// Mirror charges is mathematical charge living deep in the metal. Real charge sits on the surface
			// The distribution is given by the need to eat the field lines. That is where dielectric thickness comes into play
			// Evenly distributed charge on the other side to let the gate float until Ohmic relaxation.			
			this.V_G / distance_to_GND  +  sum_of_potential(+VGD ?) / dielectric_thickness = net charge on gate
			let current=(this.VG-Wire.V )/ wire.impedance  

			// Gate
			// cable: Ohmic = defined impedance cable
			let V_G=sum_p/this.len-carrier_on_gate+this.V_GS // V_S is given by supply rail ( by extension also to later gates?)
			carrier_on_gate+=V_G/this.gate.impedance // avtuslly resistance * capacity to ground (in the cable? Move away from cable?)

			let avg_carrier_on_gate=carrier_on_gate/sum_p
			this.element.forEach((e,i)=>{
				e.carrier[0]=avg_carrier_on_gate*potential[i]
			})
		}	
}

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

	gate:Gate
	source:Source
	conductivity=1
	channel: number[];
	solve(){
		let field=0,potential=this.V_GS,carrier_on_gate=0,sum_p=0
		this.element.forEach((e,i)=>{
			field+=e.divergence() // After solution, field within the electrode is zero. All is in the channel. Carrier density in the elctrode mimics this potential.
			potential+=field
			this.field[i]=field
			this.potential[i]=potential
			sum_p+=potential
			carrier_on_gate+=e.carrier[0]
		});


		
		// semiconductor in channel
		// source . Drain gets the same pppulation. Should have no effect usually. For a transfer gate it is exactly what we want
		this.element[this.len-1].carrier[1]=this.element[0].carrier[1]=this.source.population

		let next_channel_carrier=new Array<number>(this.len-2)
		for(let i=1;i<this.len-1;i++){
			next_channel_carrier[i] = this.element[i+1][1]+Math.abs(this.field[i])*this.conductivity*this.element[i+Math.sign(this.field[i])].carrier[1]
		}
		this.channel=next_channel_carrier
	}
}

class MosFet{
	gate:Gate
	channel:Channel
	solve(){
		this.channel.solve()
		this.gate.solve()
	}
	constructor(){
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