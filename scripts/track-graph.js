class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    distanceTo(p) {
        return Math.sqrt(Math.pow(this.x - p.x, 2) + Math.pow(this.y - p.y, 2))
    }

    add(p) {
        return new Point(this.x + p.x, this.y + p.y);
    }

    sub(p) {
        return new Point(this.x - p.x, this.y - p.y);
    }

    mul(num) {
        return new Point(this.x * num, this.y * num);
    }
}

class Edge {
    constructor(u, v, weight, segments) {
        this.u = u;
        this.v = v;
        this.weight = weight;
        this.segments = segments; // []{0 <= double1, double2 <= weight}
        this.up = new Point(100, 100);  // start point of the edge
        this.vp = new Point(200, 200);  // end point of the edge
        this.sup = new Point(); // start point for segments
        this.svp = new Point(); // end point for segments
        this.vertexRadius = Edge.getVertexRadius();
    }

    static getVertexRadius() {
        return 20;
    }

    convertEdgePointToXYPoint(edgePoint /* double */) {
        if (edgePoint < 0) edgePoint = 0;
        if (edgePoint > this.weight) edgePoint = this.weight;

        let lambda = edgePoint / this.weight;
        return this.svp.sub(this.sup).mul(lambda).add(this.sup)
    }

    updateSegmentBoundPoints() {
        let edgeLen = this.up.distanceTo(this.vp)
        if (edgeLen < this.vertexRadius * 2) {
            console.error(`cannot calculate segment points: edgelen ${edgeLen} > ${this.vertexRadius}`);
            return;
        }

        let lambda = this.vertexRadius / edgeLen;
        this.sup = this.vp.sub(this.up).mul(lambda).add(this.up);
        this.svp = this.vp.sub(this.up).mul(1 - lambda).add(this.up);
    }
}

var canvas;
var context;
const updateTimeInMls = 30;
const edgeWidth = 3;

// preparing
window.onload = function() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // get graph, segments
    // ...
    const edgeInfo = [];
    // convert edgeInfo to edges
    const edges = [
        new Edge(0, 1, 10, [
            [0, 5],
            [7.5, 10],
        ]),
    ];

    drawGraph(edges);

    // addEventListeners();
    // setTimeout(update, updateTimeInMls);
}

function drawGraph(edges /* []Edge*/) {
    const verticesToPoints = new Map();
    for (let e of edges) {
        drawEdge(e);
        verticesToPoints.set(e.u, e.up);
        verticesToPoints.set(e.v, e.vp);
    }

    drawVertices(verticesToPoints, Edge.getVertexRadius())
}

function drawEdge(edge /* Edge */) {
    // draw full edge
    context.lineWidth = edgeWidth;
    context.beginPath();
    context.moveTo(edge.up.x, edge.up.y);
    context.lineTo(edge.vp.x, edge.vp.y);
    context.stroke();

    // draw segments on edge
    edge.updateSegmentBoundPoints();
    context.strokeStyle = "lightgreen";

    for (let [a, b] of edge.segments) {
        let pa = edge.convertEdgePointToXYPoint(a)
        let pb = edge.convertEdgePointToXYPoint(b)

        context.beginPath();
        context.moveTo(pa.x, pa.y);
        context.lineTo(pb.x, pb.y);
        context.stroke();
    }
}

function drawVertices(verticesToPoint /* (int, Point) */, radius /* double */) {
    for (let v of verticesToPoint.keys()) {
        let vp = verticesToPoint.get(v);
        // body of the node
        context.fillStyle = "white";
        context.beginPath();
        context.arc(vp.x, vp.y, radius, 0, Math.PI * 2, false);  
        context.fill();

        // name of the node
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = `bold 16px sans-serif`;
        context.fillText(v, vp.x, vp.y);
    }
}