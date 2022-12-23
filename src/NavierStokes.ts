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


*/

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