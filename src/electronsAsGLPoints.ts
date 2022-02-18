
export function main(canvasId: string) {
   const gl = (document.getElementById(canvasId) as HTMLCanvasElement).getContext("webgl");
   var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
         gl.shaderSource(fragShader,             'void main(void) {' +
               ' gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);' +
            '}')		 

         var vertShader = gl.createShader(gl.VERTEX_SHADER);
         gl.shaderSource(vertShader,             'attribute vec3 coordinates;' +
            'void main(void) {' +
               ' gl_Position = vec4(coordinates, 1.0);' +
               'gl_PointSize = 3.0;'+ // size 1 is default and what I want though. gl.enable(0x8642); ?
            '}');

         const shaderProgram = gl.createProgram();
         var coord = gl.getAttribLocation(shaderProgram, "coordinates");

         // Point an attribute to the currently bound VBO
         gl.vertexAttribPointer(coord, 3 /*size */, gl.FLOAT, false /*normalized*/, 0 /*stride*/, 0/*offset*/);
         gl.enableVertexAttribArray(coord);
         gl.drawArrays(gl.POINTS, 0 /*first*/, 3)/*count*/;
}