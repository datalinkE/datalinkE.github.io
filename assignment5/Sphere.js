"use strict";

function triangle(pointsRef, a, b, c) {
    pointsRef.push(a);
    pointsRef.push(b);
    pointsRef.push(c);
};

function divideTriangle(pointsRef, a, b, c, count) {
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
        triangle( pointsRef, a, b, c );
    }
};

function tetrahedron(a, b, c, d, n) {
    var points = [];
    divideTriangle(points, a, b, c, n);
    divideTriangle(points, d, c, b, n);
    divideTriangle(points, a, d, b, n);
    divideTriangle(points, a, c, d, n);
    return points;
};

function spherePoints(numTimesToSubdivide)
{
    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);

    return tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
};

function makeTexCoords(points)
{
    var coords = [];
    var i;
    for(i=0; i<points.length; i++)
    {
      var el = points[i];
      var x = el[0];
      var y = el[1];
      var s = Math.acos(x);

      var t = Math.acos( y / Math.sin ( s ));

      coords.push(vec2(t, s));
    }
    return coords;
}

function Sphere(size, numTimesToSubdivide)
{
    this.pointsArray = spherePoints(numTimesToSubdivide);
    this.texCoordsArray = makeTexCoords(this.pointsArray);
    Primitive.call(this, size, this.pointsArray, this.texCoordsArray);
};
