function Slicer(player){
    Ruler.call(this, player);
    this.color = 0xFF0000;
    this.button = Phaser.Gamepad.XBOX360_X;
    this.restrictMovementIfPressed = true;
    this.length = 300;
}

Slicer.prototype.slice = function(){
    slice(this.owner.x, this.owner.y, this.endpointX*this.length+this.owner.x, this.endpointY*this.length+this.owner.y); 
}

//OnCharge runs every frame while charge is running
Slicer.prototype.onCharge = function(x,y){
    this.updateLine(x,y);
}

//OnPress runs the frame the ability button is pushed
Slicer.prototype.onPress = function(x,y){
    
}

//OnRelease runs the frame the ability button is released
Slicer.prototype.onRelease = function(x,y){
    this.slice(this.playerTag);
    this.endpointX = 0;
    this.endpointY = 0;
    this.line.clear();
}

extend(Ruler, Slicer);