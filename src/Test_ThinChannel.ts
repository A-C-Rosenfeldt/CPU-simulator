//import import * as validator from "./ZipCodeValidator"; './enforcePivot'
import { MosFet, Gate } from './ThinChannel_on_RowOfCapacitors.js'
import { field2Gl, SimpleImage } from './GL.js';
//import 'assert'


let channel_len=30
let sweep_resolution=20
let v_range=2

var mosfet=new MosFet(0) // One object with memory to sweep through. Start at natural capacitor state. Threshold voltage goes beyond a simple capacitor. Comes later
{
let g=new Gate()
g.V_G=0
// Or should I actually start from zero voltage and let carriers flow in from source and drain? Zero intinialisation is default in Java and C# (and easy in C++)
mosfet.gate=[g]
}

mosfet.channel.len= channel_len
mosfet.solve()


function PrintGl(): SimpleImage { //ToPicture   print=text vs picture?


// Create an ArrayBuffer with a size in bytes
const buffer = new ArrayBuffer(channel_len*sweep_resolution*4); // sweepParameters
for(let vgs=0;vgs<sweep_resolution;vgs++)
{
	let current_Row=new Uint8Array(buffer, vgs*channel_len*4, channel_len*4)
	mosfet.channel2bitmapRow(current_Row,vgs*v_range/sweep_resolution,-vgs*v_range/sweep_resolution)
}
// plan: 
// start out with cavases .. 
// then pull in the image array from the Matrix code
// polysweep: sync sweep VGS and VDS into Ohm. Then async sweep into pinch off

var allOfIt=new Uint8Array(buffer)

return { pixel: allOfIt, width: mosfet.channel.len, height: sweep_resolution };
}

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