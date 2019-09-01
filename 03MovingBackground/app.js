/*      Goals
 *
 *      1. << DONE >> Display flash screen
 *      2. << DONE >> Listen to clicks
 *      3. Make bird seem moving by scrolling road
 *      4. Scroll background with different speed than road for paralax effect
 *
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
    }
}

Floor.prototype.srcImage = images;
Floor.prototype.posOnSrc = new Vec(276, 0);
Floor.prototype.sizeOnSrc = new Vec(224, 14);
Floor.prototype.size = new Vec(224, 14);
Floor.prototype.speed = new Vec(-60, 0);
Floor.prototype.resetPos = new Vec(447, canvasHeight - 112);

Floor.prototype.getType = function() {
    return "floor";
}

Floor.prototype.update = function(time) {
    let newPos = this.pos.plus(this.speed.times(time));

    if(newPos.x + this.size.x < 0) newPos = this.resetPos;

    return new Floor(newPos);
}


//*******************************************************************************************************************************
// city

var City = class City {
    constructor(pos) {
        this.pos = pos;
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
// the state class will contain the status of the game and the list of actors used by the game

var State = class State {

    constructor(status, backgrounds, actors) {
        this.status = status;
        this.actors = actors;
        this.backgrounds = backgrounds;
    }  

    static start() {
        return new State("splash", [], []);
    }

}


State.prototype.update = function(time) {
    
    let backgrounds = this.backgrounds.map(background => {
        if(["floor", "city"].includes(background.getType())) background = background.update(time);
        return background;
    });

    let newState = new State(this.status, backgrounds, this.actors);

    return newState;
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
        this.cx.drawImage(
            actor.srcImage,
            actor.posOnSrc.x, actor.posOnSrc.y, actor.sizeOnSrc.x, actor.sizeOnSrc.y,
            actor.pos.x, actor.pos.y, actor.size.x, actor.size.y
        );
    }
};

CanvasDisplay.prototype.drawBackground = function(backgrounds) {
    for (let bg of backgrounds) {
        this.cx.drawImage(
            bg.srcImage,
            bg.posOnSrc.x, bg.posOnSrc.y, bg.sizeOnSrc.x, bg.sizeOnSrc.y,
            bg.pos.x, bg.pos.y, bg.size.x, bg.size.y
        );
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
    constructor(srcImage, posOnSrc, sizeOnSrc, pos, size) {
        this.srcImage = srcImage;

        this.posOnSrc = posOnSrc;
        this.sizeOnSrc = sizeOnSrc;

        this.pos = pos;
        this.size = size;
    }
}

Actor.prototype.getType = function() {
    return "actor";
}

Actor.prototype.size = new Vec(1, 1);


//*******************************************************************************************************************************
// the Actor class. for now I will be using this for all ingame objects and will separate them later on if there is a need to separate them

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
            state = new State("game", state.backgrounds, state.actors);
        break;
        case "game":
            state = new State("score", state.backgrounds, state.actors);
        break;
        case "score":
            state = new State("splash", state.backgrounds, state.actors);
        break;
    }
}


function runGame(Display) {
    console.log("start");

    let display = new Display(document.body);
    state = State.start();
    window.addEventListener("mousedown", onpress);

    let city1 = new City(new Vec(0, canvasHeight - 232));
    let city2 = new City(new Vec(275, canvasHeight - 232));
    let city3 = new City(new Vec(550, canvasHeight - 232));
    let ground = new Actor(images, new Vec(276, 14), new Vec(224, 98), new Vec(0, canvasHeight - 98), new Vec(canvasWidth, 98));
    let floor1 = new Floor(new Vec(0, canvasHeight - 112));
    let floor2 = new Floor(new Vec(224, canvasHeight - 112));
    let floor3 = new Floor(new Vec(448, canvasHeight - 112));
    let getReady = new Actor(images, new Vec(118, 310), new Vec(174, 44), new Vec(Math.floor(canvasWidth / 2) - 87, canvasHeight / 5), new Vec(174, 44));
    let instruction = new Actor(images, new Vec(0, 228), new Vec(118, 120), new Vec(Math.floor(canvasWidth / 2) - 60,(canvasHeight / 5) + 66), new Vec(118, 120));
    let player = new Actor(images, new Vec(312, 230), new Vec(34, 24), new Vec(Math.floor(canvasWidth / 8), Math.floor((canvasHeight - 112) / 2) - 12), new Vec(34, 24));
            
    state.backgrounds.push(city1);
    state.backgrounds.push(city2);
    state.backgrounds.push(city3);
    state.backgrounds.push(ground);
    state.backgrounds.push(floor1);
    state.backgrounds.push(floor2);
    state.backgrounds.push(floor3);
    state.backgrounds.push(getReady);
    state.backgrounds.push(instruction);
    state.actors.push(player);
    
    runAnimation(time => {
    
        state = state.update(time);
        display.syncState(state);
        
    });

    console.log("end");
}