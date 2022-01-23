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

const contactsAverageV: string[] = ['4','i','2']; // check average in center




import { Row } from './enforcePivot.js';
import { MapForField, exampleField, FieldToDiagonal, fieldTobeSquared, Field, bandsGapped, arenaVerbatim } from './fields.js';
import { main } from './GL.js';
//import 'assert'
console.log("in TestFieldMatrix.ts");

{
    const scala = new Field(contacts2d);
    var imageGl = scala.PrintGl(); // voltage to small to display. 256 ticks
    main('FM_2d', imageGl);

	// <-here- static field simultion


    var imageGl = scala.PrintGl();
    main('FM_2d_processed', imageGl);
}