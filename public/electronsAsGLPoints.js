//import { SqueezeA } from "./fields.js";
export function particle(canvasId, strokes, extent) {
    if (!Array.isArray(strokes))
        console.warn("strokes need to be an array");
    if (strokes.length < 1)
        console.warn("why send 0 strokes?");
    if (!Array.isArray(strokes[0]))
        console.warn("storke needs to be array of array");
    if (strokes[0].length == 0)
        console.warn("why stroke of zero lenght?");
    if (typeof strokes[0][0] !== "number")
        console.warn("needs to be a number");
    const gl = document.getElementById(canvasId).getContext("webgl");
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); // type? . create and set target for next command
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    {
        var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, 'void main(void) {' +
            ' gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);' +
            '}');
        gl.compileShader(fragShader);
        gl.shaderSource(vertShader, 'attribute vec4 coordinates;' +
            'uniform mat4 SqueezeMatrix;' +
            'void main(void) {' +
            ' gl_Position = SqueezeMatrix * coordinates ;' +
            '}');
        gl.compileShader(vertShader);
        if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
            alert('Unable to compile shader : ' + gl.getShaderInfoLog(vertShader));
            return null;
        }
        gl.lineWidth(1);
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertShader);
        gl.attachShader(shaderProgram, fragShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to link the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }
        var coord = gl.getAttribLocation(shaderProgram, "coordinates");
        // Point an attribute to the currently bound VBO
        gl.vertexAttribPointer(coord, 3 /*size */, gl.FLOAT, false /*normalized*/, 0 /*stride*/, 0 /*offset*/);
        gl.enableVertexAttribArray(coord);
        {
            const squeeze = new Float32Array(16);
            squeeze.fill(0);
            for (var i = 15; i > 0; i -= 5)
                squeeze[i] = 1;
            squeeze[0] = 1 / extent[0]; // ugly  // todo: put just back in: //(data.length * (itemWidth+1) -1)  // gaps are 10%
            squeeze[5] = -1 / extent[1]; // see next line. Todo: Use Matrix multiplication to keep this in a single place. Or even better: Scale texture objects to the size of their texture. Share the gl context!
            //squeeze[5] = -squeeze[5]   // to make source code and graphics match:  top to bottom .  Maybe I need a production version which loads from file .. I mean if nobody debugs the code then there is no problem
            // linking needs to happen before? strange language
            // use program also needs to be before
            gl.useProgram(shaderProgram);
            gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'SqueezeMatrix'), // we loaded the shader script. Does gl instert a pointer from there to our matrix?
            false, squeeze); //projectionMatrix);
        }
        strokes.forEach(stroke => {
            gl.bufferData(gl.ARRAY_BUFFER, // type and target slot
            new Float32Array(stroke), // source
            gl.STATIC_DRAW // a hint that I will not modify this afterwards ( recreate every frame to minimize marshalling)
            );
            gl.drawArrays(gl.LINE_STRIP, 0 /*first*/, 2 /*count*/); // to not confuse tracks
        });
    }
    {
        var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, 'void main(void) {' +
            ' gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);' + // the difference 0/2
            '}');
        gl.compileShader(fragShader);
        gl.shaderSource(vertShader, 'attribute vec4 coordinates;' +
            'uniform mat4 SqueezeMatrix;' +
            'void main(void) {' +
            ' gl_Position = SqueezeMatrix * coordinates ;' +
            '}');
        gl.compileShader(vertShader);
        if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
            alert('Unable to compile shader : ' + gl.getShaderInfoLog(vertShader));
            return null;
        }
        gl.lineWidth(1);
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertShader);
        gl.attachShader(shaderProgram, fragShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }
        gl.useProgram(shaderProgram);
        var coord = gl.getAttribLocation(shaderProgram, "coordinates");
        gl.vertexAttribPointer(coord, 2 /*size */, gl.FLOAT, false /*normalized*/, 0 /*stride*/, 0 /*offset*/); // Point an attribute to the currently bound VBO
        gl.enableVertexAttribArray(coord);
        {
            const mat = gl.getUniformLocation(shaderProgram, 'SqueezeMatrix');
            const squeeze = new Float32Array(16);
            squeeze.fill(0);
            for (var i = 15; i > 0; i -= 5)
                squeeze[i] = 1;
            squeeze[0] = 1 / extent[0]; // ugly  // todo: put just back in: //(data.length * (itemWidth+1) -1)  // gaps are 10%
            squeeze[5] = -1 / extent[1]; // see next line. Todo: Use Matrix multiplication to keep this in a single place. Or even better: Scale texture objects to the size of their texture. Share the gl context!
            //squeeze[5] = -squeeze[5]   // to make source code and graphics match:  top to bottom .  Maybe I need a production version which loads from file .. I mean if nobody debugs the code then there is no problem
            // linking needs to happen before? strange language
            // use program also needs to be before
            gl.uniformMatrix4fv(mat, false, squeeze);
        }
        strokes.forEach(stroke => {
            gl.bufferData(gl.ARRAY_BUFFER, // type and target slot
            new Float32Array(stroke), // source
            gl.STATIC_DRAW // a hint that I will not modify this afterwards ( recreate every frame to minimize marshalling)
            );
            gl.drawArrays(gl.POINTS, 0 /*first. todo: use reduce calls above */, 2 /*count*/); // velocity // difference 1/2
        });
        {
            var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragShader, 'void main(void) {' +
                ' gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);' + // the difference 0/2
                '}');
            gl.compileShader(fragShader);
            //var vertShader = gl.createShader(gl.VERTEX_SHADER);
            // just a coopy. 
            // gl.shaderSource(vertShader, 'attribute vec4 coordinates;' +
            //    'uniform mat4 SqueezeMatrix;' +
            //    'void main(void) {' +
            //    ' gl_Position = SqueezeMatrix * coordinates' +
            //    '}');
            var shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertShader);
            gl.attachShader(shaderProgram, fragShader);
            gl.linkProgram(shaderProgram);
            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
                return null;
            }
            var coord = gl.getAttribLocation(shaderProgram, "coordinates");
            // Point an attribute to the currently bound VBO
            gl.vertexAttribPointer(coord, 2 /*size */, gl.FLOAT, false /*normalized*/, 0 /*stride*/, 0 /*offset*/);
            gl.enableVertexAttribArray(coord);
            strokes.forEach(stroke => {
                gl.bufferData(gl.ARRAY_BUFFER, // type and target slot
                new Float32Array(stroke), // source
                gl.STATIC_DRAW // a hint that I will not modify this afterwards ( recreate every frame to minimize marshalling)
                );
                gl.drawArrays(gl.POINTS, 0 /*first*/, 2 /*count*/); // velocity // difference 1/2
            });
        }
    }
}
