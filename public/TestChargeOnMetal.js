import { main } from './GL.js';
import { Tridiagonal } from './enforcePivot.js';
import { setContactVoltages } from './field/setContactVoltage.js';
import { Field } from './fields.js';
const images = [];
const imageM = [];
// taken from test/fields.ts .. Replaced literal voltage digits by capital letters
const contactsAverage = ['BiA']; // check average in center
const contacts2d = ['Bii',
    'iiA']; // should all float up to the one given potential
const Swap = new Field(contacts2d);
const [v, m] = Swap.ShapeToSparseMatrix();
var imageGlM = m.PrintGl();
imageM.push(imageGlM); //main('FieldGl0_field',imageGl) 
m.AugmentMatrix_with_Unity();
Swap.GroupByKnowledge(m); // Optional laast parameter: I don't think I drop columns here. Was all in vector and ShapeToSparse Matrix
m.inverseRectangular(); // in place. Still wonder if I should provide a immutable version
setContactVoltages(Swap, v, [-5, -6, -7 /* something different for the test. Negative because then there is no conflict with the hardwired values */]); // 
const M2 = new Tridiagonal(0); // split does not work in place because it may need space at the seam
M2.row = m.row.map(r => r.split(1, m.row.length)); // this is ugly internal stuff. I guess I need in place before I can get new features.
const potential = M2.MatrixProduct(v); // No charge yet .. so all semiconductor entries are 0 . I sure need to test that before I add carriers ( tube .. before doping )
Swap.pullInSemiconductorVoltage(potential); // opposite of groupByKnowledge
var imageGl = Swap.PrintGl();
images.push(imageGl); //main('FieldGl0_field',imageGl) 
main('metal_charge_matrix', imageM);
main('metal_charge', images);
