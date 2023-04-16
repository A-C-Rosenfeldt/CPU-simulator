import { field2Gl, SimpleImage } from './GL.js';
/*

So it seems that a MOFET with flat gate oxyte and body JFET looks best for a computer. CMOS is okay. FinFET is for NMOS : It shots a constant current onto the drain (used in 6502 ): No dynamic. Straight.
I cannot avoid doping. I just pretend that is on a regular super lattice. With wave mechanics I could simulate a carbon nanotube, but then I have to use two electrodes and need bridges ( above in NMOS it is all integrated ).
Beam pentodes and klystrons don't look good ( in 2d ). Bipolar devices would at least need a another color channel ( and I am already out of color channels ). Don't show the potential?
Don't show the badgap? With nFEt I only care about the electron potential. With CMOS I have clearly separated areas for electrons and holes ( not with in a transistor, but with in a Gate:
	Half of it is connected to Vdd and the other halft is connected to Vss. Gates can be huge ) . Bipolar does not need a metallic gate. So the bandgap is fixed. I can show the electric field for the channel,
	The base looks quite boring. A strip. Either filled ( green  ) or empty ( black leading to a repulsive potential (blue) ). Then repulsive static charges around ( in reality SiOxide ).
	Level shift? Resistors?? For a const current gun in a BJT I need a level shifter. Ah, this does no fly.

{\displaystyle {\frac {\partial {\vec {m}}}{\partial t}}+\nabla \cdot ({\vec {v}}\otimes {\vec {m}})=-\nabla p+\mu \Delta {\vec {v}}+{\frac {\mu }{3}}\nabla (\nabla \cdot {\vec {v}})+{\vec {f}}.}

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
	v: number[] // velocity
	a: Vector // acceleration due to stain
}

class Liquid_Lattice{
	mu=1 // viscosity needs to be tuned for a nice look 
lattice:Liquid_Cell[][][] // t & 1 , y , x ( row major .. like I have row objects)
t=0


// I think in the electro static part, I am clever to read the map to optimize for memory and speed
// Navier Stokes is too complicated for me and I also did try out those tricks.
// So better be simple and switch to GPU later

Navier_Stokes
	V ->
	strain
	stress -> F

Verlet: stress -> A -> V -> R -> density

Vector_Maths

Boundary(location,velocity, electric_field ){
	if (metal){
		if (electric_field>1) emission=electric_field-1 // work function on interface and Ohm because exp may destabilize the simulation (short time steps for space charge)
	}
	if(insulator){ 
		// the definition of kinetic energy is valid in my simulation. Electrons already need a mass for Verlet
		// so they can end up above the bandgap ( easily? considering the work function)
		// Now I wonder I should include holes .. in the very next release. Totem Poles!!
		// So I cannot use Verlet .. for the sharp steps of the surface I need collision and refraction
		// .. I don't integrate over arbitrary fields. It is soft field and surfaces .. Specialize for this!

		// how do I work with the grid
	}
}

// boilerplate ( import? inherit )
Buffer calls Navier_Stokes
	clear
	swap

propagate(){
	GetClearBuffer()	
	Strain(velocity)
	RemoveRotation() // viscosity does not feel rotation, only shear
	RemoveDivergence() // Stokes noticed that the ideal gas only has a stationary equation. Pure expansion (strain) does not lead to pressure (stress). The elctrons are point like and not like polymers and look better if the behave the same.
	Buffer.forEach( strain -> stress)
	Location=Verlet(Stress) // flow
	
	Boundary()

	// todo: share interface with electro static 
	// use n (density) from the old frame(t) I also need to use v at that place. Like verlet velocity. I cannot pull!
	let x=1,y=1,pre_i=0
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

	// actively ignore rotation
	const symmetric=(strain[1][0]+strain[0][1])/2
	strain[1][0]=strain[0][1]=symmetric
	// actively ignore change of pressure ( over time due to velocity ): Stokes conjecture
	const divergence=(strain[0][0]+strain[1][1])/2
	strain[0][0]-=divergence
	strain[1][1]-=divergence
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