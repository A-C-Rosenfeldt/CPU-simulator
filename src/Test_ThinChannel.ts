//import import * as validator from "./ZipCodeValidator"; './enforcePivot'
// start quasi-static: I only need to set voltage so I only need the interface End
// But I need a test circuit -- looks like the data model wants routes? ah no does not
// I want a cstr MosFet( gate_count, electrodes:stub[],gates:stub[]  )
import { MosFet, Stub,Button } from './ThinChannel_on_RowOfCapacitors.js'
import { field2Gl, SimpleImage } from './GL.js';
//import 'assert'

function doping(){
  let channel_len=40
let sweep_resolution=512
let v_range=2
let GND=new Button("GND",0)
let Vcc=new Button("Vcc",1)
let gate=new Button("sweep",0)
var mosfet=new MosFet(channel_len,0,[GND,Vcc,gate],[],conductivity) // One object with memory to sweep through. Start at natural capacitor state. Threshold voltage goes beyond a simple capacitor. Comes later


mosfet.channel.propagate_carrier_n_doping_to_field(this.electrode.map(e => e.Voltage), this.gate.map(g => g.Voltage))

//  electrode: number[], gate: number[], manual_test = false) 
}
doping() // todo  anonym function

//for(let conductivity=0;conductivity<10;conductivity+=0.5)
var conductivity:number=0.1, id:number
function animate()
{
let channel_len=40
let sweep_resolution=512
let v_range=2
let GND=new Button("GND",0)
let Vcc=new Button("Vcc",1)
let gate=new Button("sweep",0)
var mosfet=new MosFet(channel_len,0,[GND,Vcc,gate],[],conductivity) // One object with memory to sweep through. Start at natural capacitor state. Threshold voltage goes beyond a simple capacitor. Comes later

// Create an ArrayBuffer with a size in bytes
const buffer = new ArrayBuffer(channel_len*sweep_resolution*4); // sweepParameters


for(let sweep=0;sweep < sweep_resolution;sweep++)
{

  let vgs=1.7*(1-Math.abs((sweep*2/(sweep_resolution-1))-1))

	let current_Row=new Uint8Array(buffer, sweep*channel_len*4, channel_len*4)
	mosfet.channel2bitmapRow(current_Row) //,vgs*v_range/sweep_resolution,-vgs*v_range/sweep_resolution)
  mosfet.solve()  // solve only means one iteration . Iterate has a different meaning in C++  so, hmm Enumartor for an array sounds weird.

  gate.Voltage=vgs  // I put it here to check for steady state on first iteration
}

let pixel2:Uint8Array = new Uint8Array(buffer ) 
let si:SimpleImage = { pixel: pixel2, width: channel_len, height: sweep_resolution }

//console.log("conductivity ", conductivity)
field2Gl("FieldGl0",si)
//console.log("conductivity ", conductivity)

if ((conductivity+=0.3)>8 ) {window.clearInterval(id);id=0}

}
animate()  // for instant feedback after Ctrl-R in browser
id=window.setInterval(animate,100)

//var me=new MouseEvent()

document.getElementById("FieldGl0").onclick=me=>{conductivity=0.1;if (id==0) id=window.setInterval(animate,200) }