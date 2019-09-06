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
 *     12. << DONE >>Change state to score when bird dies
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
// Pipe

var Pipe = class Pipe {
    constructor(pos, placement) {
        this.posOpening = pos;
        let openingY = 80;
        this.placement = placement;

        let newPos = new Vec(pos.x, 0);
        let size = new Vec(this.sizeHead.x, 0);

        if(placement === "top") {
            newPos.y = 0;
            size.y = pos.y - Math.floor(openingY / 2) - this.sizeHead.y - newPos.y;
        } else {
            newPos.y = pos.y + Math.floor(openingY / 2);
            size.y = (canvasHeight - 112) - newPos.y;    
        }

        this.pos = newPos;
        this.size = size;
    }
}

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
        posHead.y = this.pos.y + this.size.y;
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
    return new Pipe(this.posOpening.plus(this.speed.times(time)), this.placement);
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

    constructor(status, backgrounds, actors, pipeSpawn) {
        this.status = status;
        this.actors = actors;
        this.backgrounds = backgrounds;
        this.pipeSpawn = pipeSpawn;
    }  

    static start() {
        return new State("splash", [], [], Object.create(null));
    }

}

State.prototype.update = function(time) {
    let actors = this.actors;
    let pipeSpawn = this.pipeSpawn;
    let status = this.status;

    let backgrounds = this.backgrounds.map(background => {
        if(["floor", "city"].includes(background.getType())) background = background.update(time);
        return background;
    });

    actors = actors.map(actor => {
        if(["bird", "pipe", "floor"].includes(actor.getType())) actor = actor.update(time);
        return actor;
    });

    let player = actors.find(a => a.getType() == "bird");

    if(this.status === "game") {
        
        pipeSpawn.countDown -= time;
        if(pipeSpawn.countDown <= 0) {
            let multiplier = function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }(5, 8);

            let direction = (function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }(1, 100) % 2 === 0) ? 1 : -1;
            direction = (state.pipeSpawn.lastY - (multiplier * 15) < 80) ? 1 : direction;
            direction = (state.pipeSpawn.lastY + (multiplier * 15) > canvasHeight - 112 - 80) ? -1 : direction;

            let addY = multiplier * 15 * direction;

            let newY = state.pipeSpawn.lastY + addY;

            newY = Math.min(newY, canvasHeight - 112 - 80);
            newY = Math.max(newY, 80);

            actors.push(new Pipe(new Vec(canvasWidth + 100, newY), "top"));
            actors.push(new Pipe(new Vec(canvasWidth + 100, newY), "bottom"));

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
            console.log();
            status = "score";
        }
    }

    return new State(status, backgrounds, actors, pipeSpawn);;
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
        if(actor.getType() === "pipe") {
            actor.draw(this.cx);
        } else {
            this.cx.drawImage(
                actor.srcImage,
                actor.posOnSrc.x, actor.posOnSrc.y, actor.sizeOnSrc.x, actor.sizeOnSrc.y,
                actor.pos.x, actor.pos.y, actor.size.x, actor.size.y
            );
        }
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
            state = new State("game", state.backgrounds, state.actors, pipeSpawn);
        break;
        case "game":
            clicked = true;
            state = new State(state.status, state.backgrounds, state.actors, state.pipeSpawn);
        break;
        case "score":
            state = new State("splash", state.backgrounds, state.actors, state.pipeSpawn);
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
    let floor4 = new Floor(new Vec(0, 0));
    let floor5 = new Floor(new Vec(224, 0));
    let floor6 = new Floor(new Vec(448, 0));
    let getReady = new Actor(images, new Vec(118, 310), new Vec(174, 44), new Vec(Math.floor(canvasWidth / 2) - 87, canvasHeight / 5), new Vec(174, 44));
    let instruction = new Actor(images, new Vec(0, 228), new Vec(118, 120), new Vec(Math.floor(canvasWidth / 2) - 60,(canvasHeight / 5) + 66), new Vec(118, 120));
    let player = Bird.create(new Vec(Math.floor(canvasWidth / 8), Math.floor((canvasHeight - 112) / 2) - 12));

    state.backgrounds.push(city1);
    state.backgrounds.push(city2);
    state.backgrounds.push(city3);
    state.backgrounds.push(ground);
    state.backgrounds.push(getReady);
    state.backgrounds.push(instruction);
    state.actors.push(player);
    state.actors.push(floor1);
    state.actors.push(floor2);
    state.actors.push(floor3);
    state.actors.push(floor4);
    state.actors.push(floor5);
    state.actors.push(floor6);

    runAnimation(time => {
    
        state = state.update(time);
        display.syncState(state);
        
    });

    console.log("end");
}