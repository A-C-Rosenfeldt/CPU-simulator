import { Row } from './enforcePivot.js';
import { MapForField, exampleField, FieldToDiagonal, fieldTobeSquared, Field, bandsGapped, arenaVerbatim, Tupel } from './fields.js'
import { field2Gl, SimpleImage } from './GL.js';
//import 'assert'

console.log("in TestFields.ts")
const images :SimpleImage[] =[]


try{
    const diag=new FieldToDiagonal(fieldTobeSquared)
    // reproduce stuff from above
    var imageGl=diag.PrintGl()
    images.push( imageGl) //main('FieldGl0_field',imageGl) 

    // So 4x4 -> 16x16. The diagonal is copied from field left-right, top-bottom. 16x16 would even have fit onto the C16 screen
    let squared=diag.ToDiagonalMatrix()
    var imageGl=squared.PrintGl()
    images.push( imageGl) //main('FieldGl0_mat',imageGl) 

    

    const NoSwap=new Field(bandsGapped)
    // ShapeToSparse Matrix groups by metal ( U=, Charge varies) vs semiconductor ( U varies, charge is moved in that other phase of the cycle )
    // Todo: Unit test for pure semi, pure metal, mixed
    // The algorithm seems to think that with no metal at all there is nothing to compute?
    let vector:Array<number>
    [vector,squared]=NoSwap.ShapeToSparseMatrix()
    var imageGl=squared.PrintGl()
    images.push( imageGl) //main('FieldGl0_NoSwap',imageGl) 


    // Constructor is too fat? Now that I parse already in the base class? ToDo!
    const tri=new Field(fieldTobeSquared);
    // reproduce stuff from above
    [vector,squared]=tri.ShapeToSparseMatrix()
    var imageGl=squared.PrintGl()
    images.push( imageGl) //main('FieldGl0_tri',imageGl) 
    // 20201118: Overflow of one field? Hmm first line has an underflow? Can't really happen, the buffer is flat but had boundaries. Maybe try to only draw one line? Kill the 1st line?
    squared.row[1]=Row.Single(3,5) //new Row(3,0,[[],[5],[]]);
    var imageGl=squared.PrintGl()
    images.push( imageGl) //main('FieldGl0_tri_blank',imageGl) 
    // So 4x4 -> 16x16. The diagonal is copied from field left-right, top-bottom. 16x16 would even have fit onto the C16 screen
    //squared=diag.ToMatrix()

    // test field solver
    // fixed cells. Where is the code and the example data ( with verbatim digits in the field (map)) ?
    // const arena=new Field(arenaVerbatim)
    // // floating, distributed electrodes

    // // distributed electrode with contact to a wire at some potential
    // // How is map format as text? so map{ field, wire } . All relations are names with a single capital letter? And polywires have number
    // // Do I need XML for .. uh it is a netplan. field has number, wire has number + letter. refid.  Letter is extra: "fine location" attribute
    // // It is markup. So I could allow pre-layout: <connectToNext using="0" > with matching connectToPrevious using"A"  
    // // <connectTo refId="453" using="A0"     <!-- connector can be on wire and/or field
    // const h=new Map<string, Tupel>()
    // h.has("A") // multiple cables or points on a cable ( that would just be a layout thing ) can be all have a common contact. Use Linalg to solve wires: We have base voltage with incoming current. Any delta (outgoing "reflected") current leads to delta voltage (Ohm). Kirchoff node role: Sum of all currents needs to be zero
}catch{}
field2Gl('FieldGl0',images)

while(typeof images.pop() !== 'undefined'); // const.clear()

const print=document.getElementById('FieldsCanvas') as (HTMLCanvasElement) ;
var ctx = print.getContext("2d");
ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();
let y=10
try{
    const scala=new MapForField(exampleField)
    var image=scala.Print() // check 2020082401039
    ctx.putImageData( image, 1, y+=6 );

    var imageGl=scala.PrintGl()
    images.push( imageGl) //main('FieldGl0',imageGl) 
    //ctx.putImageData( image, 1, y+=6 );

    // Not yet .. Now we place it next to the inversion showcase
    // const tri=new Field(exampleField);
    // // reproduce stuff from above
    // let [vector,squared]=tri.ShapeToSparseMatrix()
    // var imageGl=squared.PrintGl()
    // images.push( imageGl) //main('FieldGl0_tri',imageGl) 
    // // 20201118: Overflow of one field? Hmm first line has an underflow? Can't really happen, the buffer is flat but had boundaries. Maybe try to only draw one line? Kill the 1st line?

}catch{}
field2Gl('FieldGl',images)