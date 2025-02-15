class End {
    // capacity of the rails is effectively infinite
    // so the solver should 
    example() {
        let other;
        if (other.capacity == undefined)
            var end = other;
    }
}
class Stub extends End {
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
class Route {
    constructor(End_count, formal_drain) {
        this.isGoverned = false;
        this.end = new Array(End_count);
        if (formal_drain != undefined) {
            this.end[this.end.length - 1] = formal_drain.electrode[1];
            //formal_drain.electrode[1].
        }
    }
    //
    environment_and_charge_to_voltage() {
        let charge = 0, capacity = 0, charge_after_distribution = 0, bound_charge = 0, voltage_wo_divergence = 0;
        let pinned_voltage = null;
        // Harvest field on the other side of the dielectic of the gate ( addition to capacity to ground )
        // Collect charge on elementary capacitors of the gate
        this.end.forEach((end) => {
            if (end.capacity == undefined) {
                pinned_voltage = end.Voltage;
                return;
            } // no gate
            if (end.channel = undefined) {
                return;
            } // source or drain, nothing to do here
            if (pinned_voltage != null)
                return; // gates will be overpowered
            let gate;
            let ch = gate.channel, len = ch.potential.length - 2, gate_count = ch.gate.length;
            let gate_width = len * gate.index / gate_count;
            let start = gate.index * gate_width;
            gate.channel_voltage = 0;
            for (let i = start; i < start + gate_width; i++) {
                gate.channel_voltage += ch.potential[i];
            }
            gate.channel_voltage = gate.channel_voltage / (ch.potential.length - 2);
        });
        // collect charge to GND . I use the old voltage to keep values small and make it physical
        if (pinned_voltage != null) {
            var voltage = pinned_voltage;
        }
        else {
            // total charge on our side
            // This works like divergence, just with more neighbors.
            // Capacity 2 is like 2 neighbors
            this.end.forEach((stub) => {
                bound_charge += stub.Voltage * stub.capacity; // Gates have like 4 times the capacity, while electrodes are more Ohmic
                capacity += stub.capacity;
                // charge flows freely between all ends
                charge += stub.charge; // from emission or overflow and previous time-step
                voltage_wo_divergence += 0; // Environment is at 0. Does this make sense?
                if (stub.channel_capacity != undefined) {
                    voltage_wo_divergence += stub.channel_capacity * stub.Voltage;
                    capacity += stub.channel_capacity;
                    bound_charge += stub.channel_capacity * (stub.Voltage - stub.channel_voltage);
                }
            });
            // our voltage ( Metal contains no field)
            voltage_wo_divergence /= capacity;
            var voltage = voltage_wo_divergence + charge / capacity;
        }
        // Redistribute charge and broadcast the voltage
        this.end.forEach((stub) => {
            if ((stub).capacity == undefined) {
                return;
            } // no stub . No defined capacity. No way to distribute charge here.
            stub.Voltage = voltage;
            let c = voltage * stub.capacity; // Gates have like 4 times the capacity, while electrodes are more Ohmic. 
            let maybe_gate = stub;
            if (maybe_gate.channel_voltage != undefined) {
                c += (voltage - maybe_gate.channel_voltage) * maybe_gate.channel_capacity;
            }
            stub.charge = c, charge_after_distribution += c; // second one is a check
        });
    }
}
class Gate extends Stub {
    constructor(channel, index) {
        super();
        this.dielectric_thickness = 1;
        this.polarization = 0;
        this.channel = channel;
        this.index = index;
    }
    V_Gd() {
        return this.voltage + this.doping_electroferric;
    }
    //wire = new Stub()
    propagete_field_from_channel_to_gate(net_Potential) {
        // Metal   mirror charge on one side to compensate the channel. 
        // Mirror charges is mathematical charge living deep in the metal. Real charge sits on the surface
        // The distribution is given by the need to eat the field lines. That is where dielectric thickness comes into play
        // Evenly distributed charge on the other side to let the gate float until Ohmic relaxation.			
        // this is stable because changes in potential on either side get damped before the pull on the other side. Also: negative feedback. Charge dampens. Maybe add artificial dammping later.
        return this.voltage / this.capacity_to_GND + (this.voltage - net_Potential) / this.dielectric_thickness;
    }
    /*	// Mostly serves encapsulation. Or should a gate own the wire up to the next node?
        propagete_voltage_2_charge(voltage:number){
            this.charge += this.wire.current(voltage)
        }*/
    divergence(potential, charge_density) {
        let charged_bound_by_capcitor = (potential - this.voltage) * this.capacity_per_element;
        return charge_density - charged_bound_by_capcitor;
    }
}
// Capacitor as an object is not compatible with the simulation loop over time and alternating between carriers and field
// static information is per gate
class Capacitor {
    constructor() {
        this.capacity = 1; // for the whole elctrode backsite. Small compared to gate dielectric. I may give the channel capacity to ground and then not tota .. I don't see any advantage. There is no field along a metal electronde!
        this.carrier = new Array(1); // 0=gate side, 1=channel . Usually they compensate each other. 
        this.polarization = 0; // ferro-electric dielectric is most simple to simulate, even when I may show an opposite gate instead. Tune between switches and pull-ups
    }
    divergence() {
        // the gates have capacity towards GND. I need to reach GND on both sides (per cell). Charge needs to be slow for a stupid simulation .. fast charge on gates seems to need linear algebra.
        // So even with gates: charge -> electric field
        return this.carrier[1] - this.carrier[0] + this.polarization;
    }
}
// Looks like the simulation needs to decide on a source and drain for efficient ( stable ) simulation
class field_along_carriers {
}
class Channel {
    constructor(channel_len, c) {
        this.len = channel_len;
        this.carrier_density = new Array(channel_len).fill(0); // The solver fights the clean consept of:   Cell{ potential, charge }
        this.potential = new Array(channel_len).fill(0);
        this.conductivity = c; // || 1
    }
    propagate_carrier_to_field(electrode, gate) {
        let field = 0, potential = this.V_GS, carrier_on_gate = 0, sum_p = 0;
        // Like in the 2d simulation I need to criss cross? But I don't accumulate .. should I? I do ping pong within in the channel. This should be stable if I don't have a bug
        // Kinda like, when charge -> field -> charge don't agree, something is not consistent?
        // This is kinda futile with multiple gates : if (V_S>V_G) ; // go from source to drain. But what about Ohmic region? 
        let gate_length = (this.potential.length - 2) / gate.length;
        this.potential[0] = electrode[0];
        this.potential[this.potential.length - 1] = electrode[1];
        // Probably I could apply currying here? But I fail to see the benefit
        // Left and right interleaved. Start at the electrodes to work well with Source or Drain on either side (Ohmic region, transfer gate)
        const compensation = 0.1; // Voltage between gate and source of 1 ( V actually in cold Silicon CMOS ) should result in carrier density of 1 ( whatever, I dunno those, just for dispaly)
        for (let i = 1; i < this.potential.length - 1; i++) {
            let k = i;
            for (let j = 0; j < 2; j++) {
                let g = gate[Math.floor((k - 1) / gate_length)];
                this.potential[k] = ((this.potential[k - 1] + this.potential[k + 1]) + g * compensation) / (2 + compensation) - this.carrier_density[k] * compensation; // As long as gates all have the same size, I don't need to match this capacisty with the route.capacity .
                k = this.potential.length - 1 - i;
            }
        }
    }
    // Real NAND gates have a complicated doping profile at the ends of the electrodes and try to reduce capacity between electrodes
    // Also I get head ache when I try to blend between electrodes
    // It is kinda realistc to give electrodes round edges and fill the space with dopants to keep carrier density homogenous at full on state
    // I don't show this geometry, just at the edges I use two parabolas to blend over
    // Doping is subtracted from the free carriers before the field is calculated
    // to keep numbers easy, I set doping to 1
    propagate_carrier_n_doping_to_field(electrode, gate, lines) {
        let half_bevel = 4, granularity_for_bevel = 2 * half_bevel;
        let simulated_channel_length = this.potential.length - 2; // subtract electrodes .. I know that the field -> carrier code needs this, but here it looks ugly
        let count_of_bevel_grid_cells = ((gate.length * 2) * half_bevel); // electrodes each have only one bevel compared to the gate. Add back in as one effective gate
        let channel_cells__per__bevel_cells = simulated_channel_length / count_of_bevel_grid_cells;
        // don't confuse gate (the array) length with gate (a sinlge one ) length in terms of simulation cells!
        let bevel_count_perChannel_undergates = ((this.potential.length - 2) * granularity_for_bevel); // subtract electrodes, finer granularity for gate. Add electrode bevel back in ((round=>2) * (sides=2)). //   add one extra blend between right (last) gate and right electrode
        let gate_bevel_count = bevel_count_perChannel_undergates / gate.length;
        this.potential[0] = electrode[0];
        this.potential[this.potential.length - 1] = electrode[1];
        // Probably I could apply currying here? But I fail to see the benefit
        // Left and right interleaved. Start at the electrodes to work well with Source or Drain on either side (Ohmic region, transfer gate)
        const electron_charge = 0.1; // Voltage between gate and source of 1 ( V actually in cold Silicon CMOS ) should result in carrier density of 1 ( whatever, I dunno those, just for dispaly)
        for (let i = 1; i < this.potential.length - 1; i++) {
            // little hack to improve effect of both electrodes. Maybe I only will use NAND later on, and one electrode will be a rail? Then do away! I need it now to check for symmetry in my indices
            for (let j = 0, k = i; j < 2; j++, k = this.potential.length - 1 - i) {
                // boxcar  let g=gate[Math.floor((k-1)/gate_length)]
                // floor and % does not introduce new aliasing. All alising happens at the final -floor-> index 
                let g_if = (k - 1) / channel_cells__per__bevel_cells + granularity_for_bevel; // add the imaginary gate part of the left electrode cell, which is not simulated as is the right one. // subtract the left electrode bevel
                let g_i_ = Math.floor(g_if);
                let g__f = g_if % 1;
                let gi = Math.floor((g_i_) / granularity_for_bevel) - 1;
                let gl = g_i_ % granularity_for_bevel; // gate local  // floor(floor) is only allowed for integer division
                let g_volt = gate[gi]; // this.potential[0]  // I wished that a compiler would optimize away access to potential. But then away, it is my (this) potential. Access should be safe
                // if (gi >= 0) g_volt = gi < gate.length ? gate[gi] : this.potential[this.potential.length - 1]
                // todo: print doping and gi  .. special test methods?
                let f = g__f, doping = 0;
                if (gl >= half_bevel)
                    gl = 7 - gl, f = 1 - f;
                if (gl == 0)
                    doping = 1 - 0.5 * Math.pow(f, 2);
                if (gl == 1)
                    doping = 0.5 * Math.pow(1 - f, 2);
                // let ec=(capa)/(2+capa);
                // let ec*(2+capa)=(capa);
                // let ec*2 =capa*(1-ec)
                // let ec*2/(1-ec) =capa
                let capa_max = electron_charge * 2 / (1 - electron_charge); //;console.log(capa_max) 0.22
                let capa = capa_max * (1 - doping); // At VGS=1 the doping should give a constant electron density (of 1) in the channel.
                // As long as gates all have the same size, I don't need to match this capacisty with the route.capacity .
                // Make divergence = charge 
                // capa blends to zero
                // carrier density should cover [0,1], but also match capacity. Divergence along the channel needs to be enhanced for pinch-off. Instead we reduce the capacity and the charge of a carrier
                // Doping is expressed in terms of dopants, but not their charge
                // blending is relative
                this.potential[k] = ((this.potential[k - 1] + this.potential[k + 1]) + g_volt * capa) / (2 + capa) - (this.carrier_density[k] - doping) * electron_charge;
                if (lines !== undefined && j == 0) {
                    lines[0][k] = g_if / 10;
                    lines[1][k] = f;
                    lines[2][k] = gl / 2;
                    lines[3][k] = doping;
                }
            }
        }
        return;
    }
    // This still creates a homogenous electric field with spikes of carriers on both ends
    propagate_carrier_to_field_blend(electrode, gate) {
        let field = 0, potential = this.V_GS, carrier_on_gate = 0, sum_p = 0;
        // Like in the 2d simulation I need to criss cross? But I don't accumulate .. should I? I do ping pong within in the channel. This should be stable if I don't have a bug
        // Kinda like, when charge -> field -> charge don't agree, something is not consistent?
        // This is kinda futile with multiple gates : if (V_S>V_G) ; // go from source to drain. But what about Ohmic region? 
        //let gate_length=(this.potential.length-2)/gate.length  
        let bevel = 4;
        let gate_length_blend = (this.potential.length - 2) / (gate.length * bevel + 1); // subtract electrodes   add one extra blend between right (last) gate and right electrode
        this.potential[0] = electrode[0];
        this.potential[this.potential.length - 1] = electrode[1];
        // Probably I could apply currying here? But I fail to see the benefit
        // Left and right interleaved. Start at the electrodes to work well with Source or Drain on either side (Ohmic region, transfer gate)
        const compensation = 0.1; // Voltage between gate and source of 1 ( V actually in cold Silicon CMOS ) should result in carrier density of 1 ( whatever, I dunno those, just for dispaly)
        for (let i = 1; i < this.potential.length - 1; i++) {
            let k = i; // little hack to improve effect of both electrodes. Maybe I only will use NAND later on, and one electrode will be a rail? Then do away! I need it now to check for symmetry in my indices
            for (let j = 0; j < 2; j++) {
                // boxcar  let g=gate[Math.floor((k-1)/gate_length)]
                let p_blend = (k - 1) / gate_length_blend; // -1 is to avoid the electrodes. There is no synergy with the other -1 because I want the real array address in the loop counter ( buffer overruns are the worst ) 
                let p_int = Math.floor(p_blend); // blend segment
                let poss = [Math.floor((p_int - 1) / bevel), Math.floor(p_int / bevel)]; // Positions where to possible lookup data from  . We look to the left here. To the right we are made to overshood by the +1 in gate_length_blend divisor
                let source = electrode.slice(); // electrodes are in the correct order. Base case ( is this lingo consistent with rekursion? ) is a capacitor with two electrodes
                // Positions within bounds? Then replace electrode voltage with gate voltage
                if (poss[0] >= 0)
                    source[0] = gate[poss[0]];
                if (poss[1] < gate.length)
                    source[1] = gate[poss[1]];
                let g = source[0]; // we may be square on top of an electrode
                if (source[0] != source[1]) { // or actually need to blend
                    p_blend %= 1; // fraction
                    g = p_blend * source[1] + (1 - p_blend) * source[0];
                }
                this.potential[k] = ((this.potential[k - 1] + this.potential[k + 1]) + g * compensation) / (2 + compensation) - this.carrier_density[k] * compensation; // As long as gates all have the same size, I don't need to match this capacisty with the route.capacity .
                k = this.potential.length - 1 - i;
            }
        }
    }
    propagete_field_to_carriers() {
        // semiconductor in channel
        // source . Drain gets the same population. Should have no effect usually. For a transfer gate it is exactly what we want
        for (let i = 0; i < 2; i++) {
            this.carrier_density[this.carrier_density.length - 1 - i] = this.carrier_density[i] = 1; // What is this? Temperature at source? Doping. I don't know why I ( my process in the fab ) vary this. All population is relative to this "this.source.population"
        }
        //let next_channel_carrier=new Array<number>(this.carrier_density.length-2)
        let this_carrier_density_i_ = this.carrier_density[1];
        for (let i = 1; i < this.len - 1; i++) {
            let field = (this.potential[i + 1] - this.potential[i - 1]) * this.conductivity; // pull field
            // push carriers 	(KISS)
            var current = field * this_carrier_density_i_;
            let target = Math.sign(current) + i;
            let carrier_count = Math.min(Math.abs(current), this_carrier_density_i_);
            this_carrier_density_i_ = this.carrier_density[i + 1];
            this.carrier_density[i] -= carrier_count;
            this.carrier_density[target] += carrier_count;
            //next_channel_carrier[i] = this.carrier_density[i+1]+Math.abs(this.field[i])*this.conductivity*this.carrier_density[i+Math.sign(this.field[i])]
        }
    }
    // Todo: Here seem to be two products . Maybe this can be formulated as MatrixMul  selfMul MatrixMul . Weird. Or distribute the sums.
    // So all products of 3 potentials and 3 carrierDensities ( 9 in total )  =>  delta . But for diffusion without any, I need an additional "1 potential"
    propagete_field_to_carriers_diffuse() {
        // semiconductor in channel
        // source . Drain gets the same population. Should have no effect usually. For a transfer gate it is exactly what we want
        for (let i = 0; i < 2; i++) {
            this.carrier_density[this.carrier_density.length - 1 - i] = this.carrier_density[i] = 1; // What is this? Temperature at source? Doping. I don't know why I ( my process in the fab ) vary this. All population is relative to this "this.source.population"
        }
        // diffuse carriers part
        let diffused2 = new Array(this.carrier_density.length - 1);
        for (let i = 0; i < diffused2.length; i++) {
            diffused2[i] = (this.carrier_density[i] + this.carrier_density[i + 1]) / 2;
        }
        let diffused3 = diffused2.slice(); // Code as different as possible to other version  to  have complementary test
        diffused3.fill(0);
        for (let i = 0; i < diffused2.length; i++) {
            let field = Math.min(1, Math.max(-1, (this.potential[i + 1] - this.potential[i]) * this.conductivity)); // pull field
            let current = diffused2[i] * field;
            let target = Math.sign(current) + i;
            let c = Math.abs(current);
            diffused3[i] -= c;
            diffused3[target] += c;
        }
        //diffuse field
        let carriers = new Array(this.carrier_density.length).fill(0);
        for (let i = 1; i < this.len - 1; i++) {
            let field = Math.min(1, Math.max(-1, (this.potential[i + 1] - this.potential[i - 1]) * this.conductivity)); // pull field
            // push carriers 	(KISS)
            var current = field * this.carrier_density[i];
            let target = Math.sign(current) + i;
            //let carrier_count=Math.min(Math.abs(current),this_carrier_density_i_);this_carrier_density_i_=this.carrier_density[i+1]
            carriers[i] -= current;
            carriers[target] += current;
            //next_channel_carrier[i] = this.carrier_density[i+1]+Math.abs(this.field[i])*this.conductivity*this.carrier_density[i+Math.sign(this.field[i])]
        }
        // Blend
        for (let i = 1; i < this.len - 1; i++) {
            this.carrier_density[i] = (0.5 * this.carrier_density[i] + 0.5 * (diffused2[i - 1] + diffused2[i]) / 2) + (0.7 * ((diffused3[i - 1] + diffused3[i]) / 2) + 0.3 * carriers[i]); //+0.5*((diffused3[i-1]+diffused3[i])/2)
            //this.carrier_density[i] =  (this.carrier_density[i]*0.8+(diffused2[i-1]+diffused2[i])/2*0.2)+(diffused3[i-1]+diffused3[i])/2
        }
        // Bleed : Only place to prevent carriers going below zero
        // Landing at exactly at zero is very important as is known from the theory of a Diode
        // no interleave of this iteration with the linear one until I understand stability
        // Should be local. This is not a list of accounts of one customer.
        // Thing of islands peaking out of water. For humans, point to the nearest shore. Should be stable on iteration, which I need to resolve all sub-zeros.
        let signCount = [0, 0, 0], last_positive = 0; // certainly the electrode has carriers
        let len = this.carrier_density.length, m = 0;
        let shore = new Array(len).fill(0, 0, len / 2 - 1).fill(len - 1, len / 2, len - 1); // point to nearest electrode
        for (let i = 1; i < this.len - 1; i++) {
            if (this.carrier_density[i] > 0)
                last_positive = i;
            else {
                if (this.carrier_density[i] < 0) {
                    m = -1;
                    let d = Math.abs(i - last_positive) - Math.abs(i - shore[i]);
                    if (d == 0) { // same distance which happens often because I want a rough grid per gate
                        let c = this.carrier_density; // tie break for 99% or all cases. No glitch for the rest
                        d = c[shore[i]] - c[last_positive]; // opposite order
                    }
                    if (d < 0)
                        shore[i] = last_positive;
                }
            }
        }
        for (var safety = 0; safety < this.len && m != 0; safety++) {
            var lm = m;
            m = 0;
            // land on shore. I don't interleave this for symmetry and easy debugging
            for (let i = 1; i < this.len - 1; i++) {
                let c = this.carrier_density;
                if (c[i] < 0) {
                    let s = shore[i];
                    let d = c[s];
                    d += c[i];
                    c[i] = 0;
                    if (s > 0 && s < len - 1)
                        m = Math.min(m, d); // the electrode density shown is merely the thermic current. The reservoir is deep.
                    c[s] = d; // Still need to track carriers for the elecric field and current through the wires!
                }
            }
            // shores "roll up" , which may make islands vanish
        }
        //if (safety) console.log(safety,lm)  // shows 0 or 10
    }
    //figure_of_merit
    fm(me, them) {
        Math.abs(me - them);
        return false;
    }
}
class MosFet {
    constructor(channel_len, gateCount, electrode, routes, conductivity) {
        this.gate = new Array(gateCount);
        for (let i = 0; i < routes.length; i++) {
            routes[i].end.push(this.gate[i]);
        }
        this.electrode = electrode.concat(new Array(Math.max(0, 2 - electrode.length)));
        // important for the  ohmic vs pinch-off region test
        if (electrode.length > 2) {
            this.gate = electrode.slice(2).concat(this.gate);
        }
        this.channel = new Channel(channel_len, conductivity);
    }
    // The characteristic graph emerges, when I animate VGS. Testing goes from wide open (see above) to closed (minimal leakage)
    channel2bitmapRow(current_Row) {
        for (let i = 0, k = 0; k < this.channel.len; k++) {
            // bluescreen
            let t = this.channel.carrier_density[k];
            let rb = Math.min(255, Math.max(0, t * 190 + (t > 0 ? 0 : 0)));
            current_Row[i++] = rb;
            current_Row[i++] = Math.min(255, Math.max(0, (this.channel.potential[k] + 0.5) * 80));
            current_Row[i++] = rb;
            current_Row[i++] = 255;
        }
    }
    solve() {
        // Types suggest that I should not send raw numbers .. Maybe in the end the channel comes back into the MosFET
        this.channel.propagate_carrier_n_doping_to_field(this.electrode.map(e => e.Voltage), this.gate.map(g => g.Voltage));
        //this.channel.propagate_carrier_to_field_blend(this.electrode.map(e => e.Voltage), this.gate.map(g => g.Voltage))
        //this.channel.propagate_carrier_to_field(this.electrode.map(e=>e.Voltage),this.gate.map(g=>g.Voltage))  // I need the real V_G as in the 2d simulation. There may be some mathematical shot cuts, but it probably has no educational worth and does not help debugging. And is there really? V_G globally pulls in carriers. In the end (haha pun) this is V_GS. The main parameter in any textbook (channel potential is pinned to V_S on the source site. While solving, this (information) propagates through the whole channel) . This an the next call replace the 2d poisson solution of the grid based simulation.
        let voltages;
        // On the one hand the gate provides the voltage .. like a function to pull from
        // On the other hand the simulation in the channel should just run through the gaps between the gates. I rather not specify any function parameters and return values.
        //this.channel.propagate_carrier_to_field(gates:gate[])
        this.channel.propagete_field_to_carriers_diffuse();
        //this.channel.propagete_field_to_carriers()
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
function emission(voltage) {
    return voltage * this.population;
}
//}
// The website should play like a YouTube video, but even then it needs a clock: which can also act as Single Step
class Button extends Stub {
    constructor(name, default_voltage) {
        super();
        this.name = name;
        this.Voltage = default_voltage; // I don't want to translate undefined to null
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
class Circuit {
    constructor(logsim_file) {
        this.name = "RS latch";
        this.Buttons = new Array(2);
        this.Buttons[0] = new Button("Set"); // default is undefined  =  high Z
        this.Buttons[1] = new Button("Clear");
        this.Buttons[2] = new Button("GND", 0);
        this.Buttons[3] = new Button("Vcc", 1);
        this.MosFets = new Array(3);
        this.route = new Array(3);
        this.route[0] = new Route(0);
        this.route[0].end.push(this.Buttons[0]);
        let channel_len = 256;
        this.MosFets[0] = new MosFet(2, channel_len, [], [this.route[0]]);
        this.route[0] = new Route(2, this.MosFets[0]); // I need a way to iterate over all Routes exactly once. With Multiplexers, one route is connected to multiple drains.		
        // There are multiple ports on the MosFet. It is difficult to name them here ( Logisim and their cooridinates?). I only allow designated "drain"
        // So on here the Parameter is source? Source is GND usually. So it is the first gate? No weird one element Arrays. But why 2 gates counted a .. union type
        this.MosFets[1] = new MosFet(2, channel_len, [], [this.route[1]]); // I don't use transfer gates right now. For a compact file format, I should use the tree structure aggressively, even if it breaks symmetry. This is an optionial parameter
        this.route[1] = new Route(2, this.MosFets[1]); // I need a way to iterate over all Routes exactly once. With Multiplexers, one route is connected to multiple drains.	
        // Todo: Make a method for this:
        let g = new Gate(this.MosFets[0].channel, 2);
        this.route[1].end.push(g);
        this.MosFets[0].gate.push(g); //)
        // Bidirectional links connect mosfet 0 to route 1
    }
    solve() {
        this.MosFets.forEach(t => t.solve());
        this.route.forEach(r => r.environment_and_charge_to_voltage());
    }
}
export { MosFet, Stub, Button };
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
