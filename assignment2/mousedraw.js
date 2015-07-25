var canvas;
var gl;


//var maxNumTriangles = 200;
var maxNumVertices  = 6000;
var index = 0;

var redraw = false;

var lineWidth = 20.0;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

var positions = [];


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    canvas.addEventListener("mousedown", function(event){
        redraw = true;
    });

    canvas.addEventListener("mouseup", function(event){
        redraw = false;
    });
    //canvas.addEventListener("mousedown", function(){
    canvas.addEventListener("mousemove", function(event){

        if(redraw) {
            var vertexId = index % maxNumVertices;
            var prevVertexId = (index == 0) ? 0 : (index - 1) % maxNumVertices;

            var position = vec2(2*(event.clientX - lineWidth/2)/canvas.width-1,
                         2*(canvas.height-(event.clientY - lineWidth/2))/canvas.height-1);

            var prevVertexPos = (index == 0) ? position : positions[prevVertexId];

            var color = vec4(colors[(vertexId)%7]);
            var width =  new Float32Array([lineWidth]);

            function addVertex(id, pos, col, width)
            {
                positions.push( pos);
                gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
                gl.bufferSubData(gl.ARRAY_BUFFER, 8*id, flatten(pos));

                gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                gl.bufferSubData(gl.ARRAY_BUFFER, 16*id, flatten(col));

                gl.bindBuffer(gl.ARRAY_BUFFER, widthBuffer);
                gl.bufferSubData(gl.ARRAY_BUFFER, 4*id, width);
                index++;
            }

            var delta = length(subtract(position, prevVertexPos));

            if (index != 0 && delta < 0.008)
            {
                return;
            }

            if (index == 0 || delta < 0.015 || delta > 1.0)
            {
                addVertex(vertexId, position, color, width);
                return;
            }

            for (var dd = delta; dd > 0.03; dd-= 0.015)
            {
                vertexId = index % maxNumVertices
                addVertex(vertexId, mix(prevVertexPos, position, dd/delta), color, width);
                //console.log(dd);
            }
        }

    } );


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var positionBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var widthBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, widthBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 4*maxNumVertices, gl.STATIC_DRAW );

    var vWidth = gl.getAttribLocation( program, "vWidth" );
    gl.vertexAttribPointer( vWidth, 1, gl.FLOAT, false, 0 ,0 );
    gl.enableVertexAttribArray(vWidth);

    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, Math.min(index, maxNumVertices) );

    window.requestAnimFrame(render);

}
