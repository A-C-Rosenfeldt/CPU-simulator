// Todo: split into production and demo code
import { particle } from "./electronsAsGLPoints.js";
//import {}
import { Field } from './fields.js';
import { field2Gl } from "./GL.js";
import { iterateOverAllEdges, sucks } from "./EmissionFromMetal.js";
import { setContactVoltages } from "./field/setContactVoltage.js";
var contacts2d = ['BBsss',
    'BBsss',
    'sssss',
    'sssAA',
    'sssAA'];
var swap = new Field(contacts2d);
{
    // 
    //const vertices = [0, 0, 1, 1]  // flat
    { // fill potential. todo: wrap up in a function
        const [v, m] = swap.ShapeToSparseMatrix();
        //imageM.push( m.PrintGl())
        //imageM.push( imageGlM) //main('FieldGl0_field',imageGl) 
        m.AugmentMatrix_with_Unity(-1);
        swap.GroupByKnowledge(m); // Optional laast parameter: I don't think I drop columns here. Was all in vector and ShapeToSparse Matrix
        //imageM.push(m.PrintGl());
        m.inverseRectangular(); // in place. Still wonder if I should provide a immutable version
        //		imageM.push(m.PrintGl());
        setContactVoltages(swap, v, [2, 4]);
        const M2 = m.split(); // uses the -1 from above.  //new Tridiagonal(0) // split does not work in place because it may need space at the seam
        // Maybe hide/encapsulate the rows? M2.row = m.row.map(r => r.split(1, m.row.length)) // this is ugly internal stuff. I guess I need in place before I can get new features.
        const potential = M2.MatrixProduct(v); // No charge yet .. so all semiconductor entries are 0 . I sure need to test that before I add carriers ( tube .. before doping )
        swap.pullInSemiconductorVoltage(potential); // opposite of groupByKnowledge
    }
    field2Gl("EmissionFromMetal", [swap.PrintGl(0)]); // field as background
    const strokes = iterateOverAllEdges(swap, sucks);
    const extent = swap.extend();
    particle("EmissionFromMetal", strokes, extent); // share transformation matrix for border (make texels size=1)?
}
