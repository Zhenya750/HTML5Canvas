export class Edge {
    constructor(u, v, weight, segments) {
        this.u = u;
        this.v = v;
        this.weight = weight;
        this.segments = segments;   // []{0 <= double1, double2 <= weight}
    }

    static GetEdgeWidth = () => 3;
}
