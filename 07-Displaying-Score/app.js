/*      
 *      Goals
 *
 *      1. << DONE >> Display flash screen
 *      2. << DONE >> Listen to clicks and change state to game if clicked during splash
 *      3. << DONE >> Make bird seem moving by scrolling road
 *      4. << DONE >> Scroll background with different speed than road for paralax effect
 *      5. << DONE >> Make bird fall due to gravity
 *      6. << DONE >> Make bird jump
 *      7. << DONE >> Spawn Pipes
 *      8. << DONE >> Scroll Pipes
 *      9. << DONE >> Die when colliding with floor
 *     10. << DONE >> Die when colliding with ceiling
 *     11. << DONE >> Die when colliding with pipe
 *     12. << DONE >> Change state to score when bird dies
 *     13. Acquire points during game state
 *     14. Display current and highest score during score state
 *     15. Change state to flash if clicked during score state
 */


//*******************************************************************************************************************************
// set the size for the canvas

var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;
if(canvasWidth >= 500) {
    canvasWidth = 320;
    canvasHeight = 480;
}


//*******************************************************************************************************************************
// other important global vars
var state = null, 
    clicked = false;


//*******************************************************************************************************************************
// create an image element which will be the source of all the images needed for the project

var images = document.createElement("img");
images.src = "../img/sheet.png";


//*******************************************************************************************************************************
// the vector class will be used by actors to contain their position, size, speed, etc..

var Vec = class Vec {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    plus(other) {
        return new Vec(this.x + other.x, this.y + other.y);
    }

    times(factor) {
        return new Vec(this.x * factor, this.y * factor);
    }

}


//*******************************************************************************************************************************
// floor

var Floor = class Floor {
    constructor(pos) {
        this.pos = pos;
        this.resetPos = new Vec(447, pos.y);
        this.display = !(pos.x > canvasWidth || pos.x + this.size.x < 0);
    }
}

Floor.prototype.srcImage = images;
Floor.prototype.posOnSrc = new Vec(276, 0);
Floor.prototype.sizeOnSrc = new Vec(224, 14);
Floor.prototype.size = new Vec(224, 14);
Floor.prototype.speed = new Vec(-120, 0);

Floor.prototype.getType = function() {
    return "floor";
}

Floor.prototype.update = function(time) {
    let newPos = this.pos.plus(this.speed.times(time));

    if(newPos.x + this.size.x < 0) newPos = this.resetPos;

    return new Floor(newPos);
}


//*******************************************************************************************************************************
// score

var Score = class Score {
    constructor(pos, score) {
        this.givenPos = pos;
        this.score = score;

        let xOffset = 0;
        let numberSpacing = 2;
        if(score[2] > 0) xOffset = 0;
        else if(score[1] > 0) xOffset = Math.floor((this.numSize.x + numberSpacing) / 2);
        else xOffset = Math.floor((this.numSize.x + numberSpacing) / 2) * 2;

        let numPos = new Vec(this.givenPos.x - xOffset, this.givenPos.y);
        this.nums = [];
        
        this.nums.push({src: new Vec(score[0] * 16, 376), dest: numPos});
        if(score[2] > 0 || score[1] > 0) this.nums.push({src: new Vec(score[1] * 16, 376), dest: numPos.plus(new Vec(-(this.numSize.x + 2) * 1, 0))});
        if(score[2] > 0) this.nums.push({src: new Vec(score[2] * 16, 376), dest: numPos.plus(new Vec(-(this.numSize.x + 2) * 2, 0))});
    }
}

Score.prototype.display = true;
Score.prototype.srcImage = images;
Score.prototype.posOnSrc = new Vec(276, 112);
Score.prototype.sizeOnSrc = new Vec(226, 116);
Score.prototype.numSize = new Vec(14, 20);

Score.prototype.getType = function() {
    return "score";
}

Score.prototype.update = function(time, score) {
    return new Score(this.givenPos, score);
}

Score.prototype.draw = function(cx) {
    this.nums.forEach(bNum => {
        cx.drawImage(
            this.srcImage, 
            bNum.src.x, bNum.src.y, this.numSize.x, this.numSize.y,
            bNum.dest.x, bNum.dest.y, this.numSize.x, this.numSize.y
        );
    });
}


//*******************************************************************************************************************************
// scoreboard

var ScoreBoard = class ScoreBoard {
    constructor(state) {
        this.scores = state.scores;
        this.display = state.status === "score";

        // Best Score
        this.bestScore = new Score(new Vec(this.pos.x + 191, this.pos.y + 74), state.scores.best);

        // Current Score
        this.currentScore = new Score(new Vec(this.pos.x + 191, this.pos.y + 31), state.scores.current);
    }
}

ScoreBoard.prototype.srcImage = images;
ScoreBoard.prototype.posOnSrc = new Vec(276, 112);
ScoreBoard.prototype.sizeOnSrc = new Vec(226, 116);
ScoreBoard.prototype.pos = new Vec(Math.floor(canvasWidth / 2) - 113, 155);
ScoreBoard.prototype.size = new Vec(226, 116);
ScoreBoard.prototype.numXSpacing = 2;
ScoreBoard.prototype.numSize = new Vec(14, 20);

ScoreBoard.prototype.getType = function() {
    return "scoreboard";
}

ScoreBoard.prototype.update = function(time, state) {
    return new ScoreBoard(state);
}

ScoreBoard.prototype.draw = function(cx) {
    // draw score board
    cx.drawImage(
        this.srcImage, 
        this.posOnSrc.x, this.posOnSrc.y, this.sizeOnSrc.x, this.sizeOnSrc.y,
        this.pos.x, this.pos.y, this.size.x, this.size.y
    );

    // draw best score
    this.bestScore.draw(cx);

    // draw current score
    this.currentScore.draw(cx);
}


//*******************************************************************************************************************************
// city

var City = class City {
    constructor(pos) {
        this.pos = pos;
        this.display = !(pos.x > canvasWidth || pos.x + this.size.x < 0);
    }
}

City.prototype.srcImage = images;
City.prototype.posOnSrc = new Vec(0, 0);
City.prototype.sizeOnSrc = new Vec(275, 120);
City.prototype.size = new Vec(275, 120);
City.prototype.speed = new Vec(-10, 0);
City.prototype.resetPos = new Vec(549, canvasHeight - 232);

City.prototype.getType = function() {
    return "city";
}

City.prototype.update = function(time) {
    let newPos = this.pos.plus(this.speed.times(time));

    if(newPos.x + this.size.x < 0) newPos = this.resetPos;

    return new City(newPos);
}


//*******************************************************************************************************************************
// Pipe

var Pipe = class Pipe {
    constructor(pos, placement, scored) {
        this.posOpening = pos;
        let openingY = 80;
        this.placement = placement;
        this.scored = scored;

        let newPos = new Vec(pos.x, 0);
        let size = new Vec(this.sizeHead.x, 0);

        if(placement === "top") {
            newPos.y = 14;
            size.y = pos.y - Math.floor(openingY / 2) - newPos.y;
        } else {
            newPos.y = pos.y + Math.floor(openingY / 2);
            size.y = (canvasHeight - 112) - newPos.y;    
        }

        this.pos = newPos;
        this.size = size;
    }
}

Pipe.prototype.display = true;
Pipe.prototype.speed = new Vec(-120, 0);
Pipe.prototype.srcImage = images;

Pipe.prototype.posOnSrcBody = new Vec(504, 25);
Pipe.prototype.sizeOnSrcBody = new Vec(48, 4);

Pipe.prototype.posOnSrcHead = new Vec(502, 0);
Pipe.prototype.sizeOnSrcHead = new Vec(52, 24);

Pipe.prototype.sizeHead = new Vec(52, 24);
Pipe.prototype.sizeBody = new Vec(48, 4);

Pipe.prototype.getType = function() {
    return "pipe";
}

Pipe.prototype.draw = function(cx) {
    let xOffSetBody = Math.floor((this.sizeHead.x - this.sizeBody.x) / 2);

    let posHead = Object.create(null), 
        posBody = Object.create(null), 
        sizeBody = this.sizeBody;

    posHead.x = this.pos.x;
    posBody.x = this.pos.x;    
    
    cx.save();
    if(this.placement === "top") {
        posHead.y = this.pos.y + this.size.y - this.sizeHead.y;
        posBody.y = this.pos.y;
        sizeBody.y = posHead.y - posBody.y;
        
        cx.translate(0, posHead.y + (this.sizeHead.y / 2));
        cx.scale(1, -1);
        cx.translate(0, -(posHead.y + (this.sizeHead.y / 2)));
    } else {
        posHead.y = this.pos.y;
        posBody.y = posHead.y + this.sizeHead.y;
        sizeBody.y = canvasHeight - 112 - posBody.y;
    }

    cx.drawImage(
        this.srcImage, 
        this.posOnSrcHead.x, this.posOnSrcHead.y, this.sizeOnSrcHead.x, this.sizeOnSrcHead.y, // CONSTANT
        posHead.x, posHead.y, this.sizeHead.x, this.sizeHead.y
    );
    cx.restore();

    cx.drawImage(
        this.srcImage,
        this.posOnSrcBody.x, this.posOnSrcBody.y, this.sizeOnSrcBody.x, this.sizeOnSrcBody.y,
        posBody.x + xOffSetBody, posBody.y, sizeBody.x, sizeBody.y
    );
}

Pipe.prototype.update = function(time) {
    return new Pipe(this.posOpening.plus(this.speed.times(time)), this.placement, this.scored);
}


//*******************************************************************************************************************************
// bird/player

var Bird = class Bird {
    constructor(pos, speed) {
        this.pos = pos;
        this.speed = speed;
    }
    static create(pos) {
        return new Bird(pos, new Vec(0, 0));
    }
}

Bird.prototype.display = true;
Bird.prototype.srcImage = images;
Bird.prototype.posOnSrc = new Vec(312, 230);
Bird.prototype.sizeOnSrc = new Vec(34, 24);
Bird.prototype.size = new Vec(34, 24);
Bird.prototype.gravity = new Vec(0, 15);
Bird.prototype.jumpSpeed = new Vec(0, -276);

Bird.prototype.getType = function() {
    return "bird";
}

Bird.prototype.jump = function() {
    return this.jumpSpeed;
}

Bird.prototype.update = function(time) {
    let pos = this.pos;
    let speed = this.speed;
    
    if(state.status == "game") {
        if(clicked) {
            speed = this.jump();
            clicked = false;
        } 
        speed = speed.plus(this.gravity);
        pos = pos.plus(speed.times(time))
    }
    
    return new Bird(pos, speed);
}


//*******************************************************************************************************************************
// the state class will contain the status of the game and the list of actors used by the game

var State = class State {

    constructor(status, backgrounds, actors, pipeSpawn, scores) {
        this.status = status;
        this.actors = actors;
        this.backgrounds = backgrounds;
        this.pipeSpawn = pipeSpawn;
        this.scores = scores;
    }  

    static start() {
        return new State("splash", [], [], Object.create(null), {best: [0, 0, 0], current: [0, 0, 0]});
    }

}

State.prototype.update = function(time) {
    let actors = this.actors;
    let pipeSpawn = this.pipeSpawn;
    let status = this.status;
    let newScores = this.scores;
    let limitY = 110;
    let upperGroundY = 14;
    let player = null;

    let backgrounds = this.backgrounds.map(background => {
        if(["actor", "city", "scoreboard"].includes(background.getType())) background = background.update(time, this);
        if(["score"].includes(background.getType())) background = background.update(time, state.scores.current);
        return background;
    });

    actors = actors.map(actor => {
        //update all actors
        if(["bird", "pipe", "floor"].includes(actor.getType())) actor = actor.update(time, this);

        // asign bird to player
        if(actor.getType() === "bird") player = actor;

        // after pipe and bird is updated check the pipe of already passed the bird and increment score
        if(["pipe"].includes(actor.getType())) {
            if(actor.scored === false && actor.posOpening.x + actor.size.x + 3 < player.pos.x) {
                actor = new Pipe(actor.posOpening, actor.placement, true);
                // increment current score
                newScores.current[0]+= .5;
                if(newScores.current[0] === 10) {
                    newScores.current[0] = 0;
                    newScores.current[1]++;
                }
                if(newScores.current[1] === 10) {
                    newScores.current[1] = 0;
                    newScores.current[2]++;
                }
                // update best score if current is higher
                if(newScores.current[0] + (newScores.current[1] * 10) + (newScores.current[2] * 100)  > newScores.best[0]+ (newScores.best[1]*10)+ (newScores.best[2]*100)) newScores.best = newScores.current;
            }
        }

        return actor;
    });

    if(this.status === "game") {
        
        pipeSpawn.countDown -= time;
        if(pipeSpawn.countDown <= 0) {
            let multiplier = function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }(5, 8);

            let direction = (function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }(1, 100) % 2 === 0) ? 1 : -1;
            direction = (this.pipeSpawn.lastY - (multiplier * 15) < limitY + upperGroundY) ? 1 : direction;
            direction = (this.pipeSpawn.lastY + (multiplier * 15) > canvasHeight - 112 - limitY) ? -1 : direction;

            let addY = multiplier * 15 * direction;

            let newY = this.pipeSpawn.lastY + addY;

            newY = Math.min(newY, canvasHeight - 112 - limitY);
            newY = Math.max(newY, limitY + upperGroundY);

            actors.push(new Pipe(new Vec(canvasWidth + 100, newY), "top", false));
            actors.push(new Pipe(new Vec(canvasWidth + 100, newY), "bottom", false));

            pipeSpawn.lastY = newY;
            pipeSpawn.countDown = 1.7;
        }
    }
    
    function overlap(actor1, actor2) {
        return actor1.pos.x + actor1.size.x > actor2.pos.x &&
               actor1.pos.x < actor2.pos.x + actor2.size.x &&
               actor1.pos.y + actor1.size.y > actor2.pos.y &&
               actor1.pos.y < actor2.pos.y + actor2.size.y;
    }

    for (let actor of actors) {
        if (actor != player && overlap(actor, player)) {
            status = "score";
        }
    }

    return new State(status, backgrounds, actors, pipeSpawn, newScores);
};


//*******************************************************************************************************************************
// this is the display class which will be in charge of displaying the canvas everything on it

var CanvasDisplay = class CanvasDisplay {
    constructor(parent) {
        this.canvas = document.createElement("canvas");

        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.canvas.style.border = "1px solid #000";
        
        parent.appendChild(this.canvas);
        
        this.cx = this.canvas.getContext("2d");
    }

    clear() {
        this.canvas.remove();
    }
}

CanvasDisplay.prototype.drawActors = function(actors) {
    for (let actor of actors) {
        if(actor.display) {
            if(["pipe"].includes(actor.getType())) {
                actor.draw(this.cx);
            } else {
                this.cx.drawImage(
                    actor.srcImage,
                    actor.posOnSrc.x, actor.posOnSrc.y, actor.sizeOnSrc.x, actor.sizeOnSrc.y,
                    actor.pos.x, actor.pos.y, actor.size.x, actor.size.y
                );
            }
        }
    }
};

CanvasDisplay.prototype.drawBackground = function(backgrounds) {
    for (let bg of backgrounds) {
        if(bg.display) {
            if(["scoreboard", "score"].includes(bg.getType())) {
                bg.draw(this.cx);
            } else {
                this.cx.drawImage(
                    bg.srcImage,
                    bg.posOnSrc.x, bg.posOnSrc.y, bg.sizeOnSrc.x, bg.sizeOnSrc.y,
                    bg.pos.x, bg.pos.y, bg.size.x, bg.size.y
                );
            }
        }
    }
};

CanvasDisplay.prototype.clearDisplay = function(status) {
    this.cx.fillStyle = "rgb(112, 197, 207)";
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

CanvasDisplay.prototype.syncState = function(state) {
    this.clearDisplay(state.status);
    this.drawBackground(state.backgrounds);
    this.drawActors(state.actors);
};


//*******************************************************************************************************************************
// the Actor class. for now I will be using this for all ingame objects and will separate them later on if there is a need to separate them

var Actor = class Actor {
    constructor(srcImage, posOnSrc, sizeOnSrc, pos, size, displayCondition, state) {
        this.srcImage = srcImage;

        this.posOnSrc = posOnSrc;
        this.sizeOnSrc = sizeOnSrc;

        this.pos = pos;
        this.size = size;

        this.displayCondition = displayCondition;
        this.display = displayCondition(state);    
    }
}

Actor.prototype.update = function(time, state) {
    return new Actor(this.srcImage, this.posOnSrc, this.sizeOnSrc, this.pos, this.size, this.displayCondition, state);
}

Actor.prototype.getType = function() {
    return "actor";
}

Actor.prototype.size = new Vec(1, 1);


//*******************************************************************************************************************************
// other important functions

function runAnimation(frameFunc) {
    let lastTime = null;
    function frame(time) {
        if (lastTime != null) {
            let timeStep = Math.min(time - lastTime, 100) / 1000;
            if (frameFunc(timeStep) === false) return;
        }
        lastTime = time;
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

function onpress(event) {
    switch(state.status) {
        case "splash":
            let pipeSpawn = state.pipeSpawn;
            pipeSpawn.countDown = .3;
            pipeSpawn.lastY = Math.floor((canvasHeight - 112) / 2);
            clicked = true;
            state = new State("game", state.backgrounds, state.actors, pipeSpawn, state.scores);
        break;
        case "game":
            clicked = true;
            state = new State(state.status, state.backgrounds, state.actors, state.pipeSpawn, state.scores);
        break;
        case "score":
            state = new State("splash", state.backgrounds, state.actors, state.pipeSpawn, {best: state.scores.best, current: [0, 0, 0]});
        break;
    }
}

function runGame(Display) {
    console.log("start");

    let display = new Display(document.body);
    state = State.start();
    window.addEventListener("mousedown", onpress);

    // BACKGROUND IMAGES
    // ground
    state.backgrounds.push(new Actor(images, new Vec(276, 14), new Vec(224, 98), new Vec(0, canvasHeight - 98), new Vec(canvasWidth, 98), function() { return true; }, state));
    // city
    state.backgrounds.push(new City(new Vec(0, canvasHeight - 232))); // city bg
    state.backgrounds.push(new City(new Vec(275, canvasHeight - 232))); // city bg
    state.backgrounds.push(new City(new Vec(550, canvasHeight - 232))); // city bg
    // get ready
    state.backgrounds.push(new Actor(images, new Vec(118, 310), new Vec(174, 44), new Vec(Math.floor(canvasWidth / 2) - 87, canvasHeight / 5), new Vec(174, 44), function(state) { return state.status === "splash"; }, state));
    // instruction
    state.backgrounds.push(new Actor(images, new Vec(0, 228), new Vec(118, 120), new Vec(Math.floor(canvasWidth / 2) - 60,(canvasHeight / 5) + 66), new Vec(118, 120), function(state) { return state.status === "splash"; }, state));
    // scoreboard
    state.backgrounds.push(new ScoreBoard(state));
    // score
    state.backgrounds.push(new Score(new Vec(167, 20), state.scores.current));
    // game over
    state.backgrounds.push(new Actor(images, new Vec(118, 272), new Vec(188, 38), new Vec(Math.floor(canvasWidth / 2) - 94, 96), new Vec(188, 38), function(state) { return state.status === "score"; }, state));
    // TODO
    //state.backgrounds.push(currentScore);

    // PLAYER AND OTHER ACTORS
    // floor
    state.actors.push(new Floor(new Vec(0, canvasHeight - 112)));
    state.actors.push(new Floor(new Vec(224, canvasHeight - 112)));
    state.actors.push(new Floor(new Vec(448, canvasHeight - 112)));
    // ceiling
    state.actors.push(new Floor(new Vec(0, 0)));
    state.actors.push(new Floor(new Vec(224, 0)));
    state.actors.push(new Floor(new Vec(448, 0)));
    // player
    state.actors.push(Bird.create(new Vec(Math.floor(canvasWidth / 8), Math.floor((canvasHeight - 112) / 2) - 12)));    

    runAnimation(time => {
    
        state = state.update(time);
        display.syncState(state);
        
    });

    console.log("end");
}