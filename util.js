// util.js: Contains some math helper functions

// Gets the points used to draw the arrow polygon at the end of each line
function getArrowPoints(x0, y0, x1, y1) {
    var d = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
    var r = 20;
    var t = 1 - ((r * Math.sqrt(3)) / (2 * d));
    var D = [x0 * (1 - t) + x1 * t, y0 * (1 - t) + y1 * t];
    var m = -(x1 - x0) / (y1 - y0);
    var Ax = (r / (2 * Math.sqrt(1 + Math.pow(m, 2)))) + D[0];
    var negAx = (-r / (2 * Math.sqrt(1 + Math.pow(m, 2)))) + D[0];
    var Ay = function (x) { return m * (x - D[0]) + D[1]; };

    var points = [[x1, y1], [Ax, Ay(Ax)], [negAx, Ay(negAx)]];

    return points[0][0] + "," + points[0][1] + " " + points[1][0] + "," + points[1][1] + " " + points[2][0] + "," + points[2][1];
}

// Get the start and end points of the line that connects two nodes
function getLinePoints(x0, y0, x1, y1, r) {
    var d = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
    var t1 = (r / d);
    var t2 = 1 - t1;
    var P1 = [x0 * (1 - t1) + x1 * t1, y0 * (1 - t1) + y1 * t1];
    var P2 = [x0 * (1 - t2) + x1 * t2, y0 * (1 - t2) + y1 * t2];
    return [P1[0], P1[1], P2[0], P2[1]];
}