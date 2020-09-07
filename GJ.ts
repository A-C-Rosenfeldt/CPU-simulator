import {Tridiagonal} from './public/enforcePivot'



function GausJordan(A:Tridiagonal){
    for(let i=0;i<A.row.length;i++){
        const r=A
        for(let k=0;k<A.row.length;k++){
            
        }    
    }
}

function DrawMatrixToCanvas(A){
    var canvas = document.getElementById('canvas'); // uh, I may want to collect this at least at one place
    let ctx:CanvasRenderingContext2D=(canvas as any).getContext('2d');

    
    /**
width   The width of the image in pixels.
height  The height of the image in pixels.
data    A Uint8ClampedArray representing a one-dimensional array containing the data in the RGBA order, with integer values between 0 and 255 (included).
     */
    // R: negative value
    // B: positive value
    // G: Sparse area

    const iD=new ImageData(42,7) // MDN:  Note that this is the most common way to create such an object in workers as createImageData() is not available there.
    let blueComponent = iD.data[((50 * (iD.width * 4)) + (200 * 4)) + 2];


    var myImageData = ctx.createImageData(iD.width, iD.height);

    ctx.putImageData(myImageData, 42, 7);
}