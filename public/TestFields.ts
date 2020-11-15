import { StaticField, exampleField, FieldToDiagonal, fieldTobeSquared, Field } from './fields.js'
import { main } from './GL.js';
//import 'assert'

const print=document.getElementById('FieldsCanvas') as (HTMLCanvasElement) ;
var ctx = print.getContext("2d");
ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();

let y=10

{
    const scala=new StaticField(exampleField)
    var image=scala.Print() // check 2020082401039
    ctx.putImageData( image, 1, y+=6 );

    var imageGl=scala.PrintGl()
    main('FieldGl0',imageGl) 
    //ctx.putImageData( image, 1, y+=6 );

    const diag=new FieldToDiagonal(fieldTobeSquared)
    // reproduce stuff from above
    var imageGl=diag.PrintGl()
    main('FieldGl0_field',imageGl) 

    // So 4x4 -> 16x16. The diagonal is copied from field left-right, top-bottom. 16x16 would even have fit onto the C16 screen
    let squared=diag.ToMatrix()
    var imageGl=squared.PrintGl()
    main('FieldGl0_mat',imageGl) 

    // Constructor is too fat? Now that I parse already in the base class? ToDo!
    const tri=new Field(fieldTobeSquared)
    // reproduce stuff from above
    squared=tri.ToMatrix()
    var imageGl=squared.PrintGl()
    main('FieldGl0_tri',imageGl) 

    
    // So 4x4 -> 16x16. The diagonal is copied from field left-right, top-bottom. 16x16 would even have fit onto the C16 screen
    squared=diag.ToMatrix()
}