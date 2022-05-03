// Todo: split into production and demo code
import { particle } from "./electronsAsGLPoints.js";
//import {}
import { Field } from './fields.js';
import { field2Gl } from "./GL.js";
import { iterateOverAllEdges, sucks } from "./EmissionFromMetal.js";
var contacts2d = ['BBsss',
    'BBsss',
    'sssss',
    'sssAA',
    'sssAA'];
var swap = new Field(contacts2d);
{
    const strokes = iterateOverAllEdges(swap, sucks);
    // 
    const extent = swap.extend();
    //const vertices = [0, 0, 1, 1]  // flat
    field2Gl("EmissionFromMetal", [swap.PrintGl()]); // field as background
    particle("EmissionFromMetal", strokes, extent); // share transformation matrix for border (make texels size=1)?
}
