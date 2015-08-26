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

function divideTriangle(pointsRef, normalsRef, a, b, c, count) {
    if ( count > 0 ) {

        var ab = normalize(mix( a, b, 0.5), true);
        var ac = normalize(mix( a, c, 0.5), true);
        var bc = normalize(mix( b, c, 0.5), true);

        divideTriangle( pointsRef, a, ab, ac, count - 1 );
        divideTriangle( pointsRef, ab, b, bc, count - 1 );
        divideTriangle( pointsRef, bc, c, ac, count - 1 );
        divideTriangle( pointsRef, ab, bc, ac, count - 1 );
    }
    else { // draw tetrahedron at end of recursion
        triangle( pointsRef, normalsRef, a, b, c );
    }
};

function tetrahedron(a, b, c, d, n) {
    var points = [];
    var normals = [];
    divideTriangle(points, normals, a, b, c, n);
    divideTriangle(points, normals, d, c, b, n);
    divideTriangle(points, normals, a, d, b, n);
    divideTriangle(points, normals, a, c, d, n);
    return { "points" : points, "normals" : normals };
};

function spherePoints(numTimesToSubdivide)
{
    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);

    return tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
};

function Sphere(size, numTimesToSubdivide)
{
    var data = spherePoints(numTimesToSubdivide);
    this.pointsArray = data.points;
    this.pointsArray = data.normals;
    Primitive.call(this, size, this.pointsArray, this.normalsArray);
};
