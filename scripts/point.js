export class Point {
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
