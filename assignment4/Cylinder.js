"use strict";

function cylinderPoints(segments) {
    var h = 2;
    var theta = (Math.PI / 180) * (360 / segments); //Degrees = radians * (180 / π)

    var cylinderBotVertices = [];
    var cylinderSideVertices = [];
    var cylinderTopVertices = [];

    var points = [];
    var normals = [];

    for (var i =0; i <= segments; i++){
        var x =  Math.cos(theta*i);
        var z =  Math.sin(theta*i);
        var x1 =  Math.cos(theta*i + theta);
        var z1 =  Math.sin(theta*i + theta);

        //Bottomvertices
        triangle(points, normals,
                vec4(0.0, 0.0, 0.0, 1.0),
                vec4(x, 0.0, z, 1.0),
                vec4(x1, 0.0, z1, 1.0));

        //Sidevertices
        triangle(points, normals,
                vec4(x1, h, z1),
                vec4(x1, 0.0, z1, 1.0),
                vec4(x, 0.0, z, 1.0));

        triangle(points, normals,
                vec4(x, 0.0, z, 1.0),
                vec4(x, h, z, 1.0),
                vec4(x1, h, z1));

        // //Topvertices
        triangle(points, normals,
                vec4(0.0, h, 0.0, 1.0),
                vec4(x1, h, z1, 1.0),
                vec4(x, h, z, 1.0));
        }

    return { "points" : points, "normals" : normals };
}


function Cylinder(size, segments)
{
    var data = cylinderPoints(segments);
    this.pointsArray = data.points;
    this.normalsArray = data.normals;
    Primitive.call(this, size, this.pointsArray, this.normalsArray);
};
