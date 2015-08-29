"use strict";

var canvas;
var gl;

var shaderProgram;
var verticesBufferId;

var points = [];

var numTimesToSubdivide = 5;

var rotation = 3.14;
var color = vec4(1.0, 1.0, 1.0, 1.0)

var twistRate = 1;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.3, 0.3, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    shaderProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
    verticesBufferId = gl.createBuffer();

    var timesSlider = document.getElementById("timesSlider");
    numTimesToSubdivide = parseInt(timesSlider.value);
    timesSlider.onchange = function() {
        var sliderValue = parseInt(this.value);
        numTimesToSubdivide = sliderValue;
        render();
    }

    var rotationSlider = document.getElementById("rotationSlider");
    rotation = parseFloat(rotationSlider.value);
    rotationSlider.onchange = function() {
        var sliderValue = parseFloat(this.value);
        rotation = sliderValue;
        render();
    }
    
    var twistSlider = document.getElementById("twistSlider");
    twistRate = parseFloat(twistSlider.value);
    twistSlider.onchange = function() {
        var sliderValue = parseFloat(this.value);
        twistRate = sliderValue;
        render();
    }

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
    points = [];

    // First, initialize the corners of our gasket with three points.
    // centered at 0,0
    var vertices = [
        vec2(    0,  1 ),
        vec2( -Math.sqrt(3)/2, -1/2 ),
        vec2( Math.sqrt(3)/2, -1/2 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
                    numTimesToSubdivide);


    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.useProgram( shaderProgram );

    gl.uniform1f( gl.getUniformLocation(shaderProgram, "uRotation"), rotation );
    gl.uniform1f( gl.getUniformLocation(shaderProgram, "uTwist"), twistRate );
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
