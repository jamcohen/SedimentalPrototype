var numPlayers = 0;
function Player(xPos, yPos, tag){
    this.sprite = game.add.sprite(xPos, yPos, 'player');
    this.sprite.width = 25;
    this.sprite.height = 25;
    this.tag = tag;
    this.length = 0;
    
    this.maxSpeed = 500;
    
    this.abilities = [];
    
    this.abilities.push(new Slicer(this));
    this.abilities.push(new Launcher(this));
    this.abilities.push(new Grabber(this));
    this.neutralAbility = new Ruler(this);
    this.currentAbility = this.neutralAbility;
    
    game.physics.p2.enable(this.sprite, Phaser.Physics.P2JS);
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
    this.bIsDown = false;
    numPlayers++;
}

Player.prototype.update = function(){
    if(!this.pad.connected) return;
    
    //console.log(game.input.gamepad.supported, game.input.gamepad.active, game.input.gamepad.pad1.connected);
    //jump
    if((this.pad.isDown(Phaser.Gamepad.XBOX360_A) || this.pad.isDown(Phaser.Gamepad.XBOX360_RIGHT_BUMPER)) && this.canJump()){
        this.sprite.body.velocity.y -= 250;
    }
    
    this.updateAbilities();
    
    if(!this.isMovementRestricted()){
        //movement
        if(this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_UP) || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -0.1){
            //this.sprite.body.velocity.y -= 20;
        }
        if(this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN) || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.1){
            this.sprite.body.velocity.y += 15;
        }
        if(this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1){
            this.sprite.body.velocity.x -= 15;
        }else if(this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1){
            this.sprite.body.velocity.x += 15;
        }else{
            this.sprite.body.velocity.x *= 0.90;
        }

        if(this.sprite.body.velocity.x > this.maxSpeed){
            this.sprite.body.velocity.x = this.maxSpeed;
        }
    }else{
        this.sprite.body.velocity.x *= 0.96;
    }
    
    var x = this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X);
    var y = this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y);
    this.currentAbility.onCharge(x, y);
    
    //Only check for new ability presses if there is no currentAbility or the current ability button is not being pressed
    if(this.currentAbility == this.neutralAbility || !this.pad.getButton(this.currentAbility.button).isDown) {
        var nextAbility = this.neutralAbility;
        for(var i=0; i<this.abilities.length; ++i){
            //console.log(this.abilities);
            if(this.pad.getButton(this.abilities[i].button).isDown){
                nextAbility = this.abilities[i];
            }else if(this.currentAbility == this.abilities[i]){
                this.currentAbility.onRelease();
            }
        }
        this.switchCurrentAbility(nextAbility);
        this.currentAbility.updateLine(x, y);
        this.currentAbility.onPress();
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

//ability should be either this.grabber, this.launcher, this.slicer
Player.prototype.switchCurrentAbility = function(ability){
    if(ability != this.neutralAbility){
        this.neutralAbility.line.clear();
    }
    this.currentAbility = ability;
}

Player.prototype.updateAbilities = function(){
    for(var i=0; i<this.abilities.length; ++i){
        this.abilities[i].update();
    }
}

Player.prototype.isMovementRestricted = function(ability){
    for(var i=0; i<this.abilities.length; ++i){
        if(this.abilities[i].restrictMovementIfPressed && this.pad.getButton(this.abilities[i].button).isDown){
            return true;
        }
    }
    return false;
}