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
        this.segments = segments;   // []{0 <= double1, double2 <= weight}
    }

    static GetEdgeWidth = () => 3;
}

class Graph {
    constructor() {
        this.edges = [
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

        // randomly move vertices
        this.vertexPoints = [];
        for (let i = 0; i < 4; i++) {
            this.vertexPoints.push(new Point(
                Math.floor(Math.random() * 300),
                Math.floor(Math.random() * 300)
            ));
        }
    }

    static GetVertexRadius = () => 10;

    GetVP(v /*int */) {
        if (v < 0 || v >= this.vertexPoints.length) {
            console.error("out of bounds");
            return null;
        }

        return this.vertexPoints[v];
    }

    ConvertEdgePointToXYPoint(edge /*Edge */, d /*double */) {
        d = Math.max(0, d);
        d = Math.min(d, edge.weight);

        let lambda = d / edge.weight;
        let [sup, svp] = this.getEdgeBoundPoints(edge);
        return svp.sub(sup).mul(lambda).add(sup);
    }

    getEdgeBoundPoints(edge /*Edge */) {
        let up = this.GetVP(edge.u);
        let vp = this.GetVP(edge.v);
        let edgeLen = up.distanceTo(vp);

        if (edgeLen < Graph.GetVertexRadius() * 2) {
            console.error(`cannot calculate segment points: edgelen ${edgeLen} > ${Graph.GetVertexRadius()}`);
            return [new Point(), new Point()];
        }

        let lambda = Graph.GetVertexRadius() / edgeLen;
        return [
            vp.sub(up).mul(lambda).add(up),     // start point for segments
            vp.sub(up).mul(1 - lambda).add(up)  // end point for segments
        ];
    }

    GetPointedVertex(p /*Point */) {
        for (let u = 0; u < this.vertexPoints.length; u++) {
            let up = this.GetVP(u);
            if (up.isInCircle(p, Graph.GetVertexRadius())) {
                return u;
            }
        }

        return null;
    }

    GetPointedEdge(p /*Point */) {
        for (let e of this.edges) {
            let [sup, svp] = this.getEdgeBoundPoints(e);
            
            if (p.isOnLine(sup, svp, Edge.GetEdgeWidth() * 1.5)) {
                let segment = this.getPointedEdgeSegment(e, p);
                return [e, segment];
            }
        }

        return [null, null];
    }

    getPointedEdgeSegment(e /*Edge */, p /*Point */) {
        for (let [a, b] of e.segments) {
            let pa = this.ConvertEdgePointToXYPoint(e, a);
            let pb = this.ConvertEdgePointToXYPoint(e, b);

            if (p.isOnLine(pa, pb, Edge.GetEdgeWidth())) {
                return [a, b];
            }
        }
        
        return null;
    }

    MoveVertex(u /*int */, p /*Point */) {
        if (u < 0 || u >= this.vertexPoints.length) return;
        this.vertexPoints[u] = p;
    }
}

class GraphDrawer {
    constructor(graph /*Graph */) {
        this.graph = graph;
    }

    Draw() {
        this.drawEdges();
        this.drawVertices();
    }
    
    drawEdges() {
        for (let e of this.graph.edges) {
            context.strokeStyle = "black";
            context.lineWidth = Edge.GetEdgeWidth();
            context.beginPath();
            context.moveTo(this.graph.GetVP(e.u).x, this.graph.GetVP(e.u).y);
            context.lineTo(this.graph.GetVP(e.v).x, this.graph.GetVP(e.v).y);
            context.stroke();
    
            // draw segments on edge
            context.strokeStyle = "lightgreen";
    
            for (let [a, b] of e.segments) {
                let pa = this.graph.ConvertEdgePointToXYPoint(e, a);
                let pb = this.graph.ConvertEdgePointToXYPoint(e, b);
    
                context.beginPath();
                context.moveTo(pa.x, pa.y);
                context.lineTo(pb.x, pb.y);
                context.stroke();
            }
        }
    }

    drawVertices() {
        for (let v of this.graph.vertexPoints.keys()) {
            let vp = this.graph.GetVP(v);
            // body of the node
            context.fillStyle = "white";
            context.beginPath();
            context.arc(vp.x, vp.y, Graph.GetVertexRadius(), 0, Math.PI * 2, false);  
            context.fill();
    
            // name of the node
            context.fillStyle = 'black';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.font = `bold 16px sans-serif`;
            context.fillText(v, vp.x, vp.y);
        }
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

    const graph = new Graph();
    const drawer = new GraphDrawer(graph);

    drawer.Draw();

    addEventListeners(graph);
    setTimeout(function() {
        update(drawer);
    }, updateTimeInMls);
}

function update(drawer /*GraphDrawer */) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawer.Draw();
    setTimeout(function() {
        update(drawer);
    }, updateTimeInMls);
}

function addEventListeners(graph /*Graph */) {
    let isMouseDown = false;
    let pointedVertex = null;

    canvas.addEventListener('mousemove', function(evt) {
        let mouseP = new Point(evt.offsetX, evt.offsetY);
       
        if (isMouseDown) {
            if (pointedVertex != null) {
                graph.MoveVertex(pointedVertex, mouseP);
            }
        }

        if (!isMouseDown) {
            let [pointedEdge, segment] = graph.GetPointedEdge(mouseP);
            if (segment != null) {
                drawInfoPanel(mouseP.sub(new Point(-10, 20)), segment) 
            }
            else if (pointedEdge != null) {
               drawInfoPanel(mouseP.sub(new Point(-10, 20)), pointedEdge.weight) 
            }
            else {
                cleanInfoPanel();
            }
        }
    });

    canvas.addEventListener('mousedown', function(evt) {
        isMouseDown = true;
        let mouseP = new Point(evt.offsetX, evt.offsetY);
        pointedVertex = graph.GetPointedVertex(mouseP);
        
    });
    
    canvas.addEventListener('mouseup', function(evt) {
        isMouseDown = false;
        let mouseP = new Point(evt.offsetX, evt.offsetY);
        pointedVertex = graph.GetPointedVertex(mouseP);
    });
}
