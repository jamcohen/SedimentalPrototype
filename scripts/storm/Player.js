
var numPlayers = 0;
function Player(xPos, yPos, tag){
    this.sprite = game.add.sprite(xPos, yPos, 'player');
    this.sprite.width = 25;
    this.sprite.height = 25;
    this.tag = tag;
    
    this.maxSpeed = 500;
    this.cooldown = 1000;
    
    this.ruler = new Ruler(this.sprite, 300); //slice ruler
    this.ruler2 = new Ruler(this.sprite, 500); //launch ruler
    

    game.physics.p2.enable(this.sprite, Phaser.Physics.P2JS);
    this.sprite.body.fixedRotation = true;
    this.sprite.body.bounce = new Phaser.Point(0,0);
    
    
    this.onGround = false;
    this.sliceCooldown = true;
    this.thrustCooldown = true;
    
    game.input.gamepad.start();
    switch(numPlayers){
        case 0:
            this.pad = game.input.gamepad.pad1;
            break;
        case 1:
            this.pad = game.input.gamepad.pad2;
            break;
        case 2:
            this.pad = game.input.gamepad.pad3;
            break;
        case 3:
            this.pad = game.input.gamepad.pad4;
    }
    
    this.pad.addCallbacks(this, { onConnect: function(){console.log(this)}});
    this.xIsDown = false;
    this.bIsDown = false;
    numPlayers++;
}

Player.prototype.update = function(){
    //console.log(game.input.gamepad.supported, game.input.gamepad.active, game.input.gamepad.pad1.connected);
    //jump
    if(this.pad.isDown(Phaser.Gamepad.PS3XC_X) && this.canJump()){
        this.sprite.body.moveUp(300);
       // this.sprite.body.velocity.y -= 150;
    }
    
    //movement
    if(!this.pad.isDown(Phaser.Gamepad.PS3XC_SQUARE) && !this.pad.isDown(Phaser.Gamepad.PS3XC_CIRCLE)){
        if(this.pad.isDown(Phaser.Gamepad.PS3XC_DPAD_UP) || this.pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_Y) < -0.1){
            //this.sprite.body.velocity.y -= 20;
        }
        if(this.pad.isDown(Phaser.Gamepad.PS3XC_DPAD_DOWN) || this.pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_Y) > 0.1){
            this.sprite.body.velocity.y += 7.5;
        }
        if(this.pad.isDown(Phaser.Gamepad.PS3XC_DPAD_LEFT) || this.pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_X) < -0.1){
            this.sprite.body.velocity.x -= 7.5;
        }else if(this.pad.isDown(Phaser.Gamepad.PS3XC_DPAD_RIGHT) || this.pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_X) > 0.1){
            this.sprite.body.velocity.x += 7.5;
        }else{
            this.sprite.body.velocity.x *= 0.90;
        }

        if(this.sprite.body.velocity.x > this.maxSpeed){
            this.sprite.body.velocity.x = this.maxSpeed;
        }
    }else{
        this.sprite.body.velocity.x *= 0.96;
    }
    
    //thrusting
    if (this.pad.justPressed(Phaser.Gamepad.PS3XC_TRIANGLE) && this.thrustCooldown) {
        var x = this.pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_X);
        var y = this.pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_Y);
        console.log("LS X Y : ", x, " ", y);
        if (x == false && y == false) ;//do nothing ; Left stick not moving
        else {
            this.ruler.updateLine(x,y);

            game.time.events.add(2000, this.canThrust, this); // 2 second cooldown
            var angle = this.ruler.getAngle(x,y);
           // console.log("Rotation: ", this.sprite.rotation);
            console.log("Angle: " , angle);
           // this.sprite.rotation = angle; //rotate outer box
            this.sprite.body.angle = angle; //rotate inner box
            this.sprite.body.thrust(25000);
            this.thrustCooldown = false;
            game.time.events.add(500, this.rotateNormal, this);
        }
            
    }
    
    //cutting (resets color to neutral)
    if(this.pad.isDown(Phaser.Gamepad.PS3XC_SQUARE) && this.sliceCooldown){
        var x = this.pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_X);
        var y = this.pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_Y);
        this.ruler.updateLine(x,y);
        
        this.xIsDown = true;
    }else if(this.xIsDown && this.sliceCooldown){  
            game.time.events.add(1000, this.canSlice, this);
            this.ruler.slice();
            this.ruler.clear();
            this.xIsDown = false; 
            this.sliceCooldown = false;   
    }else{
        this.ruler.clear();
        this.xIsDown = false;
    }
    
    // launching (sets color according to player)
    if (this.pad.isDown(Phaser.Gamepad.PS3XC_CIRCLE)) {
        var x = this.pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_X);
        var y = this.pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_Y);
        this.ruler2.updateLine(x,y);
        this.bIsDown = true;
    } else if (this.bIsDown) {
        this.ruler2.launch(this.tag);
        this.ruler2.clear();
        this.bIsDown = false;
    }else {
        this.ruler2.clear();
        this.bIsDown = false;
    }
}
//end of update

Player.prototype.canJump = function(){
    var yAxis = p2.vec2.fromValues(0, 1);
    var result = false;

    for (var i=0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++)
    {
        var c = game.physics.p2.world.narrowphase.contactEquations[i];
        if (c.bodyA === this.sprite.body.data || c.bodyB === this.sprite.body.data)
        {
            var d = p2.vec2.dot(c.normalA,yAxis); // Normal dot Y-axis
            //console.log(i, c.bi, c);
            if (c.bodyA === this.sprite.body.data) d *= -1;
            if (d > 0.5) result = true;
        }
    }
    
    return result;

}

Player.prototype.canSlice = function(){
    this.sliceCooldown = true;   
    return this.sliceCooldown;
}

Player.prototype.canThrust = function(){
    this.thrustCooldown = true;
    return this.thrustCooldown;
}

Player.prototype.rotateNormal = function(){
    this.sprite.body.angle = 0;   
}