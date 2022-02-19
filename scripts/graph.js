import { Point } from './point.js';
import { Edge } from './edge.js';

export class Graph {
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
            new Edge(0, 2, 10, [
                [5, 5],
            ]),
        ];

        // randomly move vertices
        this.vertexPoints = [];
        for (let i = 0; i < 4; i++) {
            this.vertexPoints.push(new Point(
                Math.floor(Math.random() * 300),
                Math.floor(Math.random() * 300)
            ));
        }

        console.log(JSON.stringify(this.edges, null, '  '));
    }

    static GetVertexRadius = () => 15;

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
            
            if (p.isOnLine(sup, svp, Edge.GetEdgeWidth())) {
                // let segment = this.getPointedEdgeSegment(e, p);
                return [e, e.segments];
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
