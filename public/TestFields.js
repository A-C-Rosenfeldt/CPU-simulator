import { StaticField, exampleField } from './fields.js';
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
}
//# sourceMappingURL=TestFields.js.map