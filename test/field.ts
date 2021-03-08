import { Row } from '../public/enforcePivot.js';
import { StaticField, exampleField, FieldToDiagonal, fieldTobeSquared, Field, bandsGapped } from '../public/fields.js'
import { main } from '../public/GL.js';

const tri=new Field(fieldTobeSquared)  // from TestFields.ts 

// from simple to complex
// needs a wire? Default = 0 to decouple
const degneratedScalar:string[]=['m'];
const degneratedVector:string[]=['mm'];
const degneratedMatrix:string[]=['mm','mm'];
// check voltage==0 && charge==0

// FinFet has contacts, so try the cases above with contact to anything != GND

const averageVector:string[]=['mim'];
// so now I need wires? But no impedance yet
