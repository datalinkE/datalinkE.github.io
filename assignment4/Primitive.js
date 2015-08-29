"use strict";

function triangle(pointsRef, normalsRef, a, b, c) {
    pointsRef.push(a);
    pointsRef.push(b);
    pointsRef.push(c);

    var t1 = subtract(b, a);
    var t2 = subtract(a, c);
    var normal = normalize(cross(t2, t1));
    normal = vec4(normal);
    normal[3]  = 0.0;

    normalsRef.push(normal);
    normalsRef.push(normal);
    normalsRef.push(normal);
};

function Primitive(size, points, normals)
{
    this.materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
    this.materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
    this.materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
    this.materialShininess = 20.0;
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
    this.nBuffer = null;

    this.render = function(gl, program)
    {
        gl.useProgram(program);
        if (!this.nBuffer)
        {
            this.nBuffer = gl.createBuffer();
            gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer);
            gl.bufferData( gl.ARRAY_BUFFER, flatten(this.normalsArray), gl.STATIC_DRAW );
        }
        else
        {
            gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer);
        }

        var vNormal = gl.getAttribLocation( program, "vNormal" );
        gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vNormal);

        //////////////////
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
        //////////////////

        var modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
        var projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
        var normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

        var modelViewMatrix = mat4(1.0);
        modelViewMatrix = mult(scalem(this.size, this.size, this.size), modelViewMatrix);
        modelViewMatrix = mult(translate(this.position[0], this.position[1], this.position[2]), modelViewMatrix);
        modelViewMatrix = mult(this.orientation, modelViewMatrix);
        //////////// above - model, below - view
        modelViewMatrix = mult(rotationMatrix, modelViewMatrix);
        modelViewMatrix = mult(viewMatrix, modelViewMatrix);

        var normalMatrix = [
            vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
            vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
            vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
        ];


        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
        gl.uniformMatrix3fv( normalMatrixLoc, false, flatten(normalMatrix) );

        var ambientProduct = mult(lightAmbient, this.materialAmbient);
        var diffuseProduct = mult(lightDiffuse, this.materialDiffuse);
        var specularProduct = mult(lightSpecular, this.materialSpecular);

        gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct) );
        gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
        gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );
        gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
        gl.uniform1f( gl.getUniformLocation(program, "shininess"), this.materialShininess );

        gl.drawArrays( gl.TRIANGLES, 0, this.pointsArray.length );

        gl.bindBuffer( gl.ARRAY_BUFFER, null);
        gl.disableVertexAttribArray(vPosition);
        gl.disableVertexAttribArray(vNormal);
    };
};
