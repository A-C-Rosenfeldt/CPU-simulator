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

  gl.clearColor(0.1, 0.0, 0.0, 1.0);   // Set clear color to something unique
  gl.clear(gl.COLOR_BUFFER_BIT);

  const shaderProgram = gl.createProgram();
  {
    {
      const vertexShader = loadShader(gl, gl.VERTEX_SHADER, `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;
  varying vec2 vTextureCoord;
  void main() {
    gl_Position = aVertexPosition;
    vTextureCoord = aTextureCoord;
  }
`);
      gl.attachShader(shaderProgram, vertexShader);

      const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, `
  precision mediump float;
  uniform sampler2D uSampler;
  varying vec2 vTextureCoord;    
  void main(void) {
    gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  }
  `);
      gl.attachShader(shaderProgram, fragmentShader);
    }
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

  }
  const ranges = [
    { "attrib": gl.getAttribLocation(shaderProgram, 'aVertexPosition'), "range": [0, 1] }, // from source
    { "attrib": gl.getAttribLocation(shaderProgram, 'aTextureCoord'  ), "range":[-1, 1] }  // to target
  ]
  const boilerplate = initVertexBuffers.bind(gl, shaderProgram) // Readable?
  ranges.map(boilerplate)  // sets reference in gl. This is due to OpenGl ( in contrast to Vulcan ) beeing procedual oriented ( not functional )

  gl.activeTexture(gl.TEXTURE0); // Tell WebGL we want to affect texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, loadTexture(gl)); // I think I will define all tiles in code. Only the circuit is loaded as text
  gl.uniform1i(gl.getUniformLocation(shaderProgram, 'uSampler'), 0);    // Tell the shader we bound the texture to texture unit 0

  gl.useProgram(shaderProgram);
  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

function initVertexBuffers(shaderProgram: any, screenGl: AttribNameRange) {
  const cross = [].concat.apply([], screenGl.range.map(x => (screenGl.range.map(y => [x, y]))))
  const gl: WebGL2RenderingContext=this
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); // type? . create and set target for next command
  gl.bufferData(gl.ARRAY_BUFFER,  // type and target slot
    new Float32Array(cross),               // source
    gl.STATIC_DRAW // a hint that I will not modify this afterwards ( recreate every frame to minimize marshalling)
  );
  const bin = gl.getAttribLocation(shaderProgram, screenGl.attrib) // attrib: from buffer
  gl.vertexAttribPointer(
    bin,  // is declared as vec4 in the vertex shader
    2, //numComponents, //  Similarily, if our vertex shader expects e.g. a 4-component attribute with vec4 but in our gl.vertexAttribPointer() call we set the size to 2, then WebGL will set the first two components based on the array buffer, while the third and fourth components are taken from the default value. The default value is vec4(0.0, 0.0, 0.0, 1.0)  */
    gl.FLOAT, //type,
    false, //normalize,
    0, //stride,  // 0 = use type and numComponents above
    0 //offset
  );
  gl.enableVertexAttribArray(bin);
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