//import import * as validator from "./ZipCodeValidator"; './enforcePivot'
import { Tridiagonal, Row } from './enforcePivot.js';
import { main } from './GL.js';
//import 'assert'
const print = document.getElementById('MatrixCanvas');
var ctx = print.getContext("2d");
ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();
var gl = print.getContext("3d");
let y = 10;
{
    const scala = new Tridiagonal(1);
    scala.row[0] = Row.Single(0, 4); //new Row(0,0,[[],[4],[]]) // Faktor 20
    const image = scala.print(); // check 2020082401039
    ctx.putImageData(image, 1, y += 6);
    const texture = scala.PrintGl();
    main('MatrixCanvasGl', texture);
}
{
    let size = 4;
    let unit = new Tridiagonal(size);
    for (var i = 0; i < size; i++) {
        unit.row[i] = Row.Single(i, 5); //new Row(i,0,[[],[5],[]])
    }
    let image = unit.print(); // check 2020082401157
    ctx.putImageData(image, 10, y += 6);
    let imageGl = unit.PrintGl();
    main('MatrixCanvasGl0', imageGl);
    unit.row[0].sub(unit.row[1], 1); // 0,0,0 -> 1,1,1 has no gaps in pass1. That is okay
    image = unit.print(); // check 2020082401157
    imageGl = unit.PrintGl();
    main('MatrixCanvasGl1', imageGl);
    // I got mocha.js to run  and   on the demo in web nothing should fail
    let warn = true;
    warn = warn && (unit.getAt(0, 0) === 5);
    warn = warn && (unit.getAt(0, 1) === 5);
    if (warn) {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(1, y, 1, 1); // my test framework
    }
    ctx.putImageData(image, 10, y += 6);
    // }{
    // fails 20201117. Pitch is still 4 ? Global data or leftover from my early design with fixed (4?? very early) tile width.
    size++;
    unit = new Tridiagonal(size);
    for (var i = 0; i < size; i++) {
        unit.row[i] = Row.Single(i, 5); //new Row(i,0,[[],[5],[]])
    }
    imageGl = unit.PrintGl();
    main('MatrixCanvasGl5', imageGl);
    unit.row[2].sub(unit.row[3], 1); // 20201117 this works
    imageGl = unit.PrintGl(); // 20201117 so here must be a bug. Solved. Was a const=4 in prototype
    main('MatrixCanvasGl15', imageGl);
}
//# sourceMappingURL=TestenforcePivot.js.map