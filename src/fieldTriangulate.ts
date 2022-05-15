import { Field, Metal, Tupel } from './fields.js';

// todo: semiconductor apply force   .. solve ode as parabola .. collision
function getGradient( position: number[], field:Field ):number[]{
	const fixedPoint=position.map(ordinate => {
		const bracket= [ Math.floor(ordinate), Math.ceil(ordinate)]
		const fraction = ordinate-bracket[0]
		return [bracket,[fraction,1-fraction]]
	})

	const center=(field.fieldInVarFloats[fixedPoint[0][0][0]][fixedPoint[1][0][0]].Potential
	 + field.fieldInVarFloats[fixedPoint[0][0][0]][fixedPoint[1][0][0]].Potential ) / 4; // todo: other direction

	var selector=0
	for(var i=0;i<1;i++){
		if (fixedPoint[0][1][0] < fixedPoint[1][1][i]){selector|=1}
		selector<<=1
	}

	// mapping needed?. Or do in loop above?

	const points=[fixedPoint[0][0]  /* three points, but gradient only uses on ordinate  */ ]

	return [1,2]
}

/*
use gradient to rotate points of triange to get an upright parabola.
Polynom, pq equation, check for collision along the path of const velocity
*/
function parabola(){

}