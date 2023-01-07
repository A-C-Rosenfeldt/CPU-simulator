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

class liquid_cell{
	n : number //number_of_particles
	v: number[] // velocity
}

class liquid_lattice{
lattice:liquid_cell[][][] // t & 1 , y , x ( row major .. like I have row objects)
t=0
propagate(){ // todo: share interface with elecro static 
	// use n from the old frame(t) I also need to use v at that place. Like verlet velocity. I cannot pull!
	let x=1;y=1
	let a=0; //=this.lattice[this.t][y][x].n*field // acceleration due to electic field
	// acceleration due to pressure gradient . Stagger?
	a+= this.lattice[this.t][y][x+1].n-this.lattice[this.t][y][x-1].n // rem todo a[0]
	a+= this.lattice[this.t][y+1][x].n-this.lattice[this.t][y-1][x].n // rem tood a[1]
	// viscosity
	let strain:number[][]
	strain[0][0]=this.lattice[this.t][y][x+1].v[0]-this.lattice[this.t][y][x-1].v[0]
	// etc
	// ignore rotation
	let symmetric=(strain[1][0]+strain[0][1])/2
	strain[1][0]=strain[0][1]=symmetric
	// ignore change of pressure ( over time due to velocity )
	let divergence=(strain[0][0]+strain[1][1])/2
	strain[0][0]-=divergence
	strain[1][1]-=divergence
	stress=nue*strain
	
	// v+=a 
	// the a from the fluid will be added onto allo parabolas in the electro static field

	let v=this.lattice[this.t][y][x].v
	let n=this.lattice[this.t][y][x].n	
	let r:number[]
	[r_parted,v]=this.Trace(r,v,a) // a from the fluid, r and v from lattice 


	// collision with metal or boundary of the array ( made of metal )
	// Bresenham

	// final destination



	// bilinear interpolation conserves n
	this.lattice[this.t^1][y][r_parted[0][0]].n+=n*v_x_f
	this.lattice[this.t^1][y][x+v_x_i+1].n+=n*(1-v_x_f)

}

Div_Mod(v_x:number):Array<number>{
	// v+=a
	let v_x_i=Math.floor(v_x)
	let v_x_f=v_x-v_x_i
	return [v_x_i,v_x_f]
}

// todo: write lots of test
Trace(r_parts:Array<Array<Number>>,v,a):Array<number>{
	let r=r_parts[1], tm=0
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

 return [r,v]
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