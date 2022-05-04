import { Point } from './point.js';
import { Edge } from './edge.js';

export class Graph {
    constructor(vertexCount /*int */, edges /*Edge[] */) {
        this.edges = edges; 

        // randomly move vertices
        this.vertexPoints = [];
        for (let i = 0; i < vertexCount; i++) {
            this.vertexPoints.push(new Point(
                Math.floor(Math.random() * 300),
                Math.floor(Math.random() * 300)
            ));
        }

        // console.log(JSON.stringify(this.edges, null, '  '));
    }

    static GetVertexRadius = () => 15;

    SetSegments(segments /*Edge[] */) {
        for (let i = 0; i < segments.length; i++) {
            const s = segments[i];

            for (let j = 0; j < this.edges.length; j++) {
                const e = this.edges[j];

                if (s.u == e.u && s.v == e.v) {
                    e.segments = s.segments;
                }
            }
        }
    }
    
    AddSegments(segments /*Edge[] */) {
        for (let i = 0; i < segments.length; i++) {
            const s = segments[i];
            
            for (let j = 0; j < this.edges.length; j++) {
                const e = this.edges[j];
                
                if (s.u == e.u && s.v == e.v || s.u == e.v && s.v == e.u) {
                    e.segments = e.segments.concat(s.segments);
                }
            }
        }
    }

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
