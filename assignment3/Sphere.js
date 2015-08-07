"use strict";

var canvas;
var gl;

var near = -10;
var far = 10;
var radius = 6.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var numTimesToSubdivide = 2;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);



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
    theta -= deltaY / 5;
    newRotationMatrix = mult(newRotationMatrix, rotate(theta, [1, 0, 0]));

    rotationMatrix = newRotationMatrix;

    lastMouseX = newX;
    lastMouseY = newY;

    //console.log(rotationMatrix);
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

    var sphere1 = new Sphere(radius, numTimesToSubdivide);

    function render()
    {
        sphere1.render(gl, program);
        window.requestAnimFrame(render);
    }

    render();
};

function Sphere(radius, numTimesToSundivide)
{
    // member variables
    this.pointsArray = [];
    this.index = 0;
    this.radius = radius;

    // private temporaries
    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);

    this.triangle = function triangle(a, b, c) {
        this.pointsArray.push(a);
        this.pointsArray.push(b);
        this.pointsArray.push(c);
        this.index += 3;
    };

    this.divideTriangle = function divideTriangle(a, b, c, count) {
        if ( count > 0 ) {

            var ab = normalize(mix( a, b, 0.5), true);
            var ac = normalize(mix( a, c, 0.5), true);
            var bc = normalize(mix( b, c, 0.5), true);

            this.divideTriangle( a, ab, ac, count - 1 );
            this.divideTriangle( ab, b, bc, count - 1 );
            this.divideTriangle( bc, c, ac, count - 1 );
            this.divideTriangle( ab, bc, ac, count - 1 );
        }
        else { // draw tetrahedron at end of recursion
            this.triangle( a, b, c );
        }
    };

    this.tetrahedron = function tetrahedron(a, b, c, d, n) {
        this.divideTriangle(a, b, c, n);
        this.divideTriangle(d, c, b, n);
        this.divideTriangle(a, d, b, n);
        this.divideTriangle(a, c, d, n);
    };

    //construction
    this.tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    this.vBuffer = null;
    // this.eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
    //                 radius*Math.sin(theta)*Math.sin(phi),
    //                 radius*Math.cos(theta));
    this.eye = vec3(0.0, 0.0, 0.0);


    this.modelViewMatrix = mult(lookAt(this.eye, at, up), rotationMatrix);
    this.projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    this.vBuffer = gl.createBuffer();


    this.render = function(gl, program)
    {
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(this.pointsArray), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation( program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        var modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
        var projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
        var colorLoc = gl.getUniformLocation( program, "color" );


        this.modelViewMatrix = mult(lookAt(this.eye, at, up), rotationMatrix);
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(this.modelViewMatrix) );
        gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(this.projectionMatrix) );

        gl.uniform4f( colorLoc, 1.0, 0.0, 0.0, 1.0 );
        //gl.drawArrays( gl.TRIANGLES, 0, this.index );

        for( var i=0; i< this.index; i+=3)
        {
            gl.uniform4f( colorLoc, 0.0, 0.0, 0.0, 1.0 );
            gl.drawArrays( gl.LINE_LOOP, i, 3 );
        }

        gl.bindBuffer( gl.ARRAY_BUFFER, null);
        gl.disableVertexAttribArray(vPosition);
    };
}
