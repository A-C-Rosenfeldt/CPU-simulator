declare var mat4: any;
main();

//the system by which (0, 0) is at the center of the context and each axis extends from -1.0 to 1.0

class AttribNameRange{
  attrib:string
  range:number[]
}

function main() {
  const canvas = document.getElementById("GlCanvas") as HTMLCanvasElement;
  // Initialisierung des GL Kontexts
  const gl = canvas.getContext("webgl");

  // Nur fortfahren, wenn WebGL verfügbar ist und funktioniert
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  // Setze clear color auf schwarz (scrap that: random and foremost unique color), vollständig sichtbar
  gl.clearColor(0.1, 0.0, 0.0, 1.0);
  // Lösche den color buffer mit definierter clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex shader program
    // Would need gl_Position = vec4(rotatedPosition * uScalingFactor, 0.0, 1.0); for Vec2.
    // I think I like the constructor

    // not used right now:     uniform mat4 uProjectionMatrix;
    // uProjectionMatrix *
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;
    varying vec2 vTextureCoord;
    void main() {
      gl_Position = aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

  //    |
  // Information passing here: vTextureCoord
  //    |
  //    V

  // fragment shader ( I would call it Pixel Shader )
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
    // linear algebraic multiply. They require the size of the operands match.
    const fsSource = `
    precision mediump float;
    uniform sampler2D uSampler;
    varying vec2 vTextureCoord;    
    void main(void) {
      gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
    }
    `;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    /*
    const programInfo = {
      program: shaderProgram,
      attribLocations: { // type = number
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
      },
      uniformLocations: { // type = some binary stuff
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
      },
    }; */

    const ranges=[

     {"attrib":gl.getAttribLocation(shaderProgram, 'aVertexPosition'), range:[0,1]} // from source
    ,[-1,1]
  
  ]  // to target

    const boilerplate=initBuffers.bind(gl,shaderProgram) // Readable?
    //const buffers=
    ranges.map(boilerplate)  // sets reference in gl. This is due to OpenGl ( in contrast to Vulcan ) beeing procedual oriented ( not functional )
  

    // Stupid Top-Down organization of this proc
      //const buffers=initBuffers(gl);
      loadTexture(gl); // I think I will define all tiles in code. Only the circuit is loaded as text
      drawScene(gl,shaderProgram) // programInfo) //, buffers)
}

function gp(gl, range:[]){

}

// Vertex Buffers
function initBuffers(gl:WebGL2RenderingContext, shaderProgram:any, screenGl:AttribNameRange) {
  const cross= [].concat.apply(undefined,screenGl.range.map(x=> (screenGl.range.map(y=>[x,y ]))))

  const buffer = gl.createBuffer(); // return value
  // type and binding in one :-(  ) gl.ARRAY_BUFFER=value, gl.ELEMENT_ARRAY_BUFFER=references 
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); // type? . create and set target for next command
  // maybe I can enter here to change buffer data
  gl.bufferData(gl.ARRAY_BUFFER,  // type and target slot
                new Float32Array(cross),               // source
                gl.STATIC_DRAW // a hint that I will not modify this afterwards ( recreate every frame to minimize marshalling)
                );
const bin=gl.getAttribLocation(shaderProgram, screenGl.attrib) // attrib: from buffer

    // as long as I stay in 2d I only and always have 2d vertices

  const numComponents = 2;  // pull out 2 values per iteration
  const type = gl.FLOAT;    // the data in the buffer is 32bit floats
  const normalize = false;  // don't normalize
  const stride = 0;         // how many bytes to get from one set of values to the next   // 0 = use type and numComponents above
  const offset = 0;         // how many bytes inside the buffer to start from

  /* Similarily, if our vertex shader expects e.g. a 4-component attribute with vec4 but in our gl.vertexAttribPointer() call we set the size to 2, then WebGL will set the first two components based on the array buffer, while the third and fourth components are taken from the default value.
    The default value is vec4(0.0, 0.0, 0.0, 1.0)  */

  gl.vertexAttribPointer(
      bin,  // is declared as vec4 in the vertex shader
      numComponents,
      type,
      normalize,
      stride,
      offset);
  gl.enableVertexAttribArray(
      bin);

  return void // it is all in gl  // was buffer
}

function drawScene(gl, program) { //, buffers:Array<any>) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  /*  gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  */
    // Clear the canvas before we start drawing on it.
  
    gl.clear(gl.COLOR_BUFFER_BIT )//| gl.DEPTH_BUFFER_BIT);
 /* 
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
  
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
  
    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    // OpenGl switches from the correct aspect ratio to 1:1 and back.
    // I do not want to have this nonsense in my code, so I stick with the library
    mat4.perspective(projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);
  
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();
  
    // Now move the drawing position a bit to where we want to
    // start drawing the square.
  
    mat4.translate(modelViewMatrix,     // destination matrix
                   modelViewMatrix,     // matrix to translate
                   [-0.0, 0.0, -6.0]);  // amount to translate
  
    const checkMatrix = mat4.create();
    mat4.multiply(checkMatrix,projectionMatrix , modelViewMatrix)
*/

/*
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
      const numComponents = 2;  // pull out 2 values per iteration
      const type = gl.FLOAT;    // the data in the buffer is 32bit floats
      const normalize = false;  // don't normalize
      const stride = 0;         // how many bytes to get from one set of values to the next   // 0 = use type and numComponents above
      const offset = 0;         // how many bytes inside the buffer to start from
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers[1]); // I know this command

      // Similarily, if our vertex shader expects e.g. a 4-component attribute with vec4 but in our gl.vertexAttribPointer() call we set the size to 2, then WebGL will set the first two components based on the array buffer, while the third and fourth components are taken from the default value.
      //  The default value is vec4(0.0, 0.0, 0.0, 1.0)  

      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexPosition,  // is declared as vec4 in the vertex shader
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.vertexPosition);
    }
  

    // tell webgl how to pull out the texture coordinates from buffer
    {
      const num = 2; // every coordinate composed of 2 values
      const type = gl.FLOAT; // the data in the buffer is 32 bit float
      const normalize = false; // don't normalize
      const stride = 0; // how many bytes to get from one set to the next
      const offset = 0; // how many bytes inside the buffer to start from
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]);
      gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);


      gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
       */
    //}

    // Tell WebGL to use our program when drawing
  
    gl.useProgram(program);
  
    // Set the shader uniforms
  /*
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
  */

    {
      const offset = 0;
      const vertexCount = 4;
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
  }

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
    // Create the shader program  
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }
  
    return shaderProgram;
  }
  
  //
  // creates a shader of the given type, uploads the source and
  // compiles it.
  //
  function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); // Send the source to the shader object
    gl.compileShader(shader);    // Compile the shader program
  
    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }






  //
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//

// Texture != vertex buffer
function loadTexture(gl) {
  
    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 16;
    const height = 16;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array(1024);
    pixel[0]=0; //[0, 0, 255, 255];  // opaque blue
    pixel[1]=0;
    pixel[2]=255;
    pixel[3]=255;

    var i:number = 4;
    pixel[i++]=255; //[0, 0, 255, 255];  // opaque blue
    pixel[i++]=0;
    pixel[i++]=0;
    pixel[i++]=255;

    const texture = gl.createTexture();
    gl.enable(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);
  /*
    const image = new Image();
    image.onload = function() {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);
  
      // WebGL1 has different requirements for power of 2 images
      // vs non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
         // Yes, it's a power of 2. Generate mips.
         gl.generateMipmap(gl.TEXTURE_2D);
      } else {
         // No, it's not a power of 2. Turn off mips and set
         // wrapping to clamp to edge
         */
         /*
      }
    };
    image.src = url;
   */
    return texture;
  }
  
  function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }