import '@testing-library/jest-dom'

// Mock WebGL context for Three.js tests
const mockWebGLContext = {
  canvas: document.createElement('canvas'),
  getExtension: () => null,
  getParameter: () => 0,
  createShader: () => ({}),
  shaderSource: () => {},
  compileShader: () => {},
  getShaderParameter: () => true,
  createProgram: () => ({}),
  attachShader: () => {},
  linkProgram: () => {},
  getProgramParameter: () => true,
  useProgram: () => {},
  createBuffer: () => ({}),
  bindBuffer: () => {},
  bufferData: () => {},
  createTexture: () => ({}),
  bindTexture: () => {},
  texParameteri: () => {},
  texImage2D: () => {},
  viewport: () => {},
  clearColor: () => {},
  clear: () => {},
  enable: () => {},
  disable: () => {},
  depthFunc: () => {},
  blendFunc: () => {},
  getAttribLocation: () => 0,
  getUniformLocation: () => ({}),
  uniform1f: () => {},
  uniform2f: () => {},
  uniform3f: () => {},
  uniform4f: () => {},
  uniformMatrix4fv: () => {},
  vertexAttribPointer: () => {},
  enableVertexAttribArray: () => {},
  drawArrays: () => {},
  drawElements: () => {},
  getShaderInfoLog: () => '',
  getProgramInfoLog: () => '',
  deleteShader: () => {},
  deleteProgram: () => {},
  deleteBuffer: () => {},
  deleteTexture: () => {},
  isContextLost: () => false,
  getContextAttributes: () => ({}),
  pixelStorei: () => {},
  createFramebuffer: () => ({}),
  bindFramebuffer: () => {},
  checkFramebufferStatus: () => 36053,
  framebufferTexture2D: () => {},
  createRenderbuffer: () => ({}),
  bindRenderbuffer: () => {},
  renderbufferStorage: () => {},
  framebufferRenderbuffer: () => {},
}

// Override getContext for WebGL mocking
const originalGetContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function (
  contextId: string,
  options?: unknown
): RenderingContext | null {
  if (
    contextId === 'webgl' ||
    contextId === 'webgl2' ||
    contextId === 'experimental-webgl'
  ) {
    return mockWebGLContext as unknown as WebGLRenderingContext
  }
  return originalGetContext.call(this, contextId, options) as RenderingContext | null
}
