var numPlayers = 0;
function Player(xPos, yPos){
    this.sprite = game.add.sprite(xPos, yPos);
    this.sprite.width = 50;
    this.sprite.height = 50;
    
    this.maxSpeed = 500;
    this.ruler = new Ruler(this.sprite);
    
    game.physics.p2.enable(this.sprite, Phaser.Physics.P2JS, true);
    this.sprite.body.fixedRotation = true;
    this.sprite.body.bounce = new Phaser.Point(0,0);
    
    
    this.onGround = false;
    
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
    numPlayers++;
}

Player.prototype.update = function(){
    //console.log(game.input.gamepad.supported, game.input.gamepad.active, game.input.gamepad.pad1.connected);
    //jump
    if(this.pad.isDown(Phaser.Gamepad.XBOX360_A) && this.canJump()){
        this.sprite.body.velocity.y -= 250;
    }
    
    //movement
    if(!this.pad.isDown(Phaser.Gamepad.XBOX360_X)){
        if(this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_UP) || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -0.1){
            this.sprite.body.velocity.y -= 20;
        }
        if(this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN) || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.1){
            this.sprite.body.velocity.y += 20;
        }
        if(this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1){
            this.sprite.body.velocity.x -= 20;
        }else if(this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1){
            this.sprite.body.velocity.x += 20;
        }else{
            this.sprite.body.velocity.x *= 0.90;
        }

        if(this.sprite.body.velocity.x > this.maxSpeed){
            this.sprite.body.velocity.x = this.maxSpeed;
        }
    }else{
        this.sprite.body.velocity.x *= 0.96;
    }
    
    if(this.pad.isDown(Phaser.Gamepad.XBOX360_X)){
        var x = this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X);
        var y = this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y);
        this.ruler.updateLine(x,y);
        this.xIsDown = true;
    }else if(this.xIsDown){
        this.ruler.slice();
        this.ruler.clear();
        this.xIsDown = false;
    }else{
        this.ruler.clear();
        this.xIsDown = false;
    }
}

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
