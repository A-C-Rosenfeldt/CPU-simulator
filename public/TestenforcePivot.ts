//import import * as validator from "./ZipCodeValidator"; './enforcePivot'
import { Tridiagonal, Row } from './enforcePivot.js'


const print=document.getElementById('MatrixCanvas') as (HTMLCanvasElement) ;
var ctx = print.getContext("2d");
ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();

let y=10

{
const scala=new Tridiagonal(1)
scala.row[0]=new Row(0,0,[[],[4],[]]) // Faktor 20
var image=scala.print() // check 2020082401039
ctx.putImageData( image, 1, y+=4 ); 
}

{
let size=4
const unit=new Tridiagonal(size)
for(var i=0;i<size;i++){
    unit.row[i]=new Row(i,0,[[],[5],[]])
}
image=unit.print() // check 2020082401157
ctx.putImageData( image, 1, y+=4 ); 
     unit.row[0].sub(unit.row[1],1)
     image=unit.print() // check 2020082401157
     ctx.putImageData( image, 1, y+=4 ); 
}