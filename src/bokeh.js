/* Generate random bokeh bg dawg */
function BokehBG(parentid) {
    this.parentid = parentid;
    this.parentnode = null;
    
    this.numcolors = 5; // bokeh_color_[1,5]
    this.numsizes = 7; // bokeh_size_[1,7]
    this.numanim = 7; // bokeh_anim_[1,5]
    
    // max offset in px
    this.offset_x = screen.width / 5; 
    this.offset_y = screen.height / 5;
    
    // this is the step for the number of points we're going to generate along
    // the curve... at each step we place a random bokeh near the point
    //
    // the smaller this number, the more bokeh.. essentially you get
    // x / res = # of points along the line
    this.res = 25;
    
    // how many frames to spread the animations out over for the base size of
    // a sphere (i.e. size=1)
    this.animlength = 200;
    
    // how many ms to wait between each frame
    this.animrate = 50;
    
    this.bokehs = [];
    
    /* init */
    this.parentnode = getByID(this.parentid);
    this.go();
}

BokehBG.method('reset', function () {
    /**
     * REMAKE all the bokeh!
     */
    
    for (var index in this.bokehs) {
        var cb = this.bokehs[index];
        
        deleteElement(cb);
    }
    
    this.go();
});

BokehBG.method('go', function () {
    /**
     * Make all the bokeh!
     */    
    // the idea is to generate a sine wave stretched across the users monitor
    // display width and height, and then place bokeh elements along it
    // could probably make this code a hell of a lot more efficient...but
    // doesn't really matter much; it takes longer to render everything than it
    // does to make these calcs...
    var x = screen.width;
    var y = screen.height;
    
    var sV = Math.round(x / Math.sin(1), 1);
    
    // Math.sin(p1) (bottom left) p1=4.71238898038469
    // -> to ->
    // Math.sin(p2) (top right) p2=7.853981633974483
    var p1 = 3 * Math.PI / 2;
    var p2 = 5 * Math.PI / 2;
    
    var res = this.res;
    
    var stepsize = (p2 - p1) / x * res;
    var numstep = x / res;
    
    var pts = [];
    var start = p1;
    var xbase = x / numstep;
    var y2 = (y / 2);
    for (var i = 0; i < numstep; i++) {
        var n = [
            xbase * i,
            ((y2 * Math.sin(p1 + (stepsize * i))) - y2) * -1
        ];
        pts.push(n);
    }
    
    this.bokehs = [];
    for (var index in pts) {
        var cp = pts[index];
        var cpx = cp[0];
        var cpy = cp[1];
        
        this.create_at(cpx, cpy);
    }
});

BokehBG.method('create_at', function (x, y) {
    /**
     * Make one bokehs at the given x/y co-ordinates :o
     */
    var b = appendElement(this.parentnode, 'div');
    b.id = 'bokeh_' + x;
    
    addClass(b, 'bokeh');
    
    // choose random color
    var cnum = Math.round(Math.random() * (this.numcolors - 1)) + 1;
    addClass(b, 'bokeh_color_' + cnum);
    
    // choose random size
    var snum = Math.round(Math.random() * (this.numsizes - 1)) + 1;
    addClass(b, 'bokeh_size_' + snum);
    
    // choose random animation
    /* too slow for CDF :( looks really cool though :o
    if ( Math.random() > .5 ) {
        var anum = Math.round(Math.random() * (this.numanim - 1)) + 1;
        addClass(b, 'bokeh_anim_' + anum);
    }
    */
    
    // apply positioning
    var xoff = Math.round(Math.random() * this.offset_x) * 
        (Math.random() > 0.5 ? 1 : -1);
    var yoff = Math.round(Math.random() * this.offset_y) * 
        (Math.random() > 0.5 ? 1 : -1);
    
    b.style.top = Math.round(y + yoff) + "px";
    b.style.left = Math.round(x + xoff) + "px";
    
    this.bokehs.push(b);
});