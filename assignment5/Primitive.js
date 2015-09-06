"use strict";

var texSize = 256;
var numChecks = 4;

// Create a checkerboard pattern using floats

//https://upload.wikimedia.org/wikipedia/commons/7/71/Weaved_truncated_square_tiling.png

function configureTexture(image) {
    var texture1 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    return texture1;
};

function configureTextureWeb(image) {
    var texture2 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    //gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    //gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    return texture2;
};

function Primitive(size, points, texCoords, textureSrc)
{
    // member variables
    this.pointsArray = points;
    this.texCoordsArray = texCoords;
    this.size = size;
    this.position = vec3(0.0, 0.0, 0.0);
    this.orientation = mat4(1.0);

    this.color = vec3(0.4, 0.4, 0.8);
    this.colorWf = vec3(0.0, 0.0, 0.0);

    this.wireframe = false;
    this.polygons = true;

    this.vBuffer = null;
    this.tBuffer = null;

    this.texture = 0;
    this.textureSrc = textureSrc;

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

        if (!this.tBuffer)
        {
            this.tBuffer = gl.createBuffer();
            gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer);
            gl.bufferData( gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW );
            console.log(this.textureSrc.constructor.name);

            if (this.textureSrc && this.textureSrc.constructor.name == "HTMLImageElement")
            {
                this.texture = configureTextureWeb(this.textureSrc);
            }
            else
            {
                this.texture = configureTexture(this.textureSrc);
            }
        }
        else
        {
            gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer);
            gl.bindTexture( gl.TEXTURE_2D, this.texture );
        }

        var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
        gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTexCoord);

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
