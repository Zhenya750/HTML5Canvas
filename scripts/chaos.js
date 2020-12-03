class Point {
    colors = ['white', 'black', '#3af036', '#f25233', '#f233b7'];

    constructor(w, h) {
        this.bounds = {width: w, height: h};
        this.setTo();
        this.updateDirection();
        this.updateColor();
        this.setRadius();
    }

    setRadius(radius) {
        if (radius == undefined) {
            this.radius = Math.random() * 10 + 3;
        }
    }

    setTo(x, y) {
        if (x == undefined) {
            this.x = Math.random() * this.bounds.width;
        }
        else {
            this.x = x;
        }

        if (y == undefined) {
            this.y = Math.random() * this.bounds.height;
        }
        else {
            this.y = y;
        }
    }

    move() {
        this.x += this.direction.vx;
        if (this.x > this.bounds.width) {
            this.x = 0;
        }
        
        this.y += this.direction.vy;
        if (this.y > this.bounds.height) {
            this.y = 0;
        }

        if (this.y < 0) {
            this.y = this.bounds.height;
        }

        if (this.x < 0) {
            this.x = this.bounds.width;
        }
    }

    updateDirection(direction) {
        if (direction == undefined) {
            this.direction = {
                vx: getRandomIntInclusive(-1, 1), 
                vy: getRandomIntInclusive(-1, 1)
            }
        }
        else {
            this.direction = direction;
        }
    }

    updateColor(color) {
        if (color == undefined) {
            this.color = this.colors[getRandomIntInclusive(1, this.colors.length) - 1];
        }
        else {
            this.color = color;
        }
    }
}

var canvas;
var context;
var points = [];

const updateTimeInMls = 30;
const linkDistance = 130;
const linkLineWidth = 1.2;

// preparing
window.onload = function() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < 80; i++) {
        points.push(new Point(canvas.width, canvas.height));
    }

    canvas.addEventListener('mousemove', function(evt) {
        let {x, y} = getMousePos(canvas, evt);
        
        points[0].setTo(x, y);
        points[0].updateDirection({vx: 0, vy: 0});

    });

    canvas.addEventListener('mousedown', function(evt) {
        let {x, y} = getMousePos(canvas, evt);

        let p = new Point(canvas.width, canvas.height);
        p.setTo(x, y);
        points.push(p);
    });

    setTimeout(update, updateTimeInMls);
}


// engine each 'frame'
function update() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawLinks(points, linkDistance);
    drawPoints(points);
    movePoints(points);

    setTimeout(update, updateTimeInMls);
}


function movePoints(points) {
    points.forEach(point => point.move());
}


function drawPoints(points) {
    points.forEach(point => {
        context.fillStyle = point.color;
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2, false);  
        context.fill();
    });
}


function drawLinks(points, maxDistInPx) {
    for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points.length; j++) {
            if (i != j) {
                let dx = points[i].x - points[j].x;
                let dy = points[i].y - points[j].y;

                if (sqr(maxDistInPx) >= sqr(dx) + sqr(dy)) {
                    drawLinkBetween(points[i], points[j]);
                }
            }
        }
    }
}


function drawLinkBetween(p0, p1) {
    var grad = context.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
    grad.addColorStop(0, p0.color);
    grad.addColorStop(1, p1.color);
    context.strokeStyle = grad;
    context.lineWidth = linkLineWidth;
    context.beginPath();
    context.moveTo(p0.x, p0.y);
    context.lineTo(p1.x, p1.y);
    context.stroke();
}


// utils
var sqr = (num) => num * num;


function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    let value = Math.floor(Math.random() * (max - min + 1)) + min;

    if (value == 0) {
        return getRandomIntInclusive(min, max);
    }

    return value;
}


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), root = document.documentElement;
    var mouseX = evt.clientX - rect.left;
    var mouseY = evt.clientY - rect.top;
    return {
        x: mouseX,
        y: mouseY
    };
}