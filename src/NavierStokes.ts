
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

Print(): ImageData { //ToPicture   print=text vs picture?
    const iD = new ImageData(this.maxStringLenght, this.touchTypedDescription.length)
    // RGBA. This flat data structure resists all functional code
    // ~screen
    for (let pointer = 0; pointer < iD.data.length; pointer += 4) {
      iD.data.set([0, 25, 0, 255], pointer) // ~dark green 
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