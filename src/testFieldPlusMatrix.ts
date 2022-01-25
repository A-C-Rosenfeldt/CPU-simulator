// we don't want to waste too much space on the page, so I leave out the degenerated cases
// rest is copied from test/field.ts

/*
values used in fields.ts 274  for some shortkeys
bandgaps.get(c) * 30,
0,
c === '-' ? 200 : 0], // charge density. Blue is so weak on my monitor
*/

const contacts2d: string[] = ['4ii', 
                              'ii2']; // should all float up to the one given potential
const contactsSquare: string[] = ['4ii', 'iii', 'ii2']; // // check average in center

const exampleField: string[] = [  // own version for this script. There is another on index.htm
	// connected m  . Connected to wire with impedance=50
	'4444444', // simple boundary condition
	'ssssss4', // contact
	'sssiii',  // we assume homognous electric field between plates (the side walls of the gates)
	'sssi-im', // gate
	'sssiii', // Since the "m" are connected via impedance to the wire, they are just inside the homogenous part
	'sss0000', // self gate = Faraday
	'sssi-im', // self gate
	'sssiiii',
	'2222222']; // simple boundary condition

import { Row } from './enforcePivot.js';
import { MapForField , /*exampleField,*/ FieldToDiagonal, fieldTobeSquared, Field, bandsGapped, arenaVerbatim } from './fields.js';
import { main } from './GL.js';
//import 'assert'
console.log("in TestFieldMatrix.ts");

{
	const NoSwap = new Field(contacts2d)

	
    var imageGl = NoSwap.PrintGl(); // voltage to small to display. 256 ticks
    main('FM_2d', imageGl);

	// static field simulation
	const [v,m] = NoSwap.ShapeToSparseMatrix();		
	const o=m.inverse()
	const potential = o.MatrixProduct(v)
	NoSwap.pullInSemiconductorVoltage(potential)

    var imageGl = NoSwap.PrintGl();
    main('FM_2d_processed', imageGl);
}

{
	const NoSwap = new Field(contactsSquare)
	
    var imageGl = NoSwap.PrintGl(); // voltage to small to display. 256 ticks
    main('FM_Square', imageGl);

	// static field simulation
	const [v,m] = NoSwap.ShapeToSparseMatrix();		
	const o=m.inverse()
	const potential = o.MatrixProduct(v)
	NoSwap.pullInSemiconductorVoltage(potential)
	
    var imageGl = NoSwap.PrintGl();
    main('FM_Square_processed', imageGl);
}

{
	const NoSwap = new Field(exampleField)
	
    var imageGl = NoSwap.PrintGl(); // voltage to small to display. 256 ticks
    main('FM_example', imageGl);

	// static field simulation
	const [v,m] = NoSwap.ShapeToSparseMatrix();		
	const o=m.inverse()
	const potential = o.MatrixProduct(v)
	NoSwap.pullInSemiconductorVoltage(potential)
	
    var imageGl = NoSwap.PrintGl();
    main('FM__example_processed', imageGl);
}

