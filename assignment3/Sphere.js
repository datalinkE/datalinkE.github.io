"use strict";

function Sphere(radius, numTimesToSubdivide)
{
    // member variables
    this.pointsArray = [];
    this.index = 0;
    this.radius = radius;
    this.position = vec3(0.0, 0.0, 0.0);
    this.color = vec3(0.4, 0.4, 0.8);
    this.colorWf = vec3(0.0, 0.0, 0.0);
    this.wireframe = true;
    this.polygons = false;

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


    this.render = function(gl, program)
    {
        if (!this.vBuffer)
        {
            this.vBuffer = gl.createBuffer();
            gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer);
            gl.bufferData( gl.ARRAY_BUFFER, flatten(this.pointsArray), gl.STATIC_DRAW);
        }
        else
        {
            gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer);
        }

        var vPosition = gl.getAttribLocation( program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        var modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
        var projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
        var colorLoc = gl.getUniformLocation( program, "color" );

        this.modelViewMatrix = mat4(1.0);
        this.modelViewMatrix = mult(scalem(this.radius, this.radius, this.radius), this.modelViewMatrix);
        this.modelViewMatrix = mult(translate(this.position[0], this.position[1], this.position[2]), this.modelViewMatrix);
        this.modelViewMatrix = mult(rotationMatrix, this.modelViewMatrix);
        this.modelViewMatrix = mult(viewMatrix, this.modelViewMatrix);
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(this.modelViewMatrix) );
        gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

        if (this.polygons)
        {
            gl.uniform4f( colorLoc, this.color[0], this.color[1], this.color[2], 1.0 );
            gl.drawArrays( gl.TRIANGLES, 0, this.index );
        }

        if (this.wireframe)
        {
            gl.uniform4f( colorLoc, this.colorWf[0], this.colorWf[1], this.colorWf[2], 1.0  );
            for( var i=0; i< this.index; i+=3)
            {
                gl.drawArrays( gl.LINE_LOOP, i, 3 );
            }
        }

        gl.bindBuffer( gl.ARRAY_BUFFER, null);
        gl.disableVertexAttribArray(vPosition);
    };
}
