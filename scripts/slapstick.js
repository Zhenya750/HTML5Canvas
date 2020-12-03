class Particle {
    constructor(x = 0, y = 0, angle = 0, v0) {
        this.x = x;
        this.y = y;
        this.basex = x;
        this.basey = y;

        this.width = Math.random() * 15 + 10;
        this.basewidth = this.width;
        this.dw = Math.random() * 2;
        this.height = this.width / 2;
        
        this.color = 'white';

        this.rotation = 0;
        this.dr = Math.random() * 2 + 1;
        this.k = 0.00008;

        this.m = 0.00001 * this.width;
        this.v0 = v0;
        this.v0x = this.v0 * Math.cos(angle * Math.PI / 180);
        this.v0y = this.v0 * Math.sin(angle * Math.PI / 180);
    }

    rotate() {
        this.rotation += this.dr;
        if (Math.abs(this.rotation) >= Math.abs(this.rotation) + 30) {
            this.dr = -this.dr;
        }
    }

    squeeze() {
        this.width -= this.dw;
        if (this.width <= 1 || this.width >= this.basewidth) {
            this.dw = -this.dw;
        }
    }

    nextXY(t) {
        this.x = this.basex + this.v0x * this.m / this.k * (1 - Math.exp(-this.k * t / this.m));
        this.y = this.basey + this.m / this.k * ((this.v0y + this.m * g / this.k) * (1 - Math.exp(-this.k * t / this.m)) - g * t);
    }
}


var canvas;
var context;
const updateTimeInMls = 20;

const g = 9.81;
var dt = 0.15;
const spreadAngle = 25;

var listOfParticles = [];
var times = [];

var x0, y0;
var x, y;
var dist = 0;
var angle = 0;
var isMouseDown = false;


// preparing
window.onload = function() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    addEventListeners();
    setTimeout(update, updateTimeInMls);
}


function addEventListeners() {

    canvas.addEventListener('mousemove', function(evt) {
        let {x, y} = getMousePos(canvas, evt);
        window.x = x;
        window.y = y;
    });

    canvas.addEventListener('mousedown', function(evt) {
        let {x, y} = getMousePos(canvas, evt);
        window.x = x;
        window.y = y;

        if (isMouseDown == false) {
            x0 = x;
            y0 = y;
            isMouseDown = true;
        }
    });

    canvas.addEventListener('mouseup', function(evt) {
        let {x, y} = getMousePos(canvas, evt);
        window.x = x;
        window.y = y;
        
        dist = distance(x0, y0, x, y);
        angle = -Math.atan2(y0 - y, x0 - x) * 180 / Math.PI;

        let particles = generateParticles(10 + dist / 3, x0, innerHeight - y0, angle, dist);
        
        listOfParticles.push(particles);
        times.push(0);

        isMouseDown = false;
    });
}


function drawCursor(x, y, color, radius = 20) {
    context.strokeWidth = 2;
    context.strokeStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, false);  
    context.stroke();
}


function drawLine(x0, y0, x1, y1) {
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
}


// engine each 'frame'
function update() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (isMouseDown == false) {
        drawCursor(x, y, 'white');
    }
    else {
        drawLine(x0, y0, x, y);
        let radius = distance(x0, y0, x, y) / 10;
        drawCursor(x0, y0, 'orange', radius)
        drawCursor(x, y, 'white');
    }

    if (listOfParticles) {
        for (let i = 0; i < times.length; i++) {
            times[i] += dt;
        }

        listOfParticles.forEach((particles, i) => {
            particles.forEach(particle => {
                particle.nextXY(times[i]);
                particle.rotate();
                particle.squeeze();
                drawParticle(particle);
            });
        });
    }

    setTimeout(update, updateTimeInMls);
}


function generateParticles(count, x, y, angle, distance) {
    let particles = [];

    for (let i = 0; i < count; i++) {
        let randomAngle = spreadAngle * (Math.random() * 2 - 1) + angle;
        particle = new Particle(x, y, randomAngle, 0.8 * distance);
        particle.color = getRandomColor();
        particles.push(particle);
    }

    return particles;
}


function drawParticle(particle) {
    context.save();
    context.fillStyle = particle.color;
    context.translate(particle.x + particle.width / 2, innerHeight - particle.y - 10);
    context.rotate(particle.rotation * Math.PI / 180);
    context.fillRect(-particle.width / 2, 10, particle.width, particle.height);
    context.restore();
  }


  // utils
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), root = document.documentElement;
    var mouseX = evt.clientX - rect.left;
    var mouseY = evt.clientY - rect.top;
    return {
        x: mouseX,
        y: mouseY
    };
}


var sqr = (num) => num * num;


var distance = (x0, y0, x1, y1) => Math.sqrt(sqr(x0 - x1) + sqr(y0 - y1));


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}