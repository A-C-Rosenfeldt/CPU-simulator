import { Row } from './enforcePivot.js';
import { MapForField, exampleField, FieldToDiagonal, fieldTobeSquared, Field, bandsGapped, arenaVerbatim } from './fields.js';
import { main } from './GL.js';
//import 'assert'
console.log("in TestFields.ts");
const print = document.getElementById('FieldsCanvas');
var ctx = print.getContext("2d");
ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();
let y = 10;
{
    const scala = new MapForField(exampleField);
    var image = scala.Print(); // check 2020082401039
    ctx.putImageData(image, 1, y += 6);
    var imageGl = scala.PrintGl();
    main('FieldGl0', imageGl);
    //ctx.putImageData( image, 1, y+=6 );
    const diag = new FieldToDiagonal(fieldTobeSquared);
    // reproduce stuff from above
    var imageGl = diag.PrintGl();
    main('FieldGl0_field', imageGl);
    // So 4x4 -> 16x16. The diagonal is copied from field left-right, top-bottom. 16x16 would even have fit onto the C16 screen
    let squared = diag.ToDiagonalMatrix();
    var imageGl = squared.PrintGl();
    main('FieldGl0_mat', imageGl);
    const NoSwap = new Field(bandsGapped);
    // reproduce stuff from above
    squared = NoSwap.ShapeToSparseMatrix();
    var imageGl = squared.PrintGl();
    main('FieldGl0_NoSwap', imageGl);
    // Constructor is too fat? Now that I parse already in the base class? ToDo!
    const tri = new Field(fieldTobeSquared);
    // reproduce stuff from above
    squared = tri.ShapeToSparseMatrix();
    var imageGl = squared.PrintGl();
    main('FieldGl0_tri', imageGl);
    // 20201118: Overflow of one field? Hmm first line has an underflow? Can't really happen, the buffer is flat but had boundaries. Maybe try to only draw one line? Kill the 1st line?
    squared.row[1] = Row.Single(3, 5); //new Row(3,0,[[],[5],[]]);
    var imageGl = squared.PrintGl();
    main('FieldGl0_tri_blank', imageGl);
    // So 4x4 -> 16x16. The diagonal is copied from field left-right, top-bottom. 16x16 would even have fit onto the C16 screen
    //squared=diag.ToMatrix()
    // test field solver
    // fixed cells. Where is the code and the example data ( with verbatim digits in the field (map)) ?
    const arena = new Field(arenaVerbatim);
    // floating, distributed electrodes
    // distributed electrode with contact to a wire at some potential
    // How is map format as text? so map{ field, wire } . All relations are names with a single capital letter? And polywires have number
    // Do I need XML for .. uh it is a netplan. field has number, wire has number + letter. refid.  Letter is extra: "fine location" attribute
    // It is markup. So I could allow pre-layout: <connectToNext using="0" > with matching connectToPrevious using"A"  
    // <connectTo refId="453" using="A0"     <!-- connector can be on wire and/or field
    const h = new Map();
    h.has("A"); // multiple cables or points on a cable ( that would just be a layout thing ) can be all have a common contact. Use Linalg to solve wires: We have base voltage with incoming current. Any delta (outgoing "reflected") current leads to delta voltage (Ohm). Kirchoff node role: Sum of all currents needs to be zero
}
//# sourceMappingURL=TestFields.js.map