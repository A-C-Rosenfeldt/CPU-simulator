//import import * as validator from "./ZipCodeValidator"; './enforcePivot'
import { Tridiagonal, Row } from './enforcePivot.js'
import { main } from './GL.js';
//import 'assert'

const print=document.getElementById('MatrixCanvas') as (HTMLCanvasElement) ;
var ctx = print.getContext("2d");
ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();
var gl = print.getContext("3d");

let y=10

{
    const scala=new Tridiagonal(1)
    scala.row[0]=new Row(0,0,[[],[4],[]]) // Faktor 20
    const image=scala.print() // check 2020082401039
    ctx.putImageData( image, 1, y+=6 );

    const texture=scala.printGl()
    main('MatrixCanvasGl')
}

{
let size=4
const unit=new Tridiagonal(size)
for(var i=0;i<size;i++){
    unit.row[i]=new Row(i,0,[[],[5],[]])
}
image=unit.print() // check 2020082401157
ctx.putImageData( image, 10, y+=6 ); 
     unit.row[0].sub(unit.row[1],1)  // 0,0,0 -> 1,1,1 has no gaps in pass1. That is okay
     image=unit.print() // check 2020082401157
     let warn=true;
    warn = warn && (unit.getAt(0,0)===5);
    warn = warn && (unit.getAt(0,1)===5);
     if (warn){
        ctx.fillStyle='#FFF'
        ctx.fillRect( 1, y,1,1 ); // my tes framework
     }
     ctx.putImageData( image, 10, y+=6 ); 
}