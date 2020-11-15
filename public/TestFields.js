import { StaticField, exampleField, FieldToDiagonal, fieldTobeSquared } from './fields.js';
import { main } from './GL.js';
//import 'assert'
const print = document.getElementById('FieldsCanvas');
var ctx = print.getContext("2d");
ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();
let y = 10;
{
    const scala = new StaticField(exampleField);
    var image = scala.Print(); // check 2020082401039
    ctx.putImageData(image, 1, y += 6);
    var imageGl = scala.PrintGl();
    main('FieldGl0', imageGl);
    //ctx.putImageData( image, 1, y+=6 );
    // 2020-11-06
    const dynamicField = new FieldToDiagonal(fieldTobeSquared);
    // reproduce stuff from above
    var image = dynamicField.Print(); // check 2020082401039
    ctx.putImageData(image, 1, y += 6);
    var imageGl = dynamicField.PrintGl();
    main('FieldGl1', imageGl);
    // So 4x4 -> 16x16. The diagonal is copied from field left-right, top-bottom. 16x16 would even have fit onto the C16 screen
    var squared = dynamicField.ToMatrix();
}
//# sourceMappingURL=TestFields.js.map