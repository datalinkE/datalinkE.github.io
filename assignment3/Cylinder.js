"use strict";

function cylinderPoints(segments) {
    var h = 2;
    var theta = (Math.PI / 180) * (360 / segments); //Degrees = radians * (180 / π)

    var cylinderBotVertices = [];
    var cylinderSideVertices = [];
    var cylinderTopVertices = [];

    for (var i =0; i <= segments; i++){
        var x =  Math.cos(theta*i);
        var z =  Math.sin(theta*i);
        var x1 =  Math.cos(theta*i + theta);
        var z1 =  Math.sin(theta*i + theta);

        //Bottomvertices
        cylinderBotVertices.push(vec4(0.0, 0.0, 0.0, 1.0));
        cylinderBotVertices.push(vec4(x, 0.0, z, 1.0));
        cylinderBotVertices.push(vec4(x1, 0.0, z1, 1.0));

        //Sidevertices
        cylinderSideVertices.push(vec4(x1, h, z1));
        cylinderSideVertices.push(vec4(x1, 0.0, z1, 1.0));
        cylinderSideVertices.push(vec4(x, 0.0, z, 1.0));

        cylinderSideVertices.push(vec4(x, 0.0, z, 1.0));
        cylinderSideVertices.push(vec4(x, h, z, 1.0));
        cylinderSideVertices.push(vec4(x1, h, z1));

        //Topvertices
        cylinderTopVertices.push(vec4(0.0, h, 0.0, 1.0));
        cylinderTopVertices.push(vec4(x, h, z, 1.0));
        cylinderTopVertices.push(vec4(x1, h, z1, 1.0));
    }

    return cylinderBotVertices.concat(cylinderSideVertices, cylinderTopVertices);
}


function Cylinder(size, segments)
{
    this.pointsArray = cylinderPoints(segments);
    Primitive.call(this, size, this.pointsArray);
};
