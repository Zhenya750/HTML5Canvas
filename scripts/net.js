class Node {
    constructor(name = "", x = 0, y = 0, weight = 0, radius = 12) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.weight = weight;
        this.radius = radius;
        this.color = 'white';
        this.fontSize = '16px';
    }

    setWeight(deep, maxDeep) {
        this.weight = 1 - deep / maxDeep;
    }

    setColor(deep) {
        let colors = ['#e82323', '#e85e23', '#e89527', '#faf850', '#fffe9a', '#ffffff'];
        this.color = colors[Math.min(deep, colors.length - 1)];
    }
}

var canvas;
var context;
const updateTimeInMls = 30;
const linkLineWidth = 3;

var nodes = [];
var graph = [];
var stepInPx = 70;  // step between nodes
var cachedNode;     // node which is mousedown
var deep = 7;       // number of moving nodes

// preparing
window.onload = function() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    initGraph(20, 10);
    drawGraph(graph, nodes);

    addEventListeners();
    setTimeout(update, updateTimeInMls);
}


function initGraph(w, h) {
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            nodes.push(new Node(`${i * w + j}`, (j + 1) * stepInPx, (i + 1) * stepInPx));
    
            let neighbours = [];
            if (j - 1 >= 0) {
                neighbours.push(i * w + j - 1);
            }

            if (i - 1 >= 0) {
                neighbours.push((i - 1) * w + j);
            }

            if (j + 1 < w) {
                neighbours.push(i * w + j + 1);
            }
    
            if (i + 1 < h) {
                neighbours.push((i + 1) * w + j);
            }
    
            graph.push(neighbours);
        }
    }
}


function addEventListeners() {
    let isMouseDown = false;

    canvas.addEventListener('mousemove', function(evt) {
        let {x, y} = getMousePos(canvas, evt);
        
        for (let node of nodes) {
            if (sqr(x - node.x) + sqr(y - node.y) <= sqr(node.radius)) {
                
                // if pressed and move a node then don't
                // resize other nodes
                if (isMouseDown && cachedNode != undefined) {
                    cachedNode.radius = 15;
                    cachedNode.fontSize = '17px';
                }
                else {
                    node.radius = 15;
                    node.fontSize = '17px';
                }
            }
            else {
                node.radius = 12;
                node.fontSize = '15px';
            }
        }

        if (isMouseDown) {
            if (cachedNode != undefined) {

                let dx = x - cachedNode.x;
                let dy = y - cachedNode.y;

                nodes.forEach(node => {
                    node.x += dx * node.weight;
                    node.y += dy * node.weight;
                });
            }
        }
    });

    canvas.addEventListener('mousedown', function(evt) {
        let {x, y} = getMousePos(canvas, evt);
        
        for (let node of nodes) {
            if (sqr(x - node.x) + sqr(y - node.y) <= sqr(node.radius)) {
                cachedNode = node;
                bfs(graph, nodes, nodes.indexOf(cachedNode), deep);
                break;
            }
        }
        
        isMouseDown = true;
    });

    canvas.addEventListener('mouseup', function(evt) {
        isMouseDown = false;
        cachedNode = undefined;
        nodes.forEach(node => {
            node.color = 'white';
            node.weight = 0;
            node.radius = 12;
            node.fontSize = '15px';
        });
    });
}


function update() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGraph(graph, nodes);
    setTimeout(update, updateTimeInMls);
}


function drawGraph(graph, nodes) {
    for (let u = 0; u < graph.length; u++) {
        for (let v of graph[u]) {
            if (u < v){
                drawLinkBetween(nodes[u], nodes[v]);           
            }
        }
    }

    drawNodes(nodes);
    if (cachedNode != undefined) {
        drawNodes([cachedNode]);
    }
}


function drawLinkBetween(node0, node1) {
    context.lineWidth = linkLineWidth;
    context.beginPath();
    context.moveTo(node0.x, node0.y);
    context.lineTo(node1.x, node1.y);
    context.stroke();
}


function drawNodes(nodes) {
    for (let node of nodes) {
        // body of the node
        context.fillStyle = node.color;
        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2, false);  
        context.fill();

        // name of the node
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = `bold ${node.fontSize} sans-serif`;
        context.fillText(node.name, node.x, node.y);
    }
}


// bfs
function bfs(graph, nodes, s, maxDeep) {
    let visited = [];
    for (let i = 0; i < graph.length; i++) {
        visited.push(false);
    }

    let startDeep = 0;
	let queue = [];
    queue.push({u: s, d: startDeep});

	visited[s] = true;
	while (queue.length > 0) {
        let {u, d} = queue.shift();

        if (d >= maxDeep) return;
        
        nodes[u].setWeight(d, maxDeep);
        nodes[u].setColor(d);

		for (let v of graph[u]) {
			if (visited[v] == false) {
				queue.push({u: v, d: d + 1});
				visited[v] = true;
			}
        }
	}
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