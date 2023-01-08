import { field2Gl, SimpleImage } from './GL.js';
/*
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

class liquid_cell{
	n : number //number_of_particles
	v: number[] // velocity
	a: Vector<number> // acceleration due to stain
}

class liquid_lattice{
	mu=1 // viscosity needs to be tuned for a nice look 
lattice:liquid_cell[][][] // t & 1 , y , x ( row major .. like I have row objects)
t=0
propagate(){ // todo: share interface with elecro static 
	// use n from the old frame(t) I also need to use v at that place. Like verlet velocity. I cannot pull!
	let x=1,y=1,pre_i=0

	// clear
	for (let i = 0, i_pre = 0; i < this.fieldInVarFloats.length; i++) {
		for (let k = 0; k < str.length; k++) { 
			
			this.lattice[this.t^1][y+1][x].a.fill(0)
			}	
		}

	// from FieldToDiagonalShapeToSparseMatrix
	for (let i = 0, i_pre = 0; i < this.fieldInVarFloats.length; i++) {
	for (let k = 0; k < str.length; k++) { 
		
	let a=0; //=this.lattice[this.t][y][x].n*field // acceleration due to electic field
	// acceleration due to pressure gradient . Stagger?
	a+= this.lattice[this.t][y][x+1].n-this.lattice[this.t][y][x-1].n // rem todo a[0]
	a+= this.lattice[this.t][y+1][x].n-this.lattice[this.t][y-1][x].n // rem tood a[1]
	// viscosity . The electron gas flies freely over the bandgap / potential landscape
	//let strain:number[][]


	//strain[0][0]=this.lattice[this.t][y][x+1].v[0]-this.lattice[this.t][y][x-1].v[0]
	// etc
	var accumulator_vec = 0
	const setCells: Array<Array<number>> = [] // This is not a map because I don't access randomly
	//console.log(" push starting ")
	let strain:Vector[] =[new Vector(0,0),new Vector(0,0)] ; // like clear?
	for (var di = 0; di < 2; di++)for (var dk = 0; dk < 2; dk++) { // from FieldToDiagonalShapeToSparseMatrix
	  const si = i - 1 + (di + dk) //  s=source=pull   // 00 01 10 11  monotonous increase
		const sk = k - 0 + (di - dk) // for the si=const part :  +0-1 +1-0   => strong monotonous increase
		strain[Math.abs(si)].add(this.lattice[this.t][y+sk][x+si].v,si<0 || sk<0)  ;
	}

	// ignore rotation
	const symmetric=(strain[1][0]+strain[0][1])/2
	strain[1][0]=strain[0][1]=symmetric
	// ignore change of pressure ( over time due to velocity ): Stokes conjecture
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


	// v+=a 
	// the a from the fluid will be added onto allo parabolas in the electro static field
	let v=this.lattice[this.t][y][x].v
	let n=this.lattice[this.t][y][x].n



	let r:number[]
	let derivatives:number[]
	let vector_of_derivatives:number[][] =[[r[0],v[0],a[0]],[r[1],v[1],a[1]]]

	let tm=0.0,r_parted:number[][]
	while( tm<1.0){
		r_parted=r.map(dimension=>this.Div_Mod(dimension))

		// bilinear interpolation conserves n
		this.lattice[this.t^1][y][r_parted[0][0]].n+=n*v_x_f
		this.lattice[this.t^1][y][x+v_x_i+1].n+=n*(1-v_x_f)		

		tm=this.Trace(r_parted,v,a); // a from the fluid, r and v from lattice 
		vector_of_derivatives.forEach(d=>{
			const tm2=tm/2
			d[1] += d[2]*tm2
			d[0] += d[1]*tm
			d[1] += d[2]*tm2
		});
	}

	// collision with metal or boundary of the array ( made of metal )
	// Bresenham

	// final destination




	}}
}

Div_Mod(v_x:number):Array<number>{
	// v+=a
	let v_x_i=Math.floor(v_x)
	let v_x_f=v_x-v_x_i
	return [v_x_i,v_x_f]
}

// todo: write lots of test
Trace(r_parts:Array<Array<Number>>,v,a):number{
	let r=r_parts[1], tm=1 // timestep . Both location and time are discrete
	let r_parted=r.map(this.Div_Mod)
	// collision with cell borders	
	for (let border=-1;border=1;border++){
	let t=map (this.PQ_equation(v/a,r_parted[1]/a) )
	if (t[0]>tm && t[0] < t[1] ) tm=t[0]
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
	if (t[0]>tm && t[0] < t[1] ) tm=t[0]

	let ta:Array<number>=[]
	ta.sort();let i=0
	while(ta[i++]<0);


	return ta[i]

}

PQ_equation(p,q):number{
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