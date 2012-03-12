if (!Date.now) {
    //https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now#Compatibility
    Date.now = function now() {
        return +(new Date);
    };
}

/* scorebox object */
function Scorebox(parentnode) {
    $this = this;
    
    this.parentnode = parentnode;
    this.div = null;
    
    // game controls
    this.dControl = null; 
    this.btnNewGame = null;
    this.btnScores = null;
    
    // score for current selection
    this.dSelectScore = null;
    this.txtCurrentScore = null;
    
    // main container for timer + running score
    this.dMain = null;
    this.txtTimer = null;
    this.timerTimeout = null;
    
    // running total for score
    this.dScore = null;
    this.txtScore = null;
    this.totalscore = 0;
    
    this.scoresurl = '/cgi-bin/topScore.pl';
    
    /* init */    
    // create main container
    this.div = appendElement(this.parentnode, 'div');
    this.div.id = 'scorebox';
    
    // create game controls
    this.dControl = appendElement(this.div, 'div');
    this.dControl.id = 'controls';
    
    // add control buttons
    this.btnNewGame = appendElement(this.dControl, 'a');
    this.btnNewGame.id = 'btnNewGame';
    this.btnNewGame.innerHTML = 'New Game';
    this.btnNewGame.href = '#';
    
    this.btnScores = appendElement(this.dControl, 'a');
    this.btnScores.id = 'btnScores';
    this.btnScores.innerHTML = 'View Scores';
    this.btnScores.href = '#topscores';
    
    // create select score container
    this.dSelectScore = appendElement(this.div, 'div');
    this.dSelectScore.id = 'selectscore';
    
    // text elements
    var title = appendElement(this.dSelectScore, 'h1');
    title.innerHTML = 'Points for Selection';
    
    this.txtCurrentScore = appendElement(this.dSelectScore, 'div');
    this.txtCurrentScore.innerHTML = '0';
    
    // create container for current score and timer
    this.dMain = appendElement(this.div, 'div');
    this.dMain.id = 'timercontainer';
    
    var titleTimer = appendElement(this.dMain, 'h1');
    titleTimer.innerHTML = 'Timer';
    
    this.txtTimer = appendElement(this.dMain, 'div');
    this.txtTimer.id = 'timer';
    this.txtTimer.innerHTML = '-:--';
    this.txtTimer.time = {};
    this.txtTimer.time['start'] = Date.now();
    this.txtTimer.time['dotimer'] = false;
    
    // score running total
    this.dScore = appendElement(this.div, 'div');
    this.dScore.id = 'scorecontainer';
    
    var titleScore = appendElement(this.dScore, 'h1');
    titleScore.innerHTML = 'Score';
    
    this.txtScore = appendElement(this.dScore, 'div');
    this.txtScore.id = 'score';
    this.txtScore.innerHTML = '0';
    
    // view scores modal
    this.scoresModal = new Modal("Top Scores", "No Top Scores Set", "topscores");
    this.scoresModal.addbutton("Close");
    
    // set view score event
    setEvent(this.btnScores, 'click', Scorebox_event_onClickViewScores);
    this.btnScores.Scorebox = this;
    
    this.reset();
}

Scorebox.method('reset', function () {
    /**
     * Reset everything in the scorebox
     */    
    this.stoptimer();
    this.begintimer();
    this.updateselection(0);
    this.setscore(0);
    
    return this;
});

var scorebox_getScore = function(n) {
    /**
     * Get the score as a function of n (n^2), n >= 0. n==0 => 0
     **/
    
    if ( n < 1 ) return 0;
    return Math.pow(n, 2);
};

Scorebox.method('setscore', function (n) {
    /**
     * Set the current score to n
     */
    if ( n != null ) {
        var score = scorebox_getScore(n);
        
        this.totalscore = score;
        this.txtScore.innerHTML = this.totalscore.toString();
    }

    return this;
});

Scorebox.method('addscore', function (n) {
    /**
     * Add n points to the score
     */
    if ( n != null ) {
        var score = scorebox_getScore(n);
        
        this.totalscore = this.totalscore + score;
        this.txtScore.innerHTML = this.totalscore.toString();
    }

    return this;
});

Scorebox.method('stoptimer', function() {
    /**
     * Stop the timer.
     **/
    this.txtTimer.time['dotimer'] = false;
    clearTimeout(this.txtTimer.time['timeout']);
});

Scorebox.method('begintimer', function() {
    /**
     * Start the timer.
     **/    
    this.txtTimer.time = {};
    this.txtTimer.time['start'] = Date.now();
    this.txtTimer.time['dotimer'] = true;
    
    // update timer
    this.txtTimer.time['timeout'] = window.setInterval(scorebox_updateTimer, 200);
});

var padZeroes = function(n) {
    return n < 10 ? '0' + n : n
} 

var scorebox_getTimerString = function(start, now) {
    if ( now == null ) {
        now = Date.now();
    }
    
    if ( start < now ) {
        var elapsed = now - start;
        
        var eDate = new Date(elapsed);
        var hrs = eDate.getUTCHours();
        return (hrs > 0 ? padZeroes(hrs) + ":" : "") + 
            padZeroes(eDate.getUTCMinutes()) + ":" + 
            padZeroes(eDate.getUTCSeconds());
    }
    
    return "0:00";
};

var scorebox_updateTimer = function() {
    /**
     * Update the timer.
     **/
    
    var txtTimer = getByID('timer');
    
    var start = txtTimer.time['start'];
    var now = Date.now();
    
    txtTimer.innerHTML = scorebox_getTimerString(start, now);
}

Scorebox.method('updateselection', function (n) {
    /**
     * Update the score for the current selection based on its size, n
     */
    
    if ( n != null && n > 0 ) {
        var score = scorebox_getScore(n);
        
        this.txtCurrentScore.innerHTML = score.toString();
    } else {
        this.txtCurrentScore.innerHTML = '--';
    }

    return this;
});

var Scorebox_event_onClickViewScores = function(e) {
    $btn = e.target;
    $scorebox = $btn.Scorebox;
    
    Scorebox__displayTopScores($scorebox);
};

var Scorebox__displayTopScores = function($scorebox, iuser, iscore) {
    var scores = $scorebox.gethighscores(iuser, iscore);
    
    if ( scores.length > 0 ) {
        $scorebox.scoresModal.eContents.innerHTML = "";
        
        var scoreContainer = appendElement($scorebox.scoresModal.eContents, 'div');
        scoreContainer.id = "scores";
        
        var title = appendElement(scoreContainer, 'span');
        title.innerHTML = "Here are the current top scores...";
        
        var table = appendElement(scoreContainer, 'table');
        var thead = appendElement(table, 'thead');
        var thtr = appendElement(table, 'tr');
        var thUser = appendElement(table, 'th');
        thUser.innerHTML = "Usernames";
        
        var thScore = appendElement(table, 'th');
        thScore.innerHTML = "Scores";
        
        
        var tbody = appendElement(table, 'tbody');
        for ( var index in scores ) {
            var tr = appendElement(tbody, 'tr');
            
            var user = appendElement(tr, 'td');
            user.innerHTML = scores[index][0];
            
            var score = appendElement(tr, 'td');
            score.innerHTML = scores[index][1];
        }
    }
}

var Scorebox__getScoreString = function(username, score) { 
    return "?name=" + encodeURIComponent(username) + "&score=" + encodeURIComponent(score);
}

Scorebox.method('gethighscores', function (username, score) {
    /**
     * Get the high scores listing as an array:
     * [[username, score], [username2, score2], ...]
     * 
     * Optionally provide a username and score to add.
     */
    var scores = [];
    
    // only send user/score if both are provided
    if ( username == null || score == null ) {
        username = null;
        score = null;
    }
    
    // make a request to our cgi script, get the results, parse into array and
    // return...npnp
    
    var reqType = "GET";
    var reqURL = this.scoresurl;
    
    if ( username != null && score != null ) {
        reqURL = reqURL + Scorebox__getScoreString(username, score);
    }
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", reqURL, false); // not async :o just makes things easier
    
    try {
        xhr.send();
    } catch (e) {
        console.log('ajax err', e);
        
        alert('Error while trying to fetch score data');
    }
    
    if (xhr.readyState == 4)
    {
        var data = xhr.responseText;
        
        if ( xhr.responseText.length == 0 ) {
            data = '';
        }

        // extract user/score pairs with regex from the table
        var reExtract = new RegExp(
            '<tr><td>(.*?)</td><td>(.*?)</td></tr>', 
            'gim');
        
        var matches = null;
        while ( (matches = reExtract.exec(data)) != null ) {            
            scores.push([matches[1], matches[2]]);
        }
    } else {
        alert('Error while trying to fetch score data');
    }
    
    return scores;
});