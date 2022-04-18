import { main, SimpleImage } from './GL.js';
import { Tridiagonal } from './enforcePivot.js';
import { setContactVoltages } from './field/setContactVoltage.js'
import { Field } from './fields.js';

const images: SimpleImage[] = []
const imageM: SimpleImage[] = []

// taken from test/fields.ts .. Replaced literal voltage digits by capital letters
const contactsAverage: string[] = ['BiA']; // check average in center
const contacts2d: string[] = ['Bss',
	'ssA']; // should all float up to the one given potential


const Swap = new Field(contacts2d)
const [v, m] = Swap.ShapeToSparseMatrix();

var imageGlM = m.PrintGl()
//imageM.push( imageGlM) //main('FieldGl0_field',imageGl) 
m.AugmentMatrix_with_Unity(-1)
Swap.GroupByKnowledge(m) // Optional laast parameter: I don't think I drop columns here. Was all in vector and ShapeToSparse Matrix
imageM.push(m.PrintGl());
m.inverseRectangular() // in place. Still wonder if I should provide a immutable version
//		imageM.push(m.PrintGl());
setContactVoltages(Swap, v, [0, 2, 4])
const M2 = m.split() // uses the -1 from above.  //new Tridiagonal(0) // split does not work in place because it may need space at the seam
// Maybe hide/encapsulate the rows? M2.row = m.row.map(r => r.split(1, m.row.length)) // this is ugly internal stuff. I guess I need in place before I can get new features.
const potential = M2.MatrixProduct(v) // No charge yet .. so all semiconductor entries are 0 . I sure need to test that before I add carriers ( tube .. before doping )
Swap.pullInSemiconductorVoltage(potential) // opposite of groupByKnowledge


var imageGl = Swap.PrintGl()
images.push(imageGl) //main('FieldGl0_field',imageGl) 

main('metal_charge_matrix', imageM)
main('metal_charge', images)