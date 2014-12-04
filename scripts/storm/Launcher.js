function Launcher(player){
    Ruler.call(this, player);
    this.color = 0xFF0000;
    this.doAction = this.launch;
    this.button = Phaser.Gamepad.XBOX360_B;
    this.restrictMovementIfPressed = true;
    this.length = 150;
}

Launcher.prototype.launch = function(playerTag){
    var sliceable = this.rayCastToSliceables(this.length);
    if(sliceable != null){
        if(!sliceable.sprite.body.kinematic){
            sliceable.tag = playerTag;
        }
        sliceable.draw();
        sliceable.sprite.body.applyForce([-this.endpointX*5000,-this.endpointY*5000], sliceable.sprite.x, sliceable.sprite.y);
    }
}

//OnCharge runs every frame while charge is running
Launcher.prototype.onCharge = function(x,y){
    this.updateLine(x,y);
}

//OnPress runs the frame the ability button is pushed
Launcher.prototype.onPress = function(x,y){
    console.log("pressed");
}

//OnRelease runs the frame the ability button is released
Launcher.prototype.onRelease = function(x,y){
    this.launch(this.playerTag);
    this.endpointX = 0;
    this.endpointY = 0;
    this.line.clear();
}

extend(Ruler, Launcher);