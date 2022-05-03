// we don't want to waste too much space on the page, so I leave out the degenerated cases
// rest is copied from test/field.ts
/*
values used in fields.ts 274  for some shortkeys
bandgaps.get(c) * 30,
0,
c === '-' ? 200 : 0], // charge density. Blue is so weak on my monitor
*/
const contacts2d = ['4ss',
    'ss2']; // should all float up to the one given potential
const contactsSquare = ['4ss', 'sss', 'ss2']; // // check average in center
const exampleField = [
    // connected m  . Connected to wire with impedance=50
    '4444444',
    'ssssss4',
    'sssiii',
    'sssi-i3',
    'sssiii',
    'sss0000',
    'sssi-i3',
    'sssiiii',
    '2222222'
]; // simple boundary condition
import { Snapshot } from './enforcePivot.js';
import { Field } from './fields.js';
import { field2Gl, SimpleImage } from './GL.js';
//import 'assert'
console.log("in TestFieldMatrix.ts");
const images = [];
const imagesProcessed = [];
try {
    {
        const NoSwap = new Field(contacts2d);
        var imageGl = NoSwap.PrintGl(); // voltage to small to display. 256 ticks
        images.push(imageGl); //main('FM_2d', imageGl);
        // static field simulation
        const [v, m] = NoSwap.ShapeToSparseMatrix();
        const o = m.inverse();
        const potential = o.MatrixProduct(v);
        NoSwap.pullInSemiconductorVoltage(potential);
        var imageGl = NoSwap.PrintGl();
        imagesProcessed.push(imageGl); //main('FM_2d_processed', imageGl);
    }
    {
        const NoSwap = new Field(contactsSquare);
        var imageGl = NoSwap.PrintGl(); // voltage to small to display. 256 ticks
        images.push(imageGl); //main('FM_Square', imageGl);
        // static field simulation
        const [v, m] = NoSwap.ShapeToSparseMatrix();
        const o = m.inverse();
        const potential = o.MatrixProduct(v);
        NoSwap.pullInSemiconductorVoltage(potential);
        var imageGl = NoSwap.PrintGl();
        imagesProcessed.push(imageGl); //main('FM_Square_processed', imageGl);
    }
    {
        const NoSwap = new Field(exampleField);
        var imageGl = NoSwap.PrintGl(); // voltage to small to display. 256 ticks
        images.push(imageGl); //main('FM_example', imageGl);
        // static field simulation
        const [v, m] = NoSwap.ShapeToSparseMatrix(); // V contains NaN entries, which makes no sense because V is already tailored to the fields where it is defintively needed
        var matrixGl = m.PrintGl();
        const shots = [1, 2, 3].map(q => {
            const bowl = new Snapshot();
            bowl.rowNumber = Math.floor(q * m.row.length / 4);
            return bowl;
        });
        const o = m.inverse(shots);
        const potential = o.MatrixProduct(v);
        NoSwap.pullInSemiconductorVoltage(potential);
        // shots.forEach(shot=>{
        // 	imagesProcessed.push( shot.image )
        // })
        var imageGl = NoSwap.PrintGl();
        imagesProcessed.push(imageGl); //main('FM__example_processed', imageGl);
        field2Gl('inverse', [o.PrintGl()]
            .concat(shots.map(s => s.image).reverse())
            .concat([matrixGl])
            .concat(shots.map(s => {
            const swapped = new SimpleImage();
            swapped.pixel = s.image.span;
            swapped.width = s.image.width + 1;
            swapped.height = s.image.height;
            return swapped;
        }) //.reverse()
        ));
    }
}
catch (err) {
    console.log(err);
}
field2Gl('FM__example', images);
field2Gl('FM__example_processed', imagesProcessed);
