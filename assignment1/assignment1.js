"use strict";

var canvas;
var gl;

var shaderProgram;
var verticesBufferId;

var points = [];

var NumTimesToSubdivide = 5;

var rotation = 3.14;
var color = vec4(1.0, 1.0, 1.0, 1.0)

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    // centered at 0,0
    var vertices = [
        vec2(    0,  1 ),
        vec2( -Math.sqrt(3)/2, -1/2 ),
        vec2( Math.sqrt(3)/2, -1/2 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.3, 0.3, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    shaderProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
    verticesBufferId = gl.createBuffer();


    render();
};

function triangle( a, b, c )
{
    points.push( a, b, c, a, b, c );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        divideTriangle( ab, bc, ac, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.useProgram( shaderProgram );

    gl.uniform1f( gl.getUniformLocation(shaderProgram, "uRotation"), rotation );
    gl.uniform4fv( gl.getUniformLocation(shaderProgram, "uColor"), flatten(color));

    // Load the data into the GPU
    gl.bindBuffer( gl.ARRAY_BUFFER, verticesBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( shaderProgram, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.drawArrays( gl.LINES, 0, points.length );
}
