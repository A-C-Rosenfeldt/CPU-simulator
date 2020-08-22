import 'enforcePivot'



function GausJordan(A:Tridiagonal){
    for(let i=0;i<A.length;i++){
        const r=A
        for(let k=0;k<A.length;k++){
            
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

    let blueComponent = ImageData.data[((50 * (ImageData.width * 4)) + (200 * 4)) + 2];


    var myImageData = ctx.createImageData(width, height);

    ctx.putImageData(myImageData, dx, dy);
}