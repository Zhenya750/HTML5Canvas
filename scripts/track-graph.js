import { Point } from './point.js';
import { Edge } from './edge.js';
import { InfoPanel } from './info-panel.js';
import { Graph } from './graph.js';
import { GraphDrawer } from './graph-drawer.js';

var canvas;
var context;
const updateTimeInMls = 30;

// preparing
window.onload = function() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const edges = [
        new Edge(0, 1, 10, [
            [0, 3, "pink"],
            [1.5, 4],
            [5, 7],
        ]),
        new Edge(1, 2, 20, [
            // [5, 10],
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

    const graph = new Graph(4, edges);
    const drawer = new GraphDrawer(context, graph);

    drawer.Draw();

    graph.AddSegments([
        new Edge(2, 1, 10, [
            [0, 7, "pink"],
            [5, 10],
        ]),
    ]);


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
            let [pointedEdge, segments] = graph.GetPointedEdge(mouseP);
            if (pointedEdge != null) {
                InfoPanel.DrawInfoPanel(
                    mouseP.sub(new Point(-10, 20)), 
                    {
                        weight: pointedEdge.weight,
                        segments: segments,
                    })
            }
            else {
                InfoPanel.CleanInfoPanel();
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
