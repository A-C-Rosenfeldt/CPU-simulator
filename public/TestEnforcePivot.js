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
    let size = 5;
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
    size++; // So I upped size to 5 above because I need an even width here for swap. I would really need rectangular and not unit (todo)
    unit = new Tridiagonal(size);
    for (var i = 0; i < size; i++) {
        unit.row[i] = Row.Single(i, 5); //new Row(i,0,[[],[5],[]])
    }
    // whiteBox manipulation   to detect any effect of Swap{
    unit.row[0].data = [[4, 5, 6, 7]];
    unit.row[0].starts[1] += 3;
    // }
    imageGl = unit.PrintGl();
    main('MatrixCanvasGl5', imageGl);
    // sub now uses quite complicated helper classes. Even private classes should be tested. I mean, with fields within classes it is probably difficult to not destroy the tests, but with classes?
    // todo: how to visualize?. log? .. I mean, I've got a lot of automated test .. so
    // const jop=new JoinOperatorIterator([0,3,4,9],[1,4,6,8])
    // const sea=new Seamless()
    // sub itself in action
    unit.row[2].sub(unit.row[3], 1); // 20201117 this works. 20210101 not working with join and seamless helper classes
    imageGl = unit.PrintGl(); // 20201117 so here must be a bug. Solved. Was a const=4 in prototype
    main('MatrixCanvasGl15', imageGl);
    unit.swapColumns([0]); // size=6 this should swap 0 and 3
    imageGl = unit.PrintGl();
    main('MatrixCanvasGlSwap', imageGl);
    unit.swapColumns([1]); // size=6 this should swap 0 and 3
    imageGl = unit.PrintGl();
    main('MatrixCanvasGlSwapMiddle', imageGl);
}
//# sourceMappingURL=TestenforcePivot.js.map