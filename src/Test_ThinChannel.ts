//import import * as validator from "./ZipCodeValidator"; './enforcePivot'
// start quasi-static: I only need to set voltage so I only need the interface End
// But I need a test circuit -- looks like the data model wants routes? ah no does not
// I want a cstr MosFet( gate_count, electrodes:stub[],gates:stub[]  )
import { MosFet, Stub, Button } from './ThinChannel_on_RowOfCapacitors.js'
import { field2Gl, SimpleImage } from './GL.js';
//import 'assert'

let doping = function () {
  let channel_len = 400
  let sweep_resolution = 512
  let v_range = 2
  let GND = new Button("GND", 0)
  let Vcc = new Button("Vcc", 1)
  let gate = new Button("sweep", 0)
  let gate2 = new Button("sweep", 0)
  var mosfet = new MosFet(channel_len, 0, [GND, Vcc, gate,gate2], [], conductivity) // One object with memory to sweep through. Start at natural capacitor state. Threshold voltage goes beyond a simple capacitor. Comes later

  let schar_size = 4
  let lines = new Array<number[]>(schar_size)
  for (let i = 0; i < schar_size; i++)
    lines[i] = new Array<number>(channel_len)

  mosfet.channel.propagate_carrier_n_doping_to_field(mosfet.electrode.map(e => e.Voltage), mosfet.gate.map(g => g.Voltage), lines)

  let c = document.getElementById("doping") as HTMLCanvasElement;
  var ctx = c.getContext("2d")

  for(let schar=0;schar<schar_size;schar++){
    ctx.strokeStyle = ["yellow", "red","green","orange"][schar];
    ctx.beginPath();
    ctx.moveTo(0, 0)

    let w = ctx.canvas.clientWidth
    for (let k = 1; k < channel_len; k++) {
      let x = k * w / channel_len
      let s = ctx.canvas.clientHeight
      ctx.lineTo(x, (lines[schar][k]+0.1) / 2 * s)
    }
    ctx.lineTo(ctx.canvas.clientWidth, 0); ctx.stroke();
  }

  //  electrode: number[], gate: number[], manual_test = false) 
}();

//for(let conductivity=0;conductivity<10;conductivity+=0.5)
var conductivity: number = 0.4, id: number
function animate() {
  let channel_len = 60
  let sweep_resolution = 1512, overflow=0
  let v_range = 2
  let GND = new Button("GND", 0)
  let Vcc = new Button("Vcc", 1)
  let gates = [new Button("sweep", 0), new Button("sweep", 0)  ]
  var mosfet = new MosFet(channel_len, 0, [GND, Vcc, ...gates], [], conductivity) // One object with memory to sweep through. Start at natural capacitor state. Threshold voltage goes beyond a simple capacitor. Comes later

  // Create an ArrayBuffer with a size in bytes
  if ( mosfet.channel.electrode_thicknes != 3 ) console.log("Guardband: "+ mosfet.channel.electrode_thicknes)
    const cm=(channel_len+2*mosfet.channel.electrode_thicknes)
  const buffer = new ArrayBuffer( cm* (sweep_resolution+overflow) * 4); // sweepParameters


  for (let sweep = 0; sweep < sweep_resolution+overflow; sweep++) {

    // start conditions should make it clear where metal and semiconductor are

    //let vgs = 1.2 * (1 - Math.abs((sweep * 2 / (sweep_resolution - 1)) - 1))

    let current_Row = new Uint8Array(buffer, sweep * cm * 4, cm * 4)
    mosfet.channel2bitmapRow(current_Row) //,vgs*v_range/sweep_resolution,-vgs*v_range/sweep_resolution)
    mosfet.solve()  // solve only means one iteration . Iterate has a different meaning in C++  so, hmm Enumartor for an array sounds weird.


    for(let i=0;i<2;i++)
			{ // console.log(mosfet.electrode[i].charge)    extra canvas?
      }

    //gate2.Voltage =gate.Voltage = vgs  // I put it here to check for steady state on first iteration


    let step=sweep*(20)/sweep_resolution   // plateaus with blends (-1)
    let si=Math.floor(step)+3,f=step % 1
    let si1=si+1
    si=si+(si>9 ? 2:0)
    si1=si1+(si1>9 ? 2:0)
    for(let i=0;i<2;i++){
      let voltages=[ si>>(1+i) & 1,si1>>(1+i) & 1]   // I think that in C this is actually undefined behaviour :-(
      gates[1-i].Voltage=  1.1*  (voltages[0]*(1-f)+f*voltages[1])
    }


  }

  let pixel2: Uint8Array = new Uint8Array(buffer)
  let si: SimpleImage = { pixel: pixel2, width: cm, height: sweep_resolution+overflow }

  //console.log("conductivity ", conductivity)
  field2Gl("FieldGl0", si)
  //console.log("conductivity ", conductivity)

  if ((conductivity += 0.3) > 10) { window.clearInterval(id); id = 0 }

}
animate()  // for instant feedback after Ctrl-R in browser
id = window.setInterval(animate, 100)

//var me=new MouseEvent()

document.getElementById("FieldGl0").onclick = me => { conductivity = 0.4; if (id == 0) id = window.setInterval(animate, 200) }