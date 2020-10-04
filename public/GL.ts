declare var mat4: any;
main();

//the system by which (0, 0) is at the center of the context and each axis extends from -1.0 to 1.0

class AttribNameRange {
  attrib: string
  range: number[]
}

function main() {

  const gl = (document.getElementById("GlCanvas") as HTMLCanvasElement).getContext("webgl");
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }


  var vertices = [
    -0.7,-0.1,//0,
    -0.3,0.6,//0,
    -0.3,-0.3,//0,
    0.2,0.6,//0,
    0.3,-0.3,//0,
    0.7,0.6//,0 
 ]
  
 // Create an empty buffer object
 var vertex_buffer = gl.createBuffer();

 // Bind appropriate array buffer to it
 gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

 // Pass the vertex data to the buffer
 gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

 // Unbind the buffer
 gl.bindBuffer(gl.ARRAY_BUFFER, null);

 /*=================== Shaders ====================*/

 // Vertex shader source code .  Only proven way to expand vec2 to vec4
 var vertCode =
    'attribute vec2 aVertexPosition;' +
    'void main(void) {' +
       ' gl_Position = vec4(aVertexPosition,0, 1.0);' +
    '}';

 // Create a vertex shader object
 var vertShader = gl.createShader(gl.VERTEX_SHADER);

 // Attach vertex shader source code
 gl.shaderSource(vertShader, vertCode);

 // Compile the vertex shader
 gl.compileShader(vertShader);

 // Fragment shader source code
 var fragCode =
    'void main(void) {' +
       'gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);' +
    '}';

 // Create fragment shader object
 var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

 // Attach fragment shader source code
 gl.shaderSource(fragShader, fragCode);

 // Compile the fragmentt shader
 gl.compileShader(fragShader);

 // Create a shader program object to store
 // the combined shader program
 var shaderProgram = gl.createProgram();

 // Attach a vertex shader
 gl.attachShader(shaderProgram, vertShader);

 // Attach a fragment shader
 gl.attachShader(shaderProgram, fragShader);

 // Link both the programs
 gl.linkProgram(shaderProgram);

 // Use the combined shader program object
 gl.useProgram(shaderProgram);

 /*======= Associating shaders to buffer objects ======*/

 // Bind vertex buffer object
 gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

 // Get the attribute location
 var coord = gl.getAttribLocation(shaderProgram, "aVertexPosition");

 // Point an attribute to the currently bound VBO
 gl.vertexAttribPointer(coord, 2 /*3*/, gl.FLOAT, false, 0, 0);

 // Enable the attribute
 gl.enableVertexAttribArray(coord);

 /*============ Drawing the triangle =============*/

 // Clear the canvas
 gl.clearColor(0.5, 0.5, 0.5, 0.9);

 // Enable the depth test
 //gl.enable(gl.DEPTH_TEST);

 // Clear the color and depth buffer
 gl.clear(gl.COLOR_BUFFER_BIT)// | gl.DEPTH_BUFFER_BIT);

 // Set the view port
 gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

 // Draw the triangle
 gl.drawArrays(gl.LINES, 0, 6);














//return


  // gl.clearColor(0.6, 0.0, 0.0, 1.0);   // Set clear color to something unique
  // gl.clear(gl.COLOR_BUFFER_BIT);

  // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // so why this stuff  AND  the vertex shader?

  const ranges = [
    { "attrib":  'aTextureCoord', "range": [0, 0.9] }, // from source
      { "attrib":  'aVertexPosition'  , "range":[-0.5, 0.5] }  // to target
  ]

  const shaderProgram2 = gl.createProgram();
  {
    {
      const vertexShader = loadShader(gl, gl.VERTEX_SHADER,
//        vertCode);
        `
  attribute vec2 ` + ranges[0].attrib + `;
  attribute vec4 ` + ranges[1].attrib + `;
  varying vec2 vTextureCoord;
  void main() {
    vTextureCoord = ` + ranges[0].attrib + `;    
    gl_Position = ` + ranges[1].attrib + `;
  }
`);
      gl.attachShader(shaderProgram2, vertexShader);

      const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER,
//        fragCode
         `
  precision mediump float;
  uniform sampler2D uSampler;
  varying vec2 vTextureCoord;    
  void main(void) {
    gl_FragColor = vec4(0.5, 0, 0.5, 1); // return reddish-purple texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  }
  `
  );
      gl.attachShader(shaderProgram2, fragmentShader);
    }
    gl.linkProgram(shaderProgram2);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram2, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

  }

  //gl.useProgram(shaderProgram);
  //gl.drawArrays(gl.TRIANGLE_STRIP, 0 /*offset*/, 4 /* vertexCount*/);


  const boilerplate = initVertexBuffers.bind(gl, shaderProgram2) // Readable?
  
  // this removes all output ToDo
  ranges.map(boilerplate)  // sets reference in gl. This is due to OpenGl ( in contrast to Vulcan ) beeing procedual oriented ( not functional )

  //loadTexture(gl); // I think I will define all tiles in code. Only the circuit is loaded as text // gl.bind seems to work both for inputting new textureData as well as display on screen

  gl.useProgram(shaderProgram2);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0 /*offset*/, 4 /* vertexCount*/);

}

function initVertexBuffers(shaderProgram: any, screenGl: AttribNameRange) {
  let cross:any=screenGl.range.map(x => (screenGl.range.map(y => [x, y])))
  // flat(2) the JS way
  for(let i=0;i<2;i++){
    cross= [].concat.apply([], cross)
  }

//   const dummy= [
//     -0.7,-0.1,//0,
//     -0.3,0.6,//0,
//     -0.3,-0.3,//0,
//     0.2,0.6,//0,
//     0.3,-0.3,//0,
//     0.7,0.6//,0 
//  ]
  
  const gl: WebGL2RenderingContext=this
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); // type? . create and set target for next command
  gl.bufferData(gl.ARRAY_BUFFER,  // type and target slot
    new Float32Array(cross),               // source
    gl.STATIC_DRAW // a hint that I will not modify this afterwards ( recreate every frame to minimize marshalling)
  );
  const id = gl.getAttribLocation(shaderProgram, screenGl.attrib) // attrib: from buffer
  gl.vertexAttribPointer(
    id,  // is declared as vec4 in the vertex shader
    2, //numComponents, //  Similarily, if our vertex shader expects e.g. a 4-component attribute with vec4 but in our gl.vertexAttribPointer() call we set the size to 2, then WebGL will set the first two components based on the array buffer, while the third and fourth components are taken from the default value. The default value is vec4(0.0, 0.0, 0.0, 1.0)  */
    gl.FLOAT, //type,
    false, //normalize,
    0, //stride,  // 0 = use type and numComponents above
    0 //offset
  );
  gl.enableVertexAttribArray(id);
}

function initShaderProgram(gl) { }

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
  pixel[0] = 0; //[0, 0, 255, 255];  // opaque blue
  pixel[1] = 0;
  pixel[2] = 255;
  pixel[3] = 255;

  var i: number = 4;
  pixel[i++] = 255; //[0, 0, 255, 255];  // opaque blue
  pixel[i++] = 0;
  pixel[i++] = 0;
  pixel[i++] = 255;

  const texture = gl.createTexture();
  // does not make any sense and apparently Browser and a Nvidea drivers think so too:  gl.enable(gl.TEXTURE_2D);
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