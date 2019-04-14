// Main idea borrowed from:
// https://github.com/auduno/clmtrackr/blob/dev/examples/js/face_deformer.js


// 68 face landmark triangles
const VERTICE_MAP = [
  [0, 17, 36],
  [0, 36, 1],
  [1, 36, 41],
  [1, 41, 2],
  [2, 41, 31],
  [2, 31, 3],
  [3, 31, 48],
  [3, 48, 4],
  [4, 48, 5],
  [5, 48, 6],
  [6, 48, 59],
  [6, 59, 7],
  [7, 59, 58],
  [7, 58, 8],
  [8, 58, 57],
  [8, 57, 56],
  [8, 56, 9],
  [9, 56, 55],
  [9, 55, 10],
  [10, 55, 54],
  [10, 54, 11],
  [11, 54, 12],
  [12, 54, 13],
  [13, 54, 35],
  [13, 35, 14],
  [14, 35, 46],
  [14, 46, 15],
  [15, 46, 45],
  [15, 45, 16],
  [16, 45, 26],
  [26, 45, 25],
  [25, 45, 44],
  [25, 44, 24],
  [24, 44, 43],
  [24, 43, 23],
  [23, 43, 42],
  [23, 42, 22],
  [23, 22, 21],
  [23, 21, 20],
  [22, 42, 27],
  [22, 27, 21],
  [21, 27, 39],
  [21, 39, 20],
  [20, 39, 38],
  [20, 38, 19],
  [19, 38, 37],
  [19, 37, 18],
  [18, 37, 36],
  [18, 36, 17],
  [36, 37, 41],
  [37, 41, 40],
  [37, 40, 38],
  [38, 40, 39],
  [39, 40, 29],
  [39, 29, 28],
  [39, 28, 27],
  [40, 41, 31],
  [40, 31, 29],
  [42, 27, 28],
  [42, 28, 29],
  [42, 29, 47],
  [42, 47, 43],
  [43, 47, 44],
  [44, 47, 46],
  [44, 46, 45],
  [46, 35, 47],
  [47, 35, 29],
  [29, 31, 30],
  [29, 35, 30],
  [30, 31, 32],
  [30, 32, 33],
  [30, 33, 34],
  [30, 34, 35],
  [31, 48, 49],
  [31, 49, 50],
  [31, 50, 32],
  [32, 50, 51],
  [32, 51, 33],
  [33, 51, 34],
  [34, 51, 52],
  [34, 52, 35],
  [35, 52, 53],
  [35, 53, 54],
  [48, 59, 60],
  [48, 60, 49],
  [49, 60, 61],
  [49, 61, 50],
  [50, 61, 62],
  [50, 62, 51],
  [51, 62, 52],
  [52, 62, 63],
  [52, 63, 53],
  [53, 63, 64],
  [53, 64, 54],
  [54, 64, 55],
  [55, 64, 65],
  [55, 65, 56],
  [56, 65, 66],
  [56, 66, 57],
  [57, 66, 58],
  [58, 66, 67],
  [58, 67, 59],
  [59, 67, 60],
  [60, 67, 61],
  [61, 67, 66],
  [61, 66, 62],
  [62, 66, 63],
  [63, 66, 65],
  [63, 65, 64]
];

const VERTEX_SHADER_PROGRAM = `
attribute vec2 a_texCoord;
attribute vec2 a_position;

varying vec2 v_texCoord;

uniform vec2 u_resolution;

void main() {
  vec2 zeroToOne = a_position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  v_texCoord = a_texCoord;
}`;

const FRAGMENT_SHADER_PROGRAM = `
precision mediump float;

uniform sampler2D u_image;

varying vec2 v_texCoord;

void main() {
  gl_FragColor = texture2D(u_image, v_texCoord);
}`;



export default class FaceDeformer {
  canvas = document.createElement('canvas');
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  imageDataCanvas: HTMLCanvasElement;


  // Expects cropped face
  constructor(public imageData: ImageData, landmarkPoints: Number[][], width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    const gl = this.canvas.getContext('webgl');
    this.gl = gl;

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    // Create vertices fron landmark points
    const textureVertices: number[] = [];
    VERTICE_MAP.forEach(([i1, i2, i3]) => {
      const [p1, p2, p3] = [
        landmarkPoints[i1],
        landmarkPoints[i2],
        landmarkPoints[i3]
      ];

      textureVertices.push((p1[0] as number) / imageData.width);
      textureVertices.push((p1[1] as number) / imageData.height);
      textureVertices.push((p2[0] as number) / imageData.width);
      textureVertices.push((p2[1] as number) / imageData.height);
      textureVertices.push((p3[0] as number) / imageData.width);
      textureVertices.push((p3[1] as number) / imageData.height);
    });

    const vertexShader = compileShader(gl, VERTEX_SHADER_PROGRAM, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, FRAGMENT_SHADER_PROGRAM, gl.FRAGMENT_SHADER);
    this.program = createProgram(gl, vertexShader, fragmentShader);
    const textureCoordBuffer = gl.createBuffer();

    gl.useProgram(this.program);

    // look up where the vertex data needs to go.
    const textureCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');

    // provide texture coordinates for face vertices (i.e. where we're going to copy face vertices from).
    gl.enableVertexAttribArray(textureCoordLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureVertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Create the texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);

    // Set the resolution for program
    const resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
    gl.uniform2f(resolutionLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }


  deform(targetPoints: number[][]) {
    const gl = this.gl;
    const vertices: number[] = [];

    VERTICE_MAP.forEach(([i1, i2, i3]) => {
      const [p1, p2, p3] = [
        targetPoints[i1],
        targetPoints[i2],
        targetPoints[i3]
      ];

      vertices.push(p1[0]);
      vertices.push(p1[1]);
      vertices.push(p2[0]);
      vertices.push(p2[1]);
      vertices.push(p3[0]);
      vertices.push(p3[1]);
    });

    // Update the position
    const positionLocation = gl.getAttribLocation(this.program, 'a_position');
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, VERTICE_MAP.length * 3);
  }


  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    if (this.imageDataCanvas) {
      const cc = this.imageDataCanvas.getContext('2d');
      cc.clearRect(0, 0, this.imageDataCanvas.width, this.imageDataCanvas.height);
    }
  }


  getImageData(width: number, height: number) {
    if (!this.imageDataCanvas) {
      this.imageDataCanvas = document.createElement('canvas');
    }

    this.imageDataCanvas.width = width;
    this.imageDataCanvas.height = height;
    const cc = this.imageDataCanvas.getContext('2d');
    cc.drawImage(this.canvas, 0, 0);
    return cc.getImageData(0, 0, width, height);
  }


  getPartialImageData(offsetX: number, offsetY: number, width: number, height: number) {
    if (!this.imageDataCanvas) {
      this.imageDataCanvas = document.createElement('canvas');
    }

    this.imageDataCanvas.width = offsetX + width;
    this.imageDataCanvas.height = offsetY + height;
    const cc = this.imageDataCanvas.getContext('2d');
    cc.drawImage(this.canvas, 0, 0);
    return cc.getImageData(offsetX, offsetY, width, height);
  }
}


/**
 * Creates and compiles a shader.
 * Source: https://webglfundamentals.org/webgl/lessons/webgl-boilerplate.html
 *
 * @param {!WebGLRenderingContext} gl The WebGL Context.
 * @param {string} shaderSource The GLSL source code for the shader.
 * @param {number} shaderType The type of shader, VERTEX_SHADER or
 *     FRAGMENT_SHADER.
 * @return {!WebGLShader} The shader.
 */
function compileShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number) {
  // Create the shader object
  var shader = gl.createShader(shaderType);

  // Set the shader source code.
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  // Check if it compiled
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    // Something went wrong during compilation; get the error
    throw "could not compile shader:" + gl.getShaderInfoLog(shader);
  }

  return shader;
}


/**
 * Creates a program from 2 shaders.
 * Source: https://webglfundamentals.org/webgl/lessons/webgl-boilerplate.html
 *
 * @param {!WebGLRenderingContext) gl The WebGL context.
 * @param {!WebGLShader} vertexShader A vertex shader.
 * @param {!WebGLShader} fragmentShader A fragment shader.
 * @return {!WebGLProgram} A program.
 */
function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  // create a program.
  var program = gl.createProgram();

  // attach the shaders.
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // link the program.
  gl.linkProgram(program);

  // Check if it linked.
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    // something went wrong with the link
    throw ("program filed to link:" + gl.getProgramInfoLog(program));
  }

  return program;
};
