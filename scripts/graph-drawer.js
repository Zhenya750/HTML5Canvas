import { Edge } from './edge.js';
import { Graph } from './graph.js';

export class GraphDrawer {
    constructor(context, graph /*Graph */) {
        this.context = context;
        this.graph = graph;
    }

    static getSegmentEpsilon = () => 0.1;

    Draw() {
        this.drawEdges();
        this.drawVertices();
    }
    
    drawEdges() {
        for (let e of this.graph.edges) {
            this.context.strokeStyle = "black";
            this.context.lineWidth = Edge.GetEdgeWidth();
            this.context.beginPath();
            this.context.moveTo(this.graph.GetVP(e.u).x, this.graph.GetVP(e.u).y);
            this.context.lineTo(this.graph.GetVP(e.v).x, this.graph.GetVP(e.v).y);
            this.context.stroke();
    
            // draw segments on edge
            this.context.strokeStyle = "lightgreen";
    
            for (let [a, b] of e.segments) {
                if (Math.abs(a - b) < GraphDrawer.getSegmentEpsilon()) {
                    b += GraphDrawer.getSegmentEpsilon();
                }

                let pa = this.graph.ConvertEdgePointToXYPoint(e, a);
                let pb = this.graph.ConvertEdgePointToXYPoint(e, b);
    
                this.context.beginPath();
                this.context.moveTo(pa.x, pa.y);
                this.context.lineTo(pb.x, pb.y);
                this.context.stroke();
            }
        }
    }

    drawVertices() {
        for (let v of this.graph.vertexPoints.keys()) {
            let vp = this.graph.GetVP(v);
            // body of the node
            this.context.fillStyle = "white";
            this.context.beginPath();
            this.context.arc(vp.x, vp.y, Graph.GetVertexRadius(), 0, Math.PI * 2, false);  
            this.context.fill();
    
            // name of the node
            this.context.fillStyle = 'black';
            this.context.textAlign = 'center';
            this.context.textBaseline = 'middle';
            this.context.font = `bold 16px sans-serif`;
            this.context.fillText(v, vp.x, vp.y);
        }
    }
}
