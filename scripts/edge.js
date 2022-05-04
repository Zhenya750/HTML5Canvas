export class Edge {
    constructor(u, v, weight, segments) {
        this.u = u;                 // start
        this.v = v;                 // end
        this.weight = weight;
        this.segments = segments;   // []{0 <= double1, double2 <= weight}
    }

    static GetEdgeWidth = () => 5;
    static GetDefaultColor = () => 'lightgreen';
}
