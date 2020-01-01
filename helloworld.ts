//import {MyElement} from "./element"

let message: string = 'Hello World from TypeScript';
console.log(message);

var c = document.getElementById("myCanvas") as (HTMLCanvasElement) ;
var ctx = c.getContext("2d");
ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();


let myContext=ctx
var id = myContext.createImageData(1,1); // only do this once per page
var d  = id.data;                        // only do this once per page
d[0]   = 0;
d[1]   = 0;
d[2]   = 0;
d[3]   = 0;
myContext.putImageData( id, 10, 12 );     