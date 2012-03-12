/* game board */
function GameBoard(parentid, bokehparentid, rows, cols) {
    $this = this;
    
    this.parentid = parentid;
    this.parentnode = null;
    
    // array in format
    // arr[xpos][ypos] -> Sphere()
    this.spheres = {};
    
    this.rows = rows;
    this.cols = cols;
    
    // default sphere radius
    this.radius = '40px';
    
    this.spherecontainer = null;
    this.selectedspheres = [];
    this.scorebox = null;
    this.bokeh = null;
    this.blocks = null;
    
    /* init */
    this.parentnode = getByID(this.parentid);
    
    // sphere container
    var div = appendElement(this.parentnode, 'div');
    div.id = 'spherecontainer';
    this.spherecontainer = div;
    addClass(div, 'circles');
    addClass(div, 'style1');
    
    // init score box
    this.scorebox = new Scorebox(this.parentnode);
    
    // init bokeh
    this.bokeh = new BokehBG(bokehparentid);
    
    // creditz
    var omgmec = appendElement(this.parentnode, 'div');
    var omgme = appendElement(omgmec, 'h1');
    omgmec.id = 'omgme';
    omgme.innerHTML = "Developed By: Hardeep Singh";
    
    if ( isChrome() ) {
        addClass(omgmec, 'chrome');
    }
    
    // HOLY CRAP BLOCKS
    var blocksc = appendElement(this.parentnode, 'div');
    var blocks = appendElement(blocksc, 'h1');
    blocksc.id = 'blocks';
    blocks.board = this;
    this.blocks = blocks;
    
    GameBoard__uFace(this, 0);
    
    // I hate the highlight scheme required for this assignment -.-
    var stylec = appendElement(this.parentnode, 'div');
    var style = appendElement(stylec, 'h1');
    stylec.id = 'style';
    style.innerHTML = "!!";
    style.board = this;
    
    this.style = style;
    
    if ( isChrome() ) {
        addClass(blocksc, 'chrome');
        addClass(stylec, 'chrome');
    }
    
    this.circles = true; // circles by default
    
    // event to handle switching between circles/blocks
    setEvent(blocks, 'click', function(e) {        
        $board = e.target.board;
        
        var title = getByID('title');
        if ( $board.circles ) {
            // swap to blocks
            title.innerHTML = "Block Breaker <span>EXTREEEEMEEE!</span>";
            
            addClass(title, 'blocks');
            delClass($board.spherecontainer, 'circles');
            delClass($board.bokeh.parentnode, 'circles');
            
            $board.circles = false;
        } else {
            // swap to circles
            title.innerHTML = "Bubble Breaker <span>EXTREEEEMEEE!</span>";
            
            delClass(title, 'blocks');
            addClass($board.spherecontainer, 'circles');
            addClass($board.bokeh.parentnode, 'circles');
            
            $board.circles = true;
        }
    });
    
    this.mystyle = false; // style 1 by default
    
    // even to handle switching between highlight styles
    setEvent(style, 'click', function(e) {
        $board = e.target.board;
        $div = e.target.board.spherecontainer;

        if ( $board.mystyle ) {
            // switch to style 1...as per assignment
            addClass($div, 'style1');
            delClass($div, 'style2');
            
            $board.mystyle = false;
        } else {
            // switch to style 2, my preferred style
            delClass($div, 'style1');
            addClass($div, 'style2');
            
            $board.mystyle = true;
        }
    });
    
    this.start();
}

GameBoard.method('reset', function () {
    /**
     * Reset the game and everything in the scorebox
     */
    for (var x in this.spheres) {
        for (var y in this.spheres[x]) {
            var sDiv = this.spheres[x][y].div;
            deleteElement(sDiv);
            delete this.spheres[x][y];
        }
        
        this.spheres[x] = {};
        delete this.spheres[x];
    }
    this.spheres = {};
    
    GameBoard__uFace(this, 0);
    this.start();
    this.scorebox.reset();
    this.bokeh.reset();
    
    return this;
});

GameBoard.method('checkwin', function () {
    /**
     * Check to see if there are any moves available. Return false iff player
     * can keep going.
     */
    for (var x in this.spheres) {
        for (var y in this.spheres[x]) {
            var s = this.spheres[x][y];
            
            var adj = GameBoard__findAdjacent(s, [], this.spheres, false);
            if ( adj.length > 0 )
                return false;
        }
    }
    
    return true;
});

var GameBoard__handleExisting = function($board) {
    /** 
     * We clicked on the same group, figure out what we should remove from the
     * board if anything. Return number of points (i.e. spheres removed).
     **/

    // list of the bottom most removed sphere from each column
    var bottoms = {};
    var nPoints = $board.selectedspheres.length;

    // find the bottom most sphere per column from the selected ones
    for (var index in $board.selectedspheres) {
        t = $board.selectedspheres[index];
        addClass(t.div, 'hide');

        if ( !(t.x in bottoms) ) {
            bottoms[t.x] = t.y;
        } else if ( bottoms[t.x] < t.y ) {
            bottoms[t.x] = t.y;
        }

        $board.deletesphere(t.x, t.y);
    }

    var findAboveDelta = function(x, y) {
        // shift all the ones above x,y down if needed
        var delta = 1;

        while ( y >= 0 ) {
            y--;
            if ( $board.spheres[x][y] == null ) {
                delta++;
            } 
            else {
                $board.spheres[x][y].moveto(x, y + delta);
                temp = $board.spheres[x][y];
                delete $board.spheres[x][y];
                $board.spheres[x][y + delta] = temp;
            }
        }

        return delta;
    }

    var shiftToSide = function(x, cols) {
        // shift all elements left of empty cols
        var delta = 1;
        
        while ( x < (cols - 1) ) {
            x++;
            if ( getAssocArraySize($board.spheres[x]) == 0 ) {
                delta++;
            } else {
                var y = 0;
                for (y in $board.spheres[x] ) {
                    $board.spheres[x][y].moveto(x - delta, y);
                    temp = $board.spheres[x][y];
                    delete $board.spheres[x][y];
                    $board.spheres[x - delta][y] = temp;   
                }
                
                if ( delta > 1 ) x = x - delta + 1;
                delta = 1;
            }
        }

        return delta;
    }

    // enact gravity + shift
    var mind = -1;
    for (var col in bottoms) {
        var d = findAboveDelta(col, bottoms[col]);
        
        // if delta > $board.rows, then the column is now empty...
        if ( d > $board.rows ) {
            if ( mind == -1 ) mind = col;
        }
    }
    
    if ( mind > -1 ) {
        var s = shiftToSide(mind, $board.cols);
    }
    
    return nPoints;
};

GameBoard.method('finishround', function () {
    /**
     * Mark the round as completed
     **/
    
    this.scorebox.stoptimer();
    
    // create+show the win screen
    var m = new Modal(
        'You Win!', 
        'Congrats, you finished with <strong>' + this.scorebox.totalscore + 'pts!</strong>'
        + '<br /><br />'
        + 'To save your score, please fill in your name below and click <em>Submit Score</em>: <br />'
    );
    
    var txtName = appendElement(m.eContents, "input");
    var divErr = appendElement(m.eContents, "div");
    addClass(txtName, 'usernameinput');
    txtName.focus();
    
    var btnSubmit = m.addbutton('Submit Score');
    var btnNewRound = m.addbutton('New Round');
    m.addbutton('Close');
    
    btnSubmit.board = this;
    btnSubmit.themodal = m;
    btnSubmit.input = txtName;
    btnSubmit.inputErr = divErr;
    btnSubmit.href = '#' + m.hashID;
    btnNewRound.board = this;
    btnNewRound.themodal = m;
    
    // events
    setEvent(btnNewRound, 'click', function(e) {
        // start a new game
        e.target.themodal.hide();
        e.target.board.reset();
    });
    
    setEvent(btnSubmit, 'click', function(e) {
        // submit score if possible
        $input = e.target.input;
        $board = e.target.board;
        $err = e.target.inputErr;
        $modal = e.target.themodal;
        
        // reset err
        $err.innerHTML = "";
        delClass($err, 'error');
        delClass($input, 'error');
        
        var uname = $input.value;
        var score = $board.scorebox.totalscore;
        
        if ( uname.length == 0 ) {
            $err.innerHTML = "Please fill in your name before submitting!";
            addClass($err, 'error');
            addClass($input, 'error');
        } else {
            // submit score, display other top scores
            e.target.href = '#' + $board.scorebox.scoresModal.hashID;            
            Scorebox__displayTopScores($board.scorebox, uname, score);
        }
    });
    
    m.show();
});

var GameBoard__isHighlighted = function(div) {
    /** return true iff the given div is highlighted */
    return hasClass(div, 'highlighted');
}

var GameBoard__findAdjacent = function(n, others, $others, doHighlight) {
    /** 
     * Find adjacent nodes to n with same color and optionally highlight them.
     **/
    
    if ( doHighlight == null ) doHighlight = true;

    if ( n != null ) {
        if ( others == null ) 
            others = [];

        // helpers
        var pushtoarray = function(arr, list) {
            // push contents of list to arr
            for (index in list) {
                arr.push(list[index]);
            }
        };

        var checkOthers = function(side, arr) {
            // if the side is a valid option, is of the same color, and is not
            // already set to be highlighted...recursively find all of its 
            // adjacent nodes too
            if ( side != null ) {
                if ( side.color == n.color && !GameBoard__isHighlighted(side.div) ) {
                    arr.push(side);
                    
                    if ( doHighlight ) {
                        addClass(side.div, 'highlighted');
                        addClass(side.div, 'bleft');
                        addClass(side.div, 'bright');
                        addClass(side.div, 'btop');
                        addClass(side.div, 'bbot');
                    }
                    else {
                        // assume that if doHighlight is false, we just want to
                        // find at least one adjacent node
                        return arr;
                    }
                    
                    pushtoarray(arr, GameBoard__findAdjacent(side, [], $others, doHighlight));
                }
            }

            return arr;
        }

        // check bounds, then check each available side
        var checkForOthersAt = function(x, y, others) {
            // check to see if a node should exist at the given x, y coords
            // then check for its neighbours
            if ( x in $others ) {
                if ( y in $others[x] ) {
                    others = checkOthers($others[x][y], others);
                }
            }

            return others;
        }
        
        others = checkForOthersAt(n.x - 1, n.y, others); //left       
        others = checkForOthersAt(n.x + 1, n.y, others); //right
        others = checkForOthersAt(n.x, n.y - 1, others); //top
        others = checkForOthersAt(n.x, n.y + 1, others); //bot
    }

    return others;
};

var GameBoard__selectAdjacent = function($sphere, $board, $others) {
    /**
     * Select the new set of items, and remove the old selection
     **/

    for (var index in $board.selectedspheres) {
        t = $board.selectedspheres[index];
        delClass(t.div, 'highlighted');
        delClass(t.div, 'bleft');
        delClass(t.div, 'bright');
        delClass(t.div, 'btop');
        delClass(t.div, 'bbot');
    }

    var adj = GameBoard__findAdjacent($sphere, [], $others);

    if ( adj.length > 0 ) {
        // fuuuuuuuuuuuuuu
        // https://csc.cdf.toronto.edu/bb/YaBB.pl?num=1328626415 :(
        
        // remove unneeded borders
        for (var i in adj) {
            var n = adj[i];
            
            if ( (n.x - 1) in $others && (n.y) in $others ) {
                var oLeft = $others[n.x - 1][n.y];
                if ( oLeft && n.color == oLeft.color ) { delClass(n.div, 'bleft'); }
            }
            
            if ( (n.x + 1) in $others && (n.y) in $others ) {
                var oRight = $others[n.x + 1][n.y];
                if ( oRight && n.color == oRight.color ) { delClass(n.div, 'bright'); }
            }
            
            if ( (n.x) in $others && (n.y - 1) in $others ) {
                var oTop = $others[n.x][n.y - 1];
                if ( oTop && n.color == oTop.color ) { delClass(n.div, 'btop'); }
            }
            
            if ( (n.x) in $others && (n.y + 1) in $others ) {
                var oBot = $others[n.x][n.y + 1];
                if ( oBot && n.color == oBot.color ) { delClass(n.div, 'bbot'); }
            }
        }
    }

    return adj;
};

var GameBoard__uFace = function($board, pts) {
    /**
     * Set the lil face depending the number of pts/nodes selected
     **/
    
    if ( pts == 0 ) {
        $board.blocks.innerHTML = ":'(";
    } else if ( pts <= 2 ) {
        $board.blocks.innerHTML = ':(';
    } else if ( pts <= 4 ) {
        $board.blocks.innerHTML = ':|';
    } else if ( pts <= 7 ) {
        $board.blocks.innerHTML = ':)';
    } else {
        $board.blocks.innerHTML = ':D';
    }
}

var GameBoard_event_onClickSphere = function(e) {
    /**
     * Event handle for when a user clicks on a sphere.
     * 
     * If they click on an existing valid selection, we remove it from the board
     * and award points. Otherwise we remove previous highlight if any and then
     * select the new set, if valid.
     **/
    $sphere = e.target.sphere;
    $board = e.target.board;
    $others = $board.spheres;

    // remove previous highlighted nodes, unless we clicked on one
    // of them
    var existing = $board.selectedspheres.indexOf($sphere);

    if ( existing > -1 ) {
        var nPoints = GameBoard__handleExisting($board);
        
        $board.scorebox.updateselection(0);
        $board.scorebox.addscore(nPoints);
        GameBoard__uFace($board, 0);

        // check for win
        if ( $board.checkwin() ) {
            $board.finishround();
        }
    } else {
        var adj = GameBoard__selectAdjacent($sphere, $board, $others);
        
        $board.selectedspheres = adj;
        $board.scorebox.updateselection(adj.length);

        GameBoard__uFace($board, adj.length);
    }
};

GameBoard.method('deletesphere', function (x, y) {
    /**
     * Delete the sphere at the given location x/y
     **/
    
    var t = this.spheres[x][y];
    delete this.spheres[x][y];
    deleteElement(t.div);
});

var GameBoard_event_onClickNewGame = function(e) {
    /**
     * Event handler for when the user clicks to start a new game.
     **/
    $board = e.target.board;
    
    $board.reset();
};

GameBoard.method('start', function () {
    /**
     * Start the game! :o
     **/
    
    // create all the spheres!
    id = 0;
    for (x = 0; x < this.cols; x++) {
        this.spheres[x] = {};
        
        for (y = 0; y < this.rows; y++) {
            // create sphere
            this.spheres[x][y] = new Sphere(
                this.spherecontainer, 
                this.radius, x, y, 
                Math.floor((Math.random() * 5)) % 5);
                
            var spherediv = this.spheres[x][y].create();
            this.spheres[x][y].o.board = this;
            this.spheres[x][y].div.board = this;
            spherediv.id = id;
            id++;
                
            // set its on-click event
            setEvent(spherediv, 'click', GameBoard_event_onClickSphere);
        }
    }
    
    // set new game event
    setEvent(this.scorebox.btnNewGame, 'click', GameBoard_event_onClickNewGame);
    this.scorebox.btnNewGame.board = this;
    
    return this;
});