"use strict";

function triangle(pointsRef, normalsRef, a, b, c) {
    pointsRef.push(a);
    pointsRef.push(b);
    pointsRef.push(c);

    var t1 = subtract(b, a);
    var t2 = subtract(c, a);
    var normal = normalize(cross(t2, t1));
    normal = vec4(normal);
    normal[3]  = 0.0;

    normalsRef.push(normal);
    normalsRef.push(normal);
    normalsRef.push(normal);
};

function Primitive(size, points, normals)
{
    // member variables
    this.pointsArray  = points;
    this.normalsArray = normals;
    this.size = size;
    this.position = vec3(0.0, 0.0, 0.0);
    this.orientation = mat4(1.0);

    this.color = vec3(0.4, 0.4, 0.8);
    this.colorWf = vec3(0.0, 0.0, 0.0);

    this.wireframe = true;
    this.polygons = false;

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
        this.modelViewMatrix = mult(scalem(this.size, this.size, this.size), this.modelViewMatrix);
        this.modelViewMatrix = mult(translate(this.position[0], this.position[1], this.position[2]), this.modelViewMatrix);
        this.modelViewMatrix = mult(this.orientation, this.modelViewMatrix);
        this.modelViewMatrix = mult(rotationMatrix, this.modelViewMatrix);
        this.modelViewMatrix = mult(viewMatrix, this.modelViewMatrix);

        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(this.modelViewMatrix) );
        gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

        if (this.polygons)
        {
            gl.uniform4f( colorLoc, this.color[0], this.color[1], this.color[2], 1.0 );
            gl.drawArrays( gl.TRIANGLES, 0, this.pointsArray.length );
        }

        if (this.wireframe)
        {
            gl.uniform4f( colorLoc, this.colorWf[0], this.colorWf[1], this.colorWf[2], 1.0  );
            for( var i=0; i< this.pointsArray.length; i+=3)
            {
                gl.drawArrays( gl.LINE_LOOP, i, 3 );
            }
        }

        gl.bindBuffer( gl.ARRAY_BUFFER, null);
        gl.disableVertexAttribArray(vPosition);
    };
};
