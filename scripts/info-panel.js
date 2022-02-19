export class InfoPanel {
    static DrawInfoPanel(p /*Point */, info /*txt */) {
        const div = document.getElementById('info');
        div.style.display = 'block';
        div.style.position = "absolute";
        div.style.left = p.x + "px";
        div.style.top = p.y + "px";
    
        // set text to div/span
        div.firstElementChild.textContent = JSON.stringify(info);
    }
    
    static CleanInfoPanel() {
        const div = document.getElementById('info');
        div.style.display = 'none';
        div.firstElementChild.textContent = "";
    }
}
