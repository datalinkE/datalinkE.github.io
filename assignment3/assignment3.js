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

var side = 512;

var projectionMatrix = null;
//projectionMatrix = ortho(left, right, bottom, ytop, near, far);

var primitivesToRender = [];
var cursorPrimitive = null;
var cursorColorWf = vec3(0.4, 0.4, 0.0);

var fov = 90.0;
var aspect = 1.0;
projectionMatrix = perspective(fov, aspect, 0.1, far);

var eyeOffset = 2.0;
var eye = vec3(0.0, 0.0, eyeOffset);
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

var lastMouseDown = Date.now();

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    //console.log(lastMouseX);
    //console.log(lastMouseY);
    lastMouseDown = Date.now();
}

function handleMouseUp(event) {
    mouseDown = false;

    var elapsedFromLastMouseDown = Date.now() - lastMouseDown;

    //console.log(elapsedFromLastMouseDown);

    if (elapsedFromLastMouseDown < 500)
    {// if press tooks more than half a second we are rotating the camera, not setting object
        primitivesToRender.push(cursorPrimitive);

        var newCursor = new Sphere(0.5, 0);
        newCursor.colorWf = cursorColorWf;
        newCursor.orientation = cursorPrimitive.orientation;

        cursorPrimitive = newCursor;
    }
}

var cursorPosX = 0;
var cursorPosY = 0;

function handleMouseMove(event) {
    var newX = event.clientX;
    var newY = event.clientY;
    var canvasRect = this.getBoundingClientRect();

    if (!mouseDown) {
        cursorPosX = (newX - canvasRect.left - side/2) * 2 / side;
        cursorPosY = (-newY + canvasRect.top + side/2) * 2 / side;
        //console.log(cursorPosX);
        //console.log(cursorPosY);
        return;
    }

    var deltaX = newX - lastMouseX;
    phi += deltaX / 5;
    var newRotationMatrix = rotate(phi, [0, 1, 0]);

    var deltaY = newY - lastMouseY;
    theta += deltaY / 5;
    newRotationMatrix = mult(newRotationMatrix, rotate(theta, [1, 0, 0]));

    rotationMatrix = newRotationMatrix;

    cursorPrimitive.orientation = rotate(-theta, [1, 0, 0]);
    cursorPrimitive.orientation = mult(cursorPrimitive.orientation, rotate(-phi, [0, 1, 0]));

    lastMouseX = newX;
    lastMouseY = newY;
}

var wheelDistance = 0.0;

function handleMouseWheel(event) {
    var delta = event.deltaY > 0 ? 1 : -1;
    wheelDistance += delta / 20;
    console.log(wheelDistance);
}


window.onload = function init() {

    $("#flatColorPicker").spectrum({
        flat: true,
        showInput: true,
        move: function(color) {
            var rgba = color.toRgb();
            cursorColorWf = vec3(rgba.r / 255, rgba.g / 255, rgba.b / 255);
            cursorPrimitive.colorWf = cursorColorWf;
        }
    });

    canvas = document.getElementById( "gl-canvas" );

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    canvas.onmousemove = handleMouseMove;
    canvas.onwheel = handleMouseWheel;

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
    primitivesToRender.push(sphere1);

    cursorPrimitive = new Sphere(0.5, 0);
    cursorPrimitive.colorWf = cursorColorWf;

    function render()
    {
        //console.log("render");
        drawAxis();

        cursorPrimitive.position[0] = cursorPosX * (-wheelDistance + eyeOffset);
        cursorPrimitive.position[1] = cursorPosY * (-wheelDistance + eyeOffset);
        cursorPrimitive.position[2] = wheelDistance;
        cursorPrimitive.render(gl, program);

        var i, length;
        for( i = 0, length = primitivesToRender.length; i < length; i++)
        {
            primitivesToRender[i].render(gl, program);
        };

        window.requestAnimFrame(render);
    }

    render();
};
