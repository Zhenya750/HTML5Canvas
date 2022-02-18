function drawInfoPanel(p /*Point */, info /*txt */) {
    const div = document.getElementById('info');
    div.style.position = "absolute";
    div.style.left = p.x + "px";
    div.style.top = p.y + "px";

    // set text to div/span
    div.firstElementChild.textContent = info;
}

function cleanInfoPanel() {
    const div = document.getElementById('info');
    div.firstElementChild.textContent = "";
}