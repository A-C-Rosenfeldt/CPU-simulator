//import {}
import { Field, Metal } from './fields.js';
//import { field2Gl, Squeeze } from "./GL.js";
var contacts2d = ['BBsss',
    'BBsss',
    'sssss',
    'sssAA',
    'sssAA'];
var swap = new Field(contacts2d);
// avoid to capture uncontrolled. Testable
export function sucks(a, strokes, topLeft, direction = { vertical: false }) {
    const stroke = [];
    //(a.BandGap<threeQuarterConductor) !== (b.BandGap<threeQuarterConductor) && // inteface
    //for(
    var i = 0; //;i<=1;i++)
    do { // binary
        if ((a[i].BandGap < 3 /*threeQuarterConductor todo:inject*/) !== (a[i ^ 1] instanceof Metal) && // inteface  // // FieldToDiagonal{ ConstTextToVarFloats(){Map([['i', 2] ['s', 1]}  ; literalVoltageBoost=2 }
            (a[i].Potential > a[i ^ 1].Potential) //=== (a.BandGap<threeQuarterConductor)  // voltage sucks
        ) {
            // create seeds, we need two parameters. the i and
            // both directions should appear the same. Later: Anisotropie?
            for (var k = 0; k < 8; k++) { // define number of emitters per edge in one place
                var emission = topLeft.slice();
                emission[direction.vertical ? 1 : 0] += k / 8;
                stroke.push(...emission); // flat
                emission[direction.vertical ? 0 : 1] += i / 3;
                stroke.push(...emission);
                // vertices.push(ri+(direction.vertical?(k/8 /* float cannot shift */ ):0),ci+(direction.vertical?0:k/8))
                // vertices.push(ri+(direction.vertical?(k/8 /* float cannot shift */ ):0),ci+(direction.vertical?0:k/8))
            }
            return strokes.push(stroke); // structured .. Todo: switch to indices into one large buffer
        }
        i = i ^ 1;
    } while (i == 1);
    return; // try to avoid: null
}
// this was naked code, but I need to test ( half TDD, written some, but does not show on screen yet ) 2022-05-03
export function iterateOverAllEdges(swap, perEdge) {
    const strokes = []; //new Array<number[]>()
    var previousRow = null, previousCell = null;
    swap.fieldInVarFloats.map((row, ri) => {
        if (previousRow != null)
            row.map((cell, ci) => {
                const threeQuarterConductor = 3;
                //const interFace = (a,b)=>   // todo:check field
                if (previousCell != null) {
                    //strokes.push( 
                    perEdge([cell, previousCell], strokes, [ri, ci], { vertical: true });
                    // seed is in suck
                }
                if (previousRow != null) {
                    const vCell = previousRow[ci];
                    if (typeof vCell === "object") { // avoid to mention the base of arrays. I guess, "first" and "last" is more of standard than 0 and 1 . Then again 0 and 1 is THE computer standard. I don't get it.
                        perEdge([cell, vCell], strokes, [ri, ci]);
                        // seed in suck
                    }
                }
                previousCell = cell;
            });
        previousCell = null;
        previousRow = row;
    });
    return strokes;
}
const signatu = sucks;
// Swap.fieldInVarFloats.map( row=> row.reduce( (previous,cell) => {
// },null) )
