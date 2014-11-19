var sliceables = [];
var game;
window.onload = function () {

    game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update});
    var cursors;
    var ledge;
    
    function preload () {
        game.load.image('logo', 'phaser.png');
    }

    function create () {
        //var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
        //logo.anchor.setTo(0.5, 0.5);

        initPhysics();
        
        var points = [-100, 100, 100, 100, 100, -100, -100, -100];
        var poly = new Sliceable(400,100, points);
        poly.active = true;
        
        //poly.slice(0,0,800,600);
        cursors = game.input.keyboard.createCursorKeys();
        
        var ruler = game.add.graphics(0,0);
        ruler.lineStyle(3, 0x00FF00, 1);
        ruler.moveTo(0,0);
        ruler.lineTo(800, 600);
        
        fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        fireButton.onDown.add(slice, this);
    }
    
    function update (){
          for(var i=0; i<sliceables.length; i++){
              
              if(cursors.right.isDown){
                   sliceables[i].sprite.x += 1;
              }
              if(cursors.left.isDown){
                   sliceables[i].sprite.x -= 1;
              }
              if(cursors.up.isDown){
                   sliceables[i].sprite.y -= 1;
              }
              if(cursors.down.isDown){
                   sliceables[i].sprite.y += 1;
              }
          }
    }

};

function slice(){
      for(var i=0; i<sliceables.length; i++){
         if(sliceables[i].active){
             sliceables[i].slice(-800,-600,800,600);
         }else{
            sliceables[i].active = true; 
         }
      }
}

//xPos and yPos are in global space. points is in local.
function Sliceable(xPos, yPos, points){
    this.sprite = game.add.sprite(xPos, yPos);
    this.shape = game.add.graphics();
    this.sprite.addChild(this.shape);
    //game.physics.p2.enable(this.sprite);
    game.physics.p2.enable(this.sprite, Phaser.Physics.P2JS, true);
    
    this.points = points;
    this.active = false;
    
    this.refresh();
    sliceables.push(this);
}

//arguments are in global space
Sliceable.prototype.slice = function(x1, y1, x2, y2){
    console.log("slice");
    x1 -= this.sprite.x;
    y1 -= this.sprite.y;
    x2 -= this.sprite.x;
    y2 -= this.sprite.y;
    
    var angle = this.sprite.rotation;
    point1 = rotateAround(0, 0, angle, x1, y1);
    point2 = rotateAround(0, 0, angle, x2, y2);
    
    console.log(point1, point2);
    
    var ruler = game.add.graphics(0,0);
    ruler.lineStyle(3, 0x00FF00, 1);
    ruler.moveTo(point1.x+this.sprite.x,point1.y+this.sprite.y);
    ruler.lineTo(point2.x+this.sprite.x,point2.y+this.sprite.y);
    this.sprite.addChild(ruler);
    var splitPolys = PolyK.Slice(this.points, point1.x, point1.y, point2.x, point2.y);
    
    //no new polys were formed.
    if(splitPolys.length <= 1){
        return;
    }
    
    for(var i = 0; i<splitPolys.length; ++i){
        if(PolyK.ContainsPoint(splitPolys[i], 0, 0)){
            console.log("contained point");
            this.points = splitPolys[i];
            this.refresh();
            continue;
        }else{
            var centerX = 0;
            var centerY = 0;
            for(var j = 0; j<splitPolys[i].length; j+=2){
                centerX += splitPolys[i][j];
                centerY += splitPolys[i][j+1];
            }
            centerX /= Math.floor(splitPolys[i].length/2);
            centerY /= Math.floor(splitPolys[i].length/2);
            for(var j = 0; j<splitPolys[i].length; j+=2){
                splitPolys[i][j] -= centerX;
                splitPolys[i][j+1] -= centerY;
            }
            var newChunk = new Sliceable(centerX+this.sprite.x, centerY+this.sprite.y, splitPolys[i]);
            
        }
    }
    //sliceables[0].shape.clear();
    //sliceables[1].points = [];
    //sliceables[1].shape.clear();
    //sliceables[2].shape.clear();
    console.log(sliceables.length, splitPolys);
}

Sliceable.prototype.refresh = function(){
    this.sprite.body.clearShapes();
    this.sprite.body.addPolygon({}, this.points);
    
    this.draw();
}

Sliceable.prototype.draw = function(){
    this.shape.clear();
    this.shape.lineStyle(2, 0x0000FF, 1);
    this.shape.beginFill(0xFFFF0B, 1);
    
    this.shape.moveTo(this.points[0], this.points[1]);

    for (var i = 2; i < this.points.length; i += 2)
    {
        this.shape.lineTo(this.points[i], this.points[i+1]);
    }

    this.shape.lineTo(this.points[0], this.points[1]);
    this.shape.endFill();
    
    // Now change colour to green and 100% opacity/alpha
    this.shape.beginFill(0x00ff00, 1.0);

    // Draw circle about screen's center, with 200 pixels radius
    this.shape.drawCircle(0, 0, 3);
}

function initPhysics(){
      game.physics.startSystem(Phaser.Physics.P2JS);
      game.physics.p2.gravity.y = 100;
}

function rotateAround(centerX, centerY, angle, x, y){
    var newX = centerX + (x-centerX)*Math.cos(angle) - (y-centerY)*Math.sin(angle);
    var newY = centerY + (x-centerX)*Math.sin(angle) + (y-centerY)*Math.cos(angle);
    
    console.log(angle);
    console.log(centerX);
    console.log(centerY);
    
    return {x: newX, y:newY};
}