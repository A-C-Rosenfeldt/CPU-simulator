//import import * as validator from "./ZipCodeValidator"; './enforcePivot'
import { MosFet } from './ThinChannel_on_RowOfCapacitors.js'
import { field2Gl, SimpleImage } from './GL.js';
//import 'assert'

// The browser ( or OS or video driver ) limit the number of WebGl Canvase. If that is solved, I may show this bare bones approach again
// 2d canvas was nasty and later I need crossing wires!!
// const print=document.getElementById('MatrixCanvas') as (HTMLCanvasElement) ;
// var ctx = print.getContext("2d");
// ctx.moveTo(0, 0);
// ctx.lineTo(200, 100);
// ctx.stroke();
// var gl = print.getContext("3d");

let y=10
const images :SimpleImage[] =[]
//try{
    const scala=new MosFet(1)
    scala.row[0]=Row.Single(0,4) //new Row(0,0,[[],[4],[]]) // Faktor 20
    // const image=scala.print() // check 2020082401039
    // ctx.putImageData( image, 1, y+=6 );

    const texture=scala.PrintGl()
    images.push(texture) // main('MatrixCanvasGl',texture)

    let size=5
    let unit=new Tridiagonal(size)
    for(var i=0;i<size;i++){
        unit.row[i]=Row.Single(i,5) //new Row(i,0,[[],[5],[]])
    }

    // bare bones
    // let image=unit.print() // check 2020082401157
    // ctx.putImageData( image, 10, y+=6 ); 

    let imageGl=unit.PrintGl()
    images.push( imageGl) // main('MatrixCanvasGl0',imageGl) 

    unit.row[0].sub(unit.row[1],1)  // 0,0,0 -> 1,1,1 has no gaps in pass1. That is okay
    //image=unit.print() // check 2020082401157
    imageGl=unit.PrintGl()
    images.push( imageGl) //main('MatrixCanvasGl1',imageGl) 

    // // I got mocha.js to run  and   on the demo in web nothing should fail
    // let warn=true;
    // warn = warn && (unit.getAt(0,0)===5);
    // warn = warn && (unit.getAt(0,1)===5);
    // if (warn){
    //     ctx.fillStyle='#FFF'
    //     ctx.fillRect( 1, y,1,1 ); // my test framework
    // }
    // ctx.putImageData( image, 10, y+=6 ); 

    // fails 20201117. Pitch is still 4 ? Global data or leftover from my early design with fixed (4?? very early) tile width.
    size++ // So I upped size to 5 above because I need an even width here for swap. I would really need rectangular and not unit (todo)
    unit=new Tridiagonal(size)
    for(var i=0;i<size;i++){
        unit.row[i]=Row.Single(i,5) //new Row(i,0,[[],[5],[]])
    }


	field2Gl('MatrixCanvasGlSwapMiddle',images)

    // whiteBox manipulation   to detect any effect of Swap{
    unit.row[0].Value=[[4,5,6,7]]
    unit.row[0].KeyValue[1]+=3
    // }

    imageGl=unit.PrintGl()
    images.push( imageGl) //main('MatrixCanvasGl5',imageGl)   

    // sub now uses quite complicated helper classes. Even private classes should be tested. I mean, with fields within classes it is probably difficult to not destroy the tests, but with classes?
    // todo: how to visualize?. log? .. I mean, I've got a lot of automated test .. so
    // const jop=new JoinOperatorIterator([0,3,4,9],[1,4,6,8])
    // const sea=new Seamless()

    // sub itself in action
    unit.row[2].sub(unit.row[3],1) // 20201117 this works. 20210101 not working with join and seamless helper classes
    imageGl=unit.PrintGl(true) // 20201117 so here must be a bug. Solved. Was a const=4 in prototype
    images.push( imageGl) //main('MatrixCanvasGl15',imageGl)
    let dupe1=new SimpleImage()
    Object.assign( dupe1, imageGl ) // shallow copy
    dupe1.pixel=dupe1.span
    dupe1.width++
    images.push( dupe1 )
    
    unit.swapColumns([0]) // size=6 this should swap 0 and 3
    imageGl=unit.PrintGl()
    images.push( imageGl) //main('MatrixCanvasGlSwap',imageGl)

    unit.swapColumns([1]) // size=6 this should swap 0 and 3
    imageGl=unit.PrintGl(true)
    images.push( imageGl) //main('MatrixCanvasGlSwapMiddle',imageGl)
    let dupe=new SimpleImage()
    Object.assign( dupe, imageGl ) // shallow copy
    dupe.pixel=dupe.span
    dupe.width++
    images.push( dupe )
// }catch{
//     console.warn("not all fields could be created")
// }

field2Gl('MatrixCanvasGlSwapMiddle',images)
    

let channel_len=30
let sweep_resolution=20
let v_range=2

var mosfet=new MosFet(1);

mosfet.channel.len= channel_len
mosfet.solve()


function PrintGl(): SimpleImage { //ToPicture   print=text vs picture?


// Create an ArrayBuffer with a size in bytes
const buffer = new ArrayBuffer(channel_len*sweep_resolution*4); // sweepParameters
for(let vgs=0;vgs<sweep_resolution;vgs++)
{
	let current_Row=new Uint8Array(buffer, vgs*channel_len*4, channel_len*4)
	mosfet.channel2bitmapRow(current_Row,vgs*v_range/sweep_resolution)

}

var allOfIt=new Uint8Array(buffer)

return { pixel: allOfIt, width: mosfet.channel.len, height: sweep_resolution };

    const pixel = new Uint8Array(4 * this.maxStringLenght * this.touchTypedDescription.length)





    // RGBA. This flat data structure resists all functional code
    // ~screen
    for (let i = 0; i < pixel.length;) {
      // bluescreen
      pixel[i++] = 0
      pixel[i++] = 0
      pixel[i++] = 0
      pixel[i++] = 32
    }

    this.touchTypedDescription.forEach((str, i) => {
      // JS is strange still. I need index:      for (let c of str) 
      for (let k = 0; k < str.length; k++) {
        const c = str[k]
        const bandgaps = new Map([['i', 2], ['-', 2], ['s', 1], ['m', 0]])  // todo remove dupe
        let p = ((i * this.maxStringLenght) + k) << 2;

        //iD.data.set([
        pixel[p++] = bandgaps.get(c) * 50
        pixel[p++] = 0
        pixel[p++] = c === '-' ? 200 : 0; // charge density. Blue is so weak on my monitor
        pixel[p++] = 255
        //  ((i*this.maxStringLenght)+k)<<2)
        //}
      }

    })
    return { pixel: pixel, width: this.maxStringLenght, height: this.touchTypedDescription.length };
  }