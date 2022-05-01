export function particle(canvasId, vertices, extent) {
    const gl = document.getElementById(canvasId).getContext("webgl");
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); // type? . create and set target for next command
    gl.bufferData(gl.ARRAY_BUFFER, // type and target slot
    new Float32Array(vertices), // source
    gl.STATIC_DRAW // a hint that I will not modify this afterwards ( recreate every frame to minimize marshalling)
    );
    {
        var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, 'void main(void) {' +
            ' gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);' +
            '}');
        var vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, 'attribute vec2 coordinates;' +
            'uniform mat4 SqueezeMatrix;' +
            'void main(void) {' +
            ' gl_Position = SqueezeMatrix * coordinates' +
            '}');
        gl.lineWidth(1);
        var shaderProgram = gl.createProgram();
        var coord = gl.getAttribLocation(shaderProgram, "coordinates");
        // Point an attribute to the currently bound VBO
        gl.vertexAttribPointer(coord, 3 /*size */, gl.FLOAT, false /*normalized*/, 0 /*stride*/, 0 /*offset*/);
        gl.enableVertexAttribArray(coord);
        {
            const squeeze = new Float32Array(16);
            squeeze.fill(0);
            for (var i = 15; i > 0; i -= 5)
                squeeze[i] = 1;
            squeeze[0] = 1 / extent.width; // ugly  //(data.length * (itemWidth+1) -1)  // gaps are 10%
            squeeze[0] = 1 / extent.height;
            squeeze[5] = -squeeze[5]; // to make source code and graphics match:  top to bottom .  Maybe I need a production version which loads from file .. I mean if nobody debugs the code then there is no problem
            // linking needs to happen before? strange language
            // use program also needs to be before
            gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'SqueezeMatrix'), // we loaded the shader script. Does gl instert a pointer from there to our matrix?
            false, squeeze); //projectionMatrix);
        }
        gl.drawArrays(gl.LINE_STRIP, 0 /*first*/, 3 /*count*/); // to not confuse tracks
    }
    {
        var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, 'void main(void) {' +
            ' gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);' +
            '}');
        var vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, 'attribute vec3 coordinates;' +
            'void main(void) {' +
            ' gl_Position = vec4(coordinates, 1.0);' +
            'gl_PointSize = 3.0;' + // size 1 is default and what I want though. gl.enable(0x8642); ?
            '}');
        var shaderProgram = gl.createProgram();
        var coord = gl.getAttribLocation(shaderProgram, "coordinates");
        // Point an attribute to the currently bound VBO
        gl.vertexAttribPointer(coord, 3 /*size */, gl.FLOAT, false /*normalized*/, 0 /*stride*/, 0 /*offset*/);
        gl.enableVertexAttribArray(coord);
        gl.drawArrays(gl.POINTS, 0 /*first*/, 3 /*count*/); // velocity
    }
}
