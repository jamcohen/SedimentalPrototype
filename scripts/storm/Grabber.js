function Grabber(player){
    Ruler.call(this, player);
    this.player = player;
    this.constraint = null;
    this.grabbedObject = null;
    this.color = 0xFF0000;
    this.doAction = this.grab;
    this.button = Phaser.Gamepad.XBOX360_Y;
    this.restrictMovementIfPressed = false;
    this.length = 300;
    //this.owner.removeChild(this.line);
}

//OnCharge runs every frame while charge is running
Ruler.prototype.onCharge = function(x,y){
    this.updateLine(x,y);
}

Grabber.prototype.onRelease = function(x,y){
    this.grab();
    if(!this.constraint){
        this.endpointX = 0;
        this.endpointY = 0;
        this.line.clear();
    }
}

Grabber.prototype.onPress = function(x,y){
    if(this.constraint != null){
        game.physics.p2.removeConstraint(this.constraint);
        this.constraint = null;
        this.grabbedObject = null;
        this.endpointX = 0;
        this.endpointY = 0;
        this.line.clear();
    }
}

Grabber.prototype.grab = function(){
    if(this.constraint != null){ //return if already grabbing something
        return;
    }
    
    var sliceable = this.rayCastToSliceables(this.length);
    if(sliceable != null){
        this.grabbedObject = sliceable;
        //console.log("GRABBED: ", this.owner.body, sliceable.sprite);
        var dist = distance(sliceable.sprite.x, sliceable.sprite.y, this.owner.x, this.owner.y);
        this.constraint = game.physics.p2.createDistanceConstraint(this.owner, sliceable.sprite, dist);
        this.constraint.upperLimitEnable = true;
        this.constraint.upperLimit = game.physics.p2.pxm(0.5);
    }
}

//TODO: MAKE THIS CALL THE SUPERCLASS'S VERSION OF THIS FUNCTION TO AVOID REPEAT CODE
//x y are numbers between 0 and 1 representing the position of the endpoint of the line
Grabber.prototype.updateLine = function(x, y){
    //if(Math.abs(this.endpointY - y) < 0.01 && Math.abs(this.endpointX - x) < 0.01) return; //if x and y haven't changed return;
    
    this.line.clear();
    
    if(Math.sqrt(x*x+y*y) < 0.5 && !this.grabbedObject) return; //if line length < 0.5 and we aren't grabbing return
    
    //console.log(Math.atan2(y,x));
    
    this.endpointX = x;
    this.endpointY = y;
    
    //console.log(this.grabbedObject.sprite.x, this.grabbedObject.sprite.y);
    
    var lineEndX = this.grabbedObject ? this.grabbedObject.sprite.x : x*this.length+this.owner.x;
    var lineEndY = this.grabbedObject ? this.grabbedObject.sprite.y : y*this.length+this.owner.y;
    
    this.line.lineStyle(3, this.color, 1);
    this.line.moveTo(this.owner.x,this.owner.y);
    this.line.lineTo(lineEndX, lineEndY);
}

Grabber.prototype.update = function(){
    if(this.grabbedObject){
        this.updateLine(0,0);
    }
    var pad = this.player.pad;
    if(pad.isDown(Phaser.Gamepad.XBOX360_A) || pad.isDown(Phaser.Gamepad.XBOX360_X) || pad.isDown(Phaser.Gamepad.XBOX360_B)){
        this.onPress();
    }
}

extend(Ruler, Grabber); //setup Grabber to inherit from ruler