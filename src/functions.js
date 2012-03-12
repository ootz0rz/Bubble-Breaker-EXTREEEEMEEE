/* tools and other randomness */

/**
 * Shortcut to get an element by its ID
 **/
var getByID = function(eID) {
    return document.getElementById(eID);
}

/**
 * Shortcut to get all elements with the given class.
 * 
 * If the element parent is given, search under that as root.
 **/
var getByClass = function(eClass, parent) {    
    if ( parent == null ) parent = document;
    return parent.getElementsByClassName(eClass);
}

/**
 * Shortcut to create an element
 **/
var createElement = function(eType) {
    return document.createElement(eType);
}

/**
 * Delete the node n from its parent
 **/
var deleteElement = function(n) {
    n.parentNode.removeChild(n);
}

/**
 * Given an element n, append e to n.
 **/
var appendToNode = function(n, e) {
    n.appendChild(e);
}

/**
 * Shortcut to create an element and append to a node n
 **/
var appendElement = function(n, eType) {
    var newEl = document.createElement(eType);
    appendToNode(n, newEl);
    
    return newEl;
}

/**
 * Shortcut to create an element and append to a node with given eID
 **/
var appendElementByID = function(eID, eType) {
    var newEl = document.createElement(eType);
    appendToNode(getByID(eID), newEl);
    
    return newEl;
}

/**
 * Given an element n, and class c, add c to n
 **/
var addClass = function(n, c) {
    n.classList.add(c);
}

/**
 * Given an element n, and class c, remove c from n
 **/
var delClass = function(n, c) {
    n.classList.remove(c);
}

/**
 * Check if the given element n contains a class c
 **/
var hasClass = function(n, c) {
    return n.classList.contains(c);
}

/**
 * Given an element n, set it's text to the string given
 **/
var setText = function(n, text) {
    n.innerHTML = text;
}

/**
 * Bind func to element n on event type
 **/
var setEvent = function(n, etype, func) {
    if ( etype == 'click' ) {
        n.onclick = func;
    }
}

/**
 * Given an associative array, get its size
 **/
var getAssocArraySize = function(arr) {
    var len = 0;
    
    for (var k in arr)
        len++;
    
    return len;
}

/**
 * Define a function func as the given name for a class.
 **/
Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

/**
 * True iff the browser is chrome
 */
var isChrome = function() {
    return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
}