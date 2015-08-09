var canvas;
var gl;

var near = -5.0;
var far = 5.0;
var theta  = 0.0;
var phi    = 0.0;

var left = -5.0;
var right = 5.0;
var ytop = 5.0;
var bottom = -5.0;

var projectionMatrix = null;
//projectionMatrix = ortho(left, right, bottom, ytop, near, far);

var fov = 90.0;
var aspect = 1.0;
projectionMatrix = perspective(fov, aspect, 0.1, far);

var eye = vec3(0.0, 0.0, 2.0);
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var viewMatrix =  lookAt(eye, at, up);

var axisPoints = [];
axisPoints.push(vec4(0.0, 0.0, 0.0));
axisPoints.push(vec4(1.0, 0.0, 0.0));
axisPoints.push(vec4(0.0, 0.0, 0.0));
axisPoints.push(vec4(0.0, 1.0, 0.0));
axisPoints.push(vec4(0.0, 0.0, 0.0));
axisPoints.push(vec4(0.0, 0.0, 1.0));

var axisBuffer = null;


var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var rotationMatrix = mat4(1.0);

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
        return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - lastMouseX;
    phi += deltaX / 5;
    var newRotationMatrix = rotate(phi, [0, 1, 0]);

    var deltaY = newY - lastMouseY;
    theta += deltaY / 5;
    newRotationMatrix = mult(newRotationMatrix, rotate(theta, [1, 0, 0]));

    rotationMatrix = newRotationMatrix;

    lastMouseX = newX;
    lastMouseY = newY;
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //
    //  Load shaders
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    axisBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, axisBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(axisPoints), gl.STATIC_DRAW);

    function drawAxis()
    {
        gl.bindBuffer( gl.ARRAY_BUFFER, axisBuffer);

        var vPosition = gl.getAttribLocation( program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        var modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
        var projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
        var colorLoc = gl.getUniformLocation( program, "color" );

        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten( mult(viewMatrix, rotationMatrix)) );
        gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

        gl.uniform4f( colorLoc, 1.0, 0.0, 0.0, 1.0 );
        gl.drawArrays( gl.LINES, 0, 2 );

        gl.uniform4f( colorLoc, 0.0, 1.0, 0.0, 1.0 );
        gl.drawArrays( gl.LINES, 2, 2 );

        gl.uniform4f( colorLoc, 0.0, 0.0, 1.0, 1.0 );
        gl.drawArrays( gl.LINES, 4, 2 );

        gl.disableVertexAttribArray(vPosition);
    }

    var sphere1 = new Sphere(0.5, 1);
    sphere1.colorWf = vec3(0.4, 0.0, 0.4);

    var sphere2 = new Sphere(0.5, 0);
    sphere1.colorWf = vec3(0.4, 0.0, 0.4);

    function render()
    {
        drawAxis();
        
        sphere1.render(gl, program);
        sphere2.render(gl, program);

        window.requestAnimFrame(render);
    }

    render();
};
