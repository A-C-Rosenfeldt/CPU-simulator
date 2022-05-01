// Todo: split into production and demo code
import { particle } from "./electronsAsGLPoints.js";
//import {}
import { Field } from './fields.js';
var contacts2d = ['BBsss',
    'BBsss',
    'sssss',
    'sssAA',
    'sssAA'];
var Swap = new Field(contacts2d);
var imageGl = Swap.PrintGl(); // 
particle("EmissionFromMetal");
