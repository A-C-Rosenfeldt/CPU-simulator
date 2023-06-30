import { field2Gl, SimpleImage } from './GL.js';
/*

Channel width is created either by the Fermi-Sea over bands: E ~ density
Almost the same effect is created by the ideal gas equation: p ~ density .  Though E would then rise the p^2 (adiabatic). So we claim isotherm: E=kinetic energy of particles.
 ( absolute pressure is relevant because of the depletion region, so we cannnot linearize p^2).
A single particle Schrödinger equation can also create some width, but I want space charge for n-Fet, and don't want standing waves in my 4-NAND gate.

Real MOSFETs have a lot of doping around the electrodes and between multiple Gates ( important for NAND, which allow me to keep transistor count low ). All contancts are Ohmic.
There is no field emission. Field emission would weird because the pulling electrode would really need to stress its insulator and then still: How to the electrons reach the channel from there?
I see that doping under the electrode is not so important. I don't want to have holes. There is just the metallic substrate at negative potential Vss. You could imagine that it sucked away holes on power on.
Without doping we have a clean, homogenous electric field in the semiconductor.
Now without space charge, the electrons behave according to the atmosphere equation and form a channel. Can I define this as allowed leakage?
Just as the gas equation gives us channel width, it also pushes some electrons out of the wells around the electrodes.
So some electrons do reach the body electrode?
With space charge, the channel narrows. So we want to turn it on slowly. Divide by number of total electrons in the simulatoion.
As we rise the gate voltage, more electrons flow -- in a very narrow channel.
We can adjust depletion and enhencement mode by doping the gate oxyde. Oh, I see. You don't want to mess with it in real life.
Only dynamic methods would allow to remotly shift the voltage level. I want a fully static design. So dope the gate oxyde. It is for the looks. I want my homogenous field in the semiconductor.
Pinch-off on both sides is already difficult enough to understand. Don't need (inhomogenous) doping.
The doping around the electrons let me get away with a flat body electrode. No need for a highly negative point charge which runs of the scale.
The doping profile can even just be rectangles, or linear ramps, or quadratic bi-splines. Or maybe: Half spheres with a quadratic splines on the radius. We calculate it only at start up. It has to look nice.
Sphere look nice between gates. Real electrodes would want high doping. Thus expand the profile along them. Electrodes are small to reduce stray capacity. The body electrode really is the Matrix in which we live. It shields all signals.

So it seems that a MOFET with flat gate oxyte and body JFET looks best for a computer. CMOS is okay. FinFET is for NMOS : It shots a constant current onto the drain (used in 6502 ): No dynamic. Straight.
I cannot avoid doping. I just pretend that is on a regular super lattice. With wave mechanics I could simulate a carbon nanotube, but then I have to use two electrodes and need bridges ( above in NMOS it is all integrated ).
Beam pentodes and klystrons don't look good ( in 2d ). Bipolar devices would at least need a another color channel ( and I am already out of color channels ). Don't show the potential?
Don't show the badgap? With nFEt I only care about the electron potential. With CMOS I have clearly separated areas for electrons and holes ( not with in a transistor, but with in a Gate:
	Half of it is connected to Vdd and the other halft is connected to Vss. Gates can be huge ) . Bipolar does not need a metallic gate. So the bandgap is fixed. I can show the electric field for the channel,
	The base looks quite boring. A strip. Either filled ( green  ) or empty ( black leading to a repulsive potential (blue) ). Then repulsive static charges around ( in reality SiOxide ).
	Level shift? Resistors?? For a const current gun in a BJT I need a level shifter. Ah, this does no fly.

{\displaystyle {\frac {\partial {\vec {m}}}{\partial t}}+\nabla \cdot ({\vec {v}}\otimes {\vec {m}})=-\nabla p+\mu \Delta {\vec {v}}+{\frac {\mu }{3}}\nabla (\nabla \cdot {\vec {v}})+{\vec {f}}.}


I could start from Navier-Stokes with ideal gas: PV=nkT . All units are dimensionless and so I guess I really only have one or two degrees of freedom to make it look good.
So now in a containter the gas will evenly spread out.
On two sides of the container we place opposing charges ( gate and body diode ).
Now the user has to sliders to change the temperature and to change the charge.
I mean really I would want to start of with uncharged gas as in this text.
Then I fade in the charge ( in reality: come down from infinite temperature ) and the density gets hollows.
Then I charge the side walls and density falls to one side.

To get a nice switching point, I accept doping, but don't show the doping pattern or if doping is regular ( super lattice ) or whatever.
Real Mosfets have a complicated doping pattern. In particular they are channel doped right under the gate.
I did not see series MOSFETS, but I guess that they have a channel between all of their gaps.
So it would be a little weird not to show this doping.
A depletion mode gate in the body can work against a homogenous doping, but at low temperature, we get this ugly screening effect ( Debye length).
That means that visually the gate side will switch, but the other side will just have homogenous charge carriers with a sharp border to the depletion zone.
Uh, this maybe not so bad. I just have the depletion circle meet or touch the full enhencemant region created by temperature.

I dial in the temperature so that we see a thick line in the on state.
Due to doping, the off state has a bit of depletion mode and there will be a shallow channel in the center between gate and body diode.
This depends a bit on the voltage of the rail ( interface charge of the gate ).
We don't want the gate to do too much work. There should be some leakage current like 10% of the on state? So that we have a control signal.
We don't care about heat. Rather, I may want to display some Source-Coupled Logic in the future so that I don't have to use the same "blue" for both charge carriers.
How do I mark my N or P channels? I want black as base color. I looks like I have to mark my transistors.

In reality I would aim for some carbon nanotube transistors in really good vacuum. Current transistors are protected by a cover.
Free standing tubes would just have a space under the cover. I feel like the main problem with vacuum is that any leaked gas molecule then can reach so many places. So there needs to be a fuse system to contain leaaks in a tree like manner.
Graphite is stable even in air just like silicon. So in UHV ( TV CRT ) it should last for a century. Now just spill in some reactive atoms to catch oxygen everywhere.
The main problem is that this only looks good with a gate from both sides. More bridges. Hard to read.
The other point is that to dial in the swichtig point I still need some kind of doping or level shift. So a floating ring with charge to define NPN and PNP of our CMOS.
So the doping would sit around the tube like in a high mobility transistor. "Field effect doping". This field will help electrons to jump from the metal electrodes onto the tube.
Oh this would be a MIM transistor. Around the emitting shottky contact we need a ring gate to create a source of either holes or electrons, which here depends on the rail the metal belongs to.
Wavefunction simulation computional cost is similar to classic simulation. I mostly needs to look good.

Real carbon nanotube transistors seem to use gates whose field reaches through the whole tube. Wave functions are calculated around the whole circumference.
Hense, it is possible to avoid an ohmic contact this was: Tube touches metal on 3rd of its cirumference, field electrode at non-tunneling distance tip-effect sucks the electrons out of the metal.
For gates we can then add more field electrodes, but they need to overlap along the tube to mimic the channel doping.
This can still be shown in 2d. How would a 3d see through ring electrode look like? The blue electron flow must not be obscured.
Schrödinger equation has a phase, but we show probability, and that is what the user expects.

Schrödinger needs mean field to simulate any kind of space charge, which I would need for N-MOS. If a later gate blocks the flow, I get standing wave in a box with interference pattern.
Also for discrete differences I need to have a grid fine enough to resolve the wave. I don't want wave optics here. So back to Navier Stokes?

CNT now convinced me to go without doping. With enough Schrödinger or temperature I can widen the channel. With a thin silicon slab, or thin CNT, the electrons can tunnel or drift to the other side.
In enhancement mode I would have electrodes on both sides. Alternating. The field would fill the gap between them. Basically, this the space charge in the channel creates all the electric field.
A single electron could fly right through (leakage). Multiple electrons block each other. The drain should be able to unblock the transistor.
Electrodes connected to the opposite rail lure electrons in the semiconductor. Even with doping this is done by the field of the dopands in front of the interface. With electrondes the field just reaches a little from the side.
Unlike vacuum electronics the dielectric constant, I mean the limited band gap of the semiconductor, keeps the energy of electrons below that of our SiO2 barrier. This makes the set-up even more real.
At the metal-semiconductor interface I allow current to flow out of the metal when the electric field sucks. Current follows exp(T) which should match the channel widening T.
Now what do I use for the channel. I cannot mix Navier Stokes with Schrödinger. NS looks pretty .. but not so much with charge. Electron gun .. hot, kinematic electrons to jump electrode gaps may help with high on-current. 

NMOS and PMOS is shown by the electrode polarity: source rail color, "doping" ring and drain rail. Electrons are blue. Gates are green (bandgap)? Electrodes have no green. So red for electric field.
Intrinsic semiconductors really help me to stay within my current color scheme.

Zustandsgleichung ( Ladungsdichte = pressure, but not temperature?)

einfach mal zum laufen bringen
isotropie
	flow with fixed velocity
	zustandslgleichung: circulare wellen
play button, weil es nur als Film funktioniert (CSS animation ? )
zustandslgleichung
	keine inneren Freiheitsgrade
	aber Ladungsträger





1d fall -> bild malen . Flow through a tube
sound waves. Linear approximation around a base pressure. Shock waves? I want to show the start with this trick where swap is replaced by add and sub.
diffusion ( grid effect ) is okay for a semiconductor ( i abondoned tube due to: 
	viscosity is important to me. Needs 2d?
	)

*/

class Vector extends Array<number>{
	// clear(){
	// 	this.fill(0)
	// }
	constructor(...items:Array<number>){
		super(...items)
	}	
	add(that:Array<number>, sub:boolean=false){
		for(let i=0;i<this.length;i++){
			if (sub)
			 this[i]-=that[i]
			else
			 this[i]+=that[i]
		}
	}
}

class Liquid_Cell{
	n : number //number_of_particles
	v: number[] // velocity, or impulse? -> interface
	a: Vector // acceleration due to stain
}

class Liquid_Lattice{
	mu=1 // viscosity needs to be tuned for a nice look 
lattice:Liquid_Cell[][][] // t & 1 , y , x ( row major .. like I have row objects)
t=0
}

//class Vector{}

// transpose of liquid lattice. interface vs imp
// I could not find something in Typescript for this
//class Filed_of_Vectors{}

// I think in the electro static part, I am clever to read the map to optimize for memory and speed
// Navier Stokes is too complicated for me and I also did try out those tricks.
// So better be simple and switch to GPU later

class Navier_Stokes{

	strain_to_stress(){ // hypothesis
		this.RemoveRotation() // viscosity does not feel rotation, only shear
		this.RemoveDivergence() // Stokes noticed that the ideal gas only has a stationary equation. Pure expansion (strain) does not lead to pressure (stress). The elctrons are point like and not like polymers and look better if the behave the same.
	
	}
	// on staggered grid. First derivative
	RemoveRotation(){
	// actively ignore rotation
	const symmetric=(strain[1][0]+strain[0][1])/2
	strain[1][0]=strain[0][1]=symmetric
	}

	// RemoveChangeOfCompressionOverTime
	// stokes hypothesis . Divergence . This might be importance if I model heat transfer from electron gas to lattice "hot electrons". Isotherm should give good visuals, already.
	// So going to a grid of cells, if I let them expand, the pressure on the surface depencds on the 
	// So usually, the state equation would on compressible liquid would calculate the temperature. Also we would calculate the coupling to the bath represented by the lattice
	RemoveDivergence(){
	// actively ignore change of pressure ( over time due to velocity ): Stokes conjecture
	let divergence=(strain[0][0]+strain[1][1])/2  // shiftable format
	strain[0][0]-=divergence
	strain[1][1]-=divergence
	}

	/* 
// Depending on the dynamic on the electrods (and in the future: wired-or), packages may collide
// Colliding grids eat up all the speed adavantage they might have for beams.
// So I sit on stationary grid cells. Still
	apply_Verlet(force:number[],location:number[][]){ // there is no analoug "location" on a grid, but density and impulse carried by mass (not due to force)
		so I got two frames of flown in impulse. I use the current impulse to derive velocity and strain and force.
		I use the previous impulse and current velocity (force already applies) to derive the next impulse 
		for(let component=0;component<3;component++){
			velocity+=force * inv_mass
			location[frame]=location[frame]+velocity
			// stress -> A -> V -> R -> density
		}
	}
	*/
	state_equation:StateEquation // ideal gas


// Vector_Maths

	Boundary(location,velocity, electric_field ){
		if (metal){ // bandgap = 0
			// no impulse ( velocity=0 ) at the start of each step, pressure in the metal govern those in the max-doped semiconductor next to it. Only connect a single doping level to the electrode
			// pressure difference will create velocity .. which unifies this for anode and cathode
			//if (electric_field>1) emission=electric_field-1     old // work function on interface and Ohm because exp may destabilize the simulation (short time steps for space charge)
			// velocity moves carriers
			// density dictates the amount of current .. match with the speed inside the semiconductor for good visuals
		}else{
			if(insulator){ // badgap > 3   // SiC is an insulator IMHO
				//New
				// velocity=0 (not only as a starting condiction, but throughout (the step)) ; pressure undefined
				// grid based NS has this faces between the cells. Just no flow through a face which is part of a semiconductor surface
				//Old
				// the definition of kinetic energy is valid in my simulation. Electrons already need a mass for Verlet
				// so they can end up above the bandgap ( easily? considering the work function)
				// Now I wonder I should include holes .. in the very next release. Totem Poles!!
				// So I cannot use Verlet .. for the sharp steps of the surface I need collision and refraction
				// .. I don't integrate over arbitrary fields. It is soft field and surfaces .. Specialize for this!

				// how do I work with the grid
			}else{
				// semiconductor
			}
		}
	}
}

// boilerplate ( import? inherit )
class Buffer{
	//clear
	//swap
grid=new Liquid_Lattice[2] // lattice (components) and buffer (localization .. see the slightly different fields.IterateOverAllCells)
NS=new Navier_Stokes()
propagate(){
	this.grid=[this.grid[1],this.grid[2],new Liquid_Lattice()] // swap .. I may want 3
	//this.grid=[this.grid[1],this.grid[0]] // swap .. I may want 3
	//GetClearBuffer()	// buffer .. to assert that everything is written to?

	// window for localized physics. We want 3 time frames ( one is empty at first)
	// Jagged arrays like in JS or Java sadly don't reflect physics as well as those in C++ and C# ( and Rust ). Assert?
	// fields.ts/Field.IterateOverAllCells
    for (let i = 0; i < this.grid[1].length-1; i++) {
		const str = this.grid[1][i]
		for( let along=0;along<2;along++){
			staggered[along]=[staggered[along][1],staggered[along][0]] // state is your enemy   vs   testablity and documentation. But do I really want to documentate vector fields. Uh yeah I want. Does not help with windowing. Nested synergy??
		}
		// JS is strange still. I need index:      for (let c of str) 
		for (let k = 0; k < str.length-1; k++) {
			let window=[[0,0,0],[0,0,0],[0,0,0]]  // Grid constructor? . Does strain and stress need this? Need a staggered grid?

			window=this.grid.slice(i-1,i+2) // from start to end (end not included) .. hm map

			// derivative 1 
			// on staggerd grid ( cell boundaries along=[x,y])
			//for( let along=0;along<2;along++)
			{
				staggered_strain[0][i][k]=window[i+1][k]-window[i][k]  // [] vector components  ..   -   :  point to vector?
				staggered_strain[1][i][k]=window[i][k+1]-window[i][k]
			}




			for( let along =0 ; along<2;along++){
				let other=[0,0]
				// I need the matrix at one location
				for (var di = 0; di < 2; di++)for (var dk = 0; dk < 2; dk++) {
					other+=staggered_strain[1-along][i+di][k+dk]

				}
				const quarter=1/4
				strain=[staggered_strain[along][i][k], other*quarter]

				stress=this.mu*this.NS.strain_to_stress(strain)
			}



			if (i>0 && k>0){  // i,k count backwards? void function with return or switch with break? JS like all the C lika languages has continue
				//force
				force=stress[i+1][k]-stress[i][k]+stress[i][k+1]-stress[i][k]  // I need stress on the same locations as the strain ( main component )
				impulse+=force // vector add
			}

			//map 
			const divider=1/mass
			let velocity=impulse[1]*divider // scalar product
			if velocity<0 then step=-1
			velocity=-Math.abs(velocity)
			// conservation of mass. Clear frame before time-step
			mass=mass[0,i,k] // verlet
			for (var di = 0; di < 2; di++)for (var dk = 0; dk < 2; dk++) {
				mass[2,i+di,k+dk]+=Math.abs((di+velocity[0])*(dk+velocity[1]))*mass 				
			}


			// old code

			window=[[0,0],[0,0],[0]] // 45° , center .. or flat?
			window[3]=this.grid[1][i][k]
			// No conversion to Matrix here, just values, still 45° trickery from fields.ts/Field2Diagonal.ShapeToSparseMatrix
			for (var di = 0; di < 2; di++)for (var dk = 0; dk < 2; dk++) {
				const si = i - 1 + (di + dk) //  s=source=pull   // 00 01 10 11  monotonous increase
				const sk = k - 0 + (di - dk)
				if (si >= 0 && si < str.length) {
					for(let t=0;t<3;t++){
						window[t][di][dk]=this.grid[1][si][sk]  // check out if differential operators really like this format. Alternatively, bite the bullet once and have two loops for two directions
					}
				}
			}

			// todo: extract this out of this ugly nexted loop
			Strain( window.forEach( w=> w.velocity)  )
		}}

	//NS
	Strain( window.beforeEach( velocity)  
	this.grid[2].forEach((strain)=>{
		this.NS.strain_to_stress(strain)
		
})
	Location=Verlet(Stress) // flow
	
	Boundary()

	// todo: share interface with electro static 
	// use n (density) from the old frame(t) I also need to use v at that place. Like verlet velocity. I cannot pull!
	let x=1,y=1,pre_i=0
}

self_consistent_naive_direction(){
	let velocity:number[][][]=[[[]]]  // rough -> name field vector -> fine  . Liquid_Lattice{x,y} but only velocity . component c
	let strain=v_to_strain(velocity)  // variied along, force component  // for me variied along is close to location
	let stress=this.NS.strain_to_stress(strain) // .. or directly force?
	this.stressToForce() // differntation along location
	forceToVelocity() // integration along time
	flowImpulse( velocity /* two frames */, force)
}

Clear(){
	// clear ( half of the double) fluid buffer
	for (let i = 0, i_pre = 0; i < this.fieldInVarFloats.length; i++) {
		for (let k = 0; k < str.length; k++) { 			
			this.lattice[this.t^1][y+1][x].a.fill(0)
		}	
	}
}

	var accumulator_vec = 0
	const setCells: Array<Array<number>> = [] // This is not a map because I don't access randomly
	//console.log(" push starting ")
	let strain:Vector[] =[new Vector(0,0),new Vector(0,0)] ; // like clear?
	for (var di = 0; di < 2; di++)for (var dk = 0; dk < 2; dk++) { // from FieldToDiagonalShapeToSparseMatrix
	  const si = i - 1 + (di + dk) //  s=source=pull   // 00 01 10 11  monotonous increase
		const sk = k - 0 + (di - dk) // for the si=const part :  +0-1 +1-0   => strong monotonous increase
		strain[Math.abs(si)].add(this.lattice[this.t][y+sk][x+si].v,si<0 || sk<0)  ;
	}

	// new version on window
	//  45°   .. todo: difficult sign convetion
	// strain[0]=window[0][1]-window[1][0]
	// strain[1]=window[1][1]-window[0][0]
	// loop to emphasise consistency:
	// hide components. We need both? Or not? I think we need both for flow
	for(let d=0;d<2;d++){
		strain[d]=window[2]-window[1][d]-window[1-d][0]
	}

	// directions

	//stress=this.mu*strain // now finally we can use apply unity as the stress<-strain tensor
	const stress=strain.map(row=>row.map(cell =>this.mu*cell))	
	stress.forEach(row=> { this.lattice[this.t][y][x+1].a.add(row) })

	// todo: Roles of source and destination are switched. Also: Do I use xy throughout? ik is for grid / matrix. xy would be integer + fractional
	for (var di = 0; di < 2; di++)for (var dk = 0; dk < 2; dk++) { // from FieldToDiagonalShapeToSparseMatrix
		const si = i - 1 + (di + dk) //  s=source=pull   // 00 01 10 11  monotonous increase
		const sk = k - 0 + (di - dk) // for the si=const part :  +0-1 +1-0   => strong monotonous increase

		let stre=stress[0]
		//if () stre=-stre
		this.lattice[this.t][y+si][x+sk].a.add( stre,si<0 || sk<0)


	}	


	/*
	Gates will all consist of one long gate oxyde ( axis aligned )
	No current flows in or out of the gate.
	The JEFET repelling charges also don't come close to the electron flow.
	Source and drain of course need to touch the flow.
	The source ( Schottky diode) gets a simple function: current is on when voltage is above threshold.
	The source is also flat. Emission is cut off by the repelling charge.
	Still the emission surface could be quite large? Forces between the carriers go down with the distance. We want space. Especially with thin stretched doping.
	In a shared gate maybe the whole source emits and the repelling charge splits it up into left and right?
	Now the interesting drain: The particles just shot into it. For the simulation the depth of the drain is endless.
	Source and Drain touch the gate electrode. There is a corner.
	I can assume doping ( depletion mode ) to get carriers from the source to the first gate
	and also have low source gate capacity.
	Alternatively the first gate is always on drain potential and overlaps the source.
	It would have a very slow / late turn on if it would run on logic input.
	So generally: How does charge jump from electrode to the other ( like in a charge coupled device )?
	The repelling charge is a point and centered on the electrode. I need doping to give the channels some width ( depletion mode).
	Only other way for wide channels would be the wavefunction in a high mobility transistor or carbon nano tube transistor.

	How does wired or work? long drain with independent impact zones.

	Charge in this simulation explodes if the confinement ends.
	This already leads to a large spot on the drain ( if I want low gate-drain capacity).
	As I wrote elsewhere, two NANDs can share the repelling charge. It would make sense if I pair them if they also share the drain.

*/
/*
	Beams in 2d are difficult. Or are they? I can make a potential like a slide.
	Then there are Y splits, where electrodes on both side steer the beam into either exit.
	I can have a whole binary tree ( round like a real tree ). Then I collect all the anodes like in a truth table.
	Somehow this breaks immersion. Though it gives analog dependency.
	I could make it real nice with electrodes f lens f splitter.
	The splitter would be metal. Also a strange object: where high potential with lots of doping in front of it: High field strength.
	*/

	// v+=a 
	// the a from the fluid will be added onto all parabolas in the electro static field
	// center of the particle
	/* at ( surf- | inter- ) faces, the particle is refracted ( and reflected??? )
	// I need to split the particle: Fast part outside ( coming in + reflection + diffusion = one), slow part inside
	// so from the start of the parabola I have two parts and a flow between these.
	Lateral the particle moves.
	I did choose the particle to be indepentent of the grid velocity in free space.
	Of course at surfaces, the normal velocity of the grid becomes important again,
	even lateral motion is subject to friction ( in a real gas anyways, or in a Tube? )

	what about corners ? Corners need full flow. I want to allow jagged diagonal edgeds ( for totem poles and organic wired-or Y junctions)

	Flow mode to particle mode transition? Packages are split into the grid after a time step.
	Feels a bit like motion compensation in a movie where I would split it into segments of px resolution.

	Flow does not need to deal with parabolas.
	Flow is the base. Just like in accounting: Total number of electrons needs to stay fixed.
	So then I rip the mesh apart where flow is > 0.4 ?
	Then we follow the parabolas.
	Then we slap the particles back onto the grid ( with area division which behaves similar to bilinear interpolation)
	This allows us to have both: Fine time steps and fast beams ( beam pentode).
	I can only have beams, if I don't introduce viscosity on surfaces .. see high electron mobility transistor.
	So viscosity is only with other electrons. Impulse is transfered. Strain across .. don't allow electrons in insulator??
	Low friction would be nice for MOS gate oxide. It hacks into the beam.
	All gates are lattice aligned! The channel restriction is managed by the JFET ( no wet interface! ) . Constant very negativ charge. Mirror pattern allows two transistors in an NOR gate to share one charge.
	Outside of the restrictions we don't need that high velocity and we also get out of the boundary layer. But, uh, we can have jaggy oxide on the gate side.
	The whole logic gate ( same word sadly ) would be oriented along the channel
	If the restriction is so narrow, is it visible for us?

	Official viscosity just needs to be high enough to produce a boundary layer thicker than a few cells.
	With long NANDs a lot of channels will dry up. It is part of the show how MOS logic works in contrast to ECL or SourceCoupledLogic. 
	My simulation should work with both. Would ECL not feel like very leaky CMOS ? The source either runs left or right ( like CRT ) and current only flows if  .. ah all those resistors and voltage levels. Not good as symbols!

	Space charge will always produce a hollow beam for a transistor in on state, but close to the transition.
	Without a lens, beams ( beamline ) are difficult. Beams need 3 dimensions.
	And cannot be gated, just deflected to avoid charge accumulation.
	

	Code structure: grid is the base, particle extends. Agile coding order is the same.
	What is the Verlet of the grid? Or is there?
	Euler "Game loop" looks like:
	propagate the flow -> (N,V)  // Verlet would talke the (N,V) from the previous frame. Do I need triple buffers for this?
	(N,V) -> calculate electric field E
	(NS(N,V),E) -> A

	divergenz for our compressible fluid? No, the Nable means, that when I solve implicitely, I can read the divergence of the flow.
	For my explicit solver ( up the the Verlet / parabola particle beam trick ), flow is the result.
	I take the particle from the current cell and distribute its impulse over the cells given by v. Then sum up. That describes the left-hand side completely.

	R,V=R', A=R"

	So (V,N ) -> goes to the next cell . This is already present in the standard formulation ( while state equation is not ). But it should be separate ( at least in code ).
		https://en.wikipedia.org/wiki/Material_derivative

	dynamic viscosity is proportional to density ( viscosity due to diffusion )
	*/
	let a=this.lattice[this.t][y][x].a
	let v=this.lattice[this.t][y][x].v
	let n=this.lattice[this.t][y][x].n


	let r:number[]
	let derivatives:number[]
	let vector_of_derivatives:number[][] =[[r[0],v[0],a[0]],[r[1],v[1],a[1]]]

	let tm=0.0 // minimal point in time
	let r_parted:number[][]
	while( tm<1.0){
		r_parted=r.map(dimension=>this.Div_Mod(dimension)) // todo: for multiple steps make sure that we don't end up in the previous cell. ( this.t^1  divide in 4 triangles fuse with surround hmm, code dupe)

		tm=this.Trace(r_parted,v,a); // a from the fluid, r and v from lattice 
		vector_of_derivatives.forEach(d=>{
			const tm2=tm/2
			d[1] += d[2]*tm2
			d[0] += d[1]*tm
			d[1] += d[2]*tm2
		});

		// distribute n: bilinear interpolation across target cells
		this.lattice[this.t^1][y][r_parted[0][0]].n+=n*v_x_f
		this.lattice[this.t^1][y][x+v_x_i+1].n+=n*(1-v_x_f)		

	}

	// collision with metal or boundary of the array ( made of metal )
	// Bresenham

	// final destination




	}

		Boundary_conditions(){// due to the solid
	// from FieldToDiagonalShapeToSparseMatrix
	for (let i = 0, i_pre = 0; i < this.fieldInVarFloats.length; i++) {
		for (let k = 0; k < str.length; k++) { 
			
		// let a=0; //=this.lattice[this.t][y][x].n*field // acceleration due to electic field
		// // acceleration due to pressure gradient . Stagger?
		// a+= this.lattice[this.t][y][x+1].n-this.lattice[this.t][y][x-1].n // rem todo a[0]
		// a+= this.lattice[this.t][y+1][x].n-this.lattice[this.t][y-1][x].n // rem tood a[1]
		// viscosity . The electron gas flies freely over the bandgap / potential landscape
		//let strain:number[][]
	
	
		//strain[0][0]=this.lattice[this.t][y][x+1].v[0]-this.lattice[this.t][y][x-1].v[0]
		// etc
		}}

}


Div_Mod(v_x:number):Array<number>{
	// v+=a
	let v_x_i=Math.floor(v_x)
	let v_x_f=v_x-v_x_i
	return [v_x_i,v_x_f]
}

// todo: write lots of test
// trace a path (  not trace the diagonal of a matrix )
Trace(r_parts:Array<Array<number>>,v:Array<number>,a:Array<number>):number{
	let tm=new Collision
	tm.t=1
	for (let dimension=0;dimension<2;dimension++){
		let r_parted=r_parts[dimension] // timestep . Both location and time are discrete
		let ad=a[dimension]
		//let r_parted=r.map(this.Div_Mod)
		// collision with cell borders	
		for (let border=-1;border=1;border+=2){
			let t=this.PQ_equation(v[dimension]/ad,r_parted[1]/ad) 
			if (t<tm.t ) {
				tm.t=t
				tm.border=border
				tm.dimension=dimension
			}
		}
	}

	// collision with diagonal to stay linear ( triangles with const field) 
	let factor=Math.SQRT1_2  // slice and splice don't work here well
	let cd=coeff.map(derivative =>{
		
	let d=derivative.Map( dimension =>
		dimension.reduce( (s,part)=>  s+ part  )*factor
	)
	factor=1
	}
	)

	let t=map (this.PQ_equation(v/a,r_parted[1]/a) )
	if (t<tm.t ) {
		tm.t=t
		tm.border= // todo: from which side do I come from?
		tm.dimension=0
	}

	let ta:Array<number>=[]
	ta.sort();let i=0
	while(ta[i++]<0);


	return ta[i]
}



PQ_equation(p:number,q:number):number{
	let f=p/(2*q)
	let r=Math.sqrt(f^2-q)
	let s= [f+r,f-r] // we are only 
	if (s[0]>0 ) return s[0]
	return s[1]
}

 // Poisson for bound ( and jagged ) array.  Copy from field/538
// boundary condition for flow:
// insulator: No free carriers, no flow. For high mobility and hot electrons I want to allow flow, just the bandgap will repel them
//   while the flow does not care about the grid, the electric field does
//    so I can finally construct a trace out of parabolas as planned for particles a long time ago
// metal: 
//  anode: the charge goes into the pool for the piece of metal 
//  cathode: Uh like with individual particles I have the Fermi distribution bangs against the Schottky / Tunnel Diode. 
//    The field strength outside is important => some exponential function
 ShapeToSparseMatrix(metalLiesOutside = false): [Array<number>,/*=*/Tridiagonal/* x U*/] {

}

Print(): ImageData { //ToPicture   print=text vs picture?
    const iD = new ImageData(this.maxStringLenght, this.touchTypedDescription.length)
    // RGBA. This flat data structure resists all functional code
    // ~screen
    for (let pointer = 0; pointer < iD.data.length; pointer += 4) {
      iD.data.set([0, 25, 0, 255], pointer) // ~dark green 
    }
	return null // todo
}
}

function show(){
	requestAnimationFrame(render);

	var id = null;
	function myMove() {
	  var elem = document.getElementById("t_animated");
	  var pos = 0;
	  clearInterval(id);
	  id = setInterval(frame, 10);
	  function frame() {
		if (pos == 350) {
		  clearInterval(id);
		} else {
			ctx.drawImage(this, 0, 0);
		}
	  }
	}	

}

var v:number[][][]
var x:number,y:number;
function nabla_cdot():number[]{
	return [
	v[y+1][0][1]-v[y-1][0][1],
	v[0][x+1][0]-v[0][x-1][0]
	]
}

function laplace(v:number[]){
	return +
	v[y+1][0][1]-v[y-1][0][1]+
	v[0][x+1][0]-v[0][x-1][0]

}

function dyadic()

function timeStep(){

var m:number;

m+ nabla_cdot(v)*m =- nabla_cdot(p) +delta(add(v[y][x],)) 

}

class Collision{
	t:number 
	dimension:number
	border:number // 0= diagonal
}