
/* sphere object */
function Sphere(parentnode, radius, x, y, color) {
    $this = this;
    
    this.parentnode = parentnode;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.color = color;
    this.div = null;
    this.o = null;
}

Sphere.method('create', function () {
    /**
     * Create the sphere at its current x/y/color and return the created div
     */
    var div = appendElement(this.parentnode, 'div');
    
    div.sphere = this;
    addClass(div, 'sphere0');
    addClass(div, 'col' + this.x);
    addClass(div, 'row' + this.y);
    
    // add the sphere
    var o = appendElement(div, 'div');
    addClass(o, colors[this.color]);
    o.sphere = this;
    
    this.div = div;
    this.o = o;

    return div;
});

Sphere.method('moveto', function (x, y) {
    /**
     * Move to the new given x/y coordinates
     */
    var div = this.div;
    
    delClass(div, 'col' + this.x);
    delClass(div, 'row' + this.y);
    
    addClass(div, 'col' + x);
    addClass(div, 'row' + y);
    
    this.x = parseInt(x, 10);
    this.y = parseInt(y, 10);

    return this;
});