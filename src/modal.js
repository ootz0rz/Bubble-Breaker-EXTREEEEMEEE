/* Create a new modal dialog with the given title and contents */
function Modal(title, contents, hashID) {
    
    this.div = null;
    this.eTitle = null;
    this.eContents = null;
    this.eButtons = null;
    
    this.txttitle = title;
    this.txtcontents = contents;
    this.hashID = hashID;
    
    // true iff the modal window is being displayed
    this.displayed = false;
    
    var generateHash = function(length) {
        // generate a random hex hash of given length
        var h = [];
        for (var i=0; i<length; i++)
            h.push((Math.random()*16|0).toString(16));

        return h.join("");
    };

    /* init */
    if ( hashID == null ) this.hashID = "modal" + generateHash(5);
    if ( this.txttitle == null ) this.txttitle = "";
    if ( this.txtcontents == null ) this.txtcontents = "<br />";
    
    // generate the elements for our modal
    this.div = createElement('div');
    this.div.themodal = this;
    this.div.id = this.hashID;
    addClass(this.div, 'modal');
    
    var container = appendElement(this.div, 'div');
    addClass(container, 'mcontainer');
    
    this.eTitle = appendElement(container, 'h1');
    this.eTitle.innerHTML = this.txttitle;
    
    this.eContents = appendElement(container, 'div');
    addClass(this.eContents, 'mcontent');
    this.eContents.innerHTML = this.txtcontents;
    
    this.eButtons = appendElement(container, 'div');
    addClass(this.eButtons, 'mbuttons');
    
    document.body.appendChild(this.div);
}

Modal.method('addbutton', function (text, link, title) {
    /**
     * Add a button to this window
     */    
    if ( link == null ) link = '#';
    if ( title == null ) title = text;
    
    var btn = appendElement(this.eButtons, 'a');
    btn.href = link;
    btn.title = title;
    btn.innerHTML = text;
    
    return btn;
});

Modal.method('show', function () {
    /**
     * Display this modal window
     */
    location.hash = this.hashID;
    this.displayed = true;
});

Modal.method('hide', function () {
    /**
     * Hide this modal window
     */
    location.hash = '';
    this.displayed = false;
});