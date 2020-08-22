//import import * as validator from "./ZipCodeValidator"; './enforcePivot'
import { Tridiagonal } from './enforcePivot'

const unit=new Tridiagonal(1)
const print=document.getElementById('MatrixCanvas') as (HTMLCanvasElement) ;
var ctx = c.getContext("2d");
ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();

const image=unit.print()

ctx.putImageData( image, 10, 12 ); 