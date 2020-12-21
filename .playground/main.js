(function() {

  function buildSnowProgram(canvas) {
    const vertex_shader_src = `
      attribute vec2 a_position;
      uniform vec2 u_resolution;

      void main() {
        // convert the position from pixels to 0.0 to 1.0
        // convert from 0->1 to 0->2
        vec2 zero_to_two = (a_position / u_resolution) * 2.0;

        // convert from 0->2 to -1->+1 (clip space)
        vec2 clip_space = zero_to_two - 1.0;

        gl_Position = vec4(clip_space.x, -clip_space.y, 0, 1);
      }
    `;

    const fragment_shader_src = `
      precision mediump float;

      void main() {
        gl_FragColor = vec4(1, 1, 1, 1);
      }
    `;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      return false;
    }

    // setup GLSL program
    const program = buildProgram(gl, vertex_shader_src, fragment_shader_src);
    gl.useProgram(program);
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(program);
  }


  const canvas = document.querySelector('#webgl');
  buildSnowProgram(canvas);


  // setup GLSL program
  const program = buildProgram(gl, vertex_shader_src, fragment_shader_src);
  gl.useProgram(program);

  const TRIANGLES_PER_CIRCLE = 50;
  const CANVAS_WIDTH = canvas.width;
  const CANVAS_HEIGHT = canvas.height;

  const a_position = gl.getAttribLocation(program, 'a_position');
  const u_resolution = gl.getUniformLocation(program, 'u_resolution');
  gl.uniform2f(u_resolution, CANVAS_WIDTH, CANVAS_HEIGHT);

  const positions = [];
  const TOTAL_DRAWN = 10000;
  for (let i = 0; i < TOTAL_DRAWN; i++) {
    const circles = getCircleVertices(CANVAS_WIDTH * Math.random(), CANVAS_HEIGHT * Math.random(), 5 * Math.random());
    // const circles = getCircleVertices(20, 20, 20);
    // console.log(circles);
    positions.push(...circles);
  }

  // Put the circle vertices in the vertex buffer
  const vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);


  {
    const size = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.vertexAttribPointer(
        a_position,
        size,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(a_position);
  }

  {
    const offset = 0;
    gl.drawArrays(gl.TRIANGLES, offset, TRIANGLES_PER_CIRCLE * TOTAL_DRAWN * 3);
  }


  function getCircleVertices(cx, cy, radius) {
    const vertices = [];
    const pi_frac = (2 * Math.PI) / TRIANGLES_PER_CIRCLE;
    for (let i = 0; i < TRIANGLES_PER_CIRCLE; i++) {
      vertices.push(cx, cy);
      vertices.push(
        Math.cos(i * pi_frac) * radius + cx,
        Math.sin(i * pi_frac) * radius + cy);
      vertices.push(
        Math.cos((i + 1) * pi_frac) * radius + cx,
        Math.sin((i + 1) * pi_frac) * radius + cy);
    }

    return vertices;
  }

  function buildProgram(gl, vertex_shader_src, fragment_shader_src) {
    const v_shader = addShader(gl, vertex_shader_src, gl.VERTEX_SHADER);
    const f_shader = addShader(gl, fragment_shader_src, gl.FRAGMENT_SHADER);
    if (!v_shader || !f_shader) {
      return null;
    }

    const program = gl.createProgram();
    gl.attachShader(program, v_shader);
    gl.attachShader(program, f_shader);

    gl.linkProgram(program);
    return program;
  }

  function addShader(gl, shader_source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, shader_source);
    gl.compileShader(shader);

    // Check the compile status
    const did_compile = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!did_compile) {
      const lastError = gl.getShaderInfoLog(shader);
      console.error(`Error compiling shader: ${lastError}`);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }
})();
