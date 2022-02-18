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

    scalar(p /*Point */) {
        return this.x * p.x + this.y * p.y;
    }

    isInCircle(p /*Point */, radius /*double */) {
        if (this.x < p.x - radius) return false
        if (this.x > p.x + radius) return false
        if (this.y < p.y - radius) return false
        if (this.y > p.y + radius) return false

        return Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2) <= 
            Math.pow(radius, 2);
    }

    isOnLine(p1, p2 /*Point */, delta /*double */) {
        let v1 = this.sub(p1);
        let v2 = p2.sub(p1);
        if (v1.scalar(v2) < 0) return this.distanceTo(p1) <= delta;

        v1 = this.sub(p2);
        v2 = p1.sub(p2);
        if (v1.scalar(v2) < 0) return this.distanceTo(p2) <= delta;
        
        return Math.abs((p2.y - p1.y) * this.x - (p2.x - p1.x) * this.y + 
            p2.x * p1.y - p2.y * p1.x) / p1.distanceTo(p2) <= delta;
    }
}

class Edge {
    constructor(u, v, weight, segments) {
        this.u = u;
        this.v = v;
        this.weight = weight;
        this.segments = segments;                   // []{0 <= double1, double2 <= weight}
        this.up = new Point();                      // start point of the edge
        this.vp = new Point();                      // end point of the edge
        this.sup = new Point();                     // start point for segments
        this.svp = new Point();                     // end point for segments
        this.vertexRadius = Edge.getVertexRadius(); // readonly
    }

    static getVertexRadius() {
        return 15;
    }

    static getEdgeWidth() {
        return 3;
    }

    convertEdgePointToXYPoint(edgePoint /*double */) {
        if (edgePoint < 0) edgePoint = 0;
        if (edgePoint > this.weight) edgePoint = this.weight;

        let lambda = edgePoint / this.weight;
        return this.svp.sub(this.sup).mul(lambda).add(this.sup);
    }

    updateSegmentBoundPoints() {
        let edgeLen = this.up.distanceTo(this.vp);
        if (edgeLen < this.vertexRadius * 2) {
            console.error(`cannot calculate segment points: edgelen ${edgeLen} > ${this.vertexRadius}`);
            return;
        }

        let lambda = this.vertexRadius / edgeLen;
        this.sup = this.vp.sub(this.up).mul(lambda).add(this.up);
        this.svp = this.vp.sub(this.up).mul(1 - lambda).add(this.up);
    }

    hasPoint(p /*Point */) {
        return p.isOnLine(this.sup, this.svp, Edge.getEdgeWidth());
    }

    hasPointOnStartVertex(p /*Point */) {
        return this.up.isInCircle(p, Edge.getVertexRadius());
    }

    hasPointOnEndVertex(p /*Point */) {
        return this.vp.isInCircle(p, Edge.getVertexRadius());
    }

    getPointedSegment(p /*Point */) {
        if (!this.hasPoint(p)) return null;

        for (let [a, b] of this.segments) {
            let pa = this.convertEdgePointToXYPoint(a);
            let pb = this.convertEdgePointToXYPoint(b);
            
            if (p.isOnLine(pa, pb, Edge.getEdgeWidth())) 
                return [a, b];
        }
    }

    moveStartVertex(p /*Point */) {
        this.up = p;
    }

    moveEndVertex(p /*Point */) {
        this.vp = p;
    }
}

var canvas;
var context;
const updateTimeInMls = 30;

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
            [0, 3],
            [5, 7],
        ]),
        new Edge(1, 2, 20, [
            [5, 10],
        ]),
        new Edge(2, 3, 50, [
            [10, 20],
        ]),
        new Edge(1, 3, 50, [
            [10, 20],
        ]),
        new Edge(0, 2, 10, []),
    ];

    const verticesCount = 4;

    // randomly move vertices
    const vertexPoints = [];
    for (let i = 0; i < verticesCount; i++) {
        vertexPoints.push(new Point(
            Math.floor(Math.random() * 300),
            Math.floor(Math.random() * 300)
        ));
    }

    console.log(vertexPoints)

    for (let e of edges) {
        e.moveStartVertex(vertexPoints[e.u]);
        e.moveEndVertex(vertexPoints[e.v]);
        // break;
    }

    drawGraph(edges);

    addEventListeners(edges);
    setTimeout(function() {
        update(edges);
    }, updateTimeInMls);
}

function update(edges) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGraph(edges);
    setTimeout(function() {
        update(edges);
    }, updateTimeInMls);
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
    context.strokeStyle = "black";
    context.lineWidth = Edge.getEdgeWidth();
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

function addEventListeners(edges) {
    let isMouseDown = false;

    canvas.addEventListener('mousemove', function(evt) {
        let mouseP = new Point(evt.offsetX, evt.offsetY);
        
        document.body.style.cursor = "default";
        let noPointedEdges = true;
        
        for (let e of edges) {
            if (e.hasPointOnStartVertex(mouseP)) {
                document.body.style.cursor = "grab";
                if (isMouseDown) {
                    document.body.style.cursor = "grabbing";
                    e.moveStartVertex(mouseP);
                }
            }
            
            if (e.hasPointOnEndVertex(mouseP)) {
                document.body.style.cursor = "grab";
                if (isMouseDown) {
                    document.body.style.cursor = "grabbing";
                    e.moveEndVertex(mouseP);
                }
            }
            
            if (e.hasPoint(mouseP)) {
                noPointedEdges = false;
                document.body.style.cursor = "pointer";
                
                let s = e.getPointedSegment(mouseP);
                if (s) {
                    console.log(s);
                    drawInfoPanel(mouseP.sub(new Point(-10, 20)), s)
                }
                else {
                    drawInfoPanel(mouseP.sub(new Point(-10, 20)), e.weight)
                    console.log('on line');
                }
            }
        }

        if (noPointedEdges) {
            cleanInfoPanel();
        }
    });

    canvas.addEventListener('mousedown', function(evt) {
        isMouseDown = true;
    });

    canvas.addEventListener('mouseup', function(evt) {
        isMouseDown = false;
    });
}
