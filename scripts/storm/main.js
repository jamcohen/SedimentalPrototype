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
        
        poly.sprite.body.destroy();
        //poly.sprite.rotation = Math.PI/3;
        game.physics.p2.enable(poly.sprite, Phaser.Physics.P2JS, true);
        poly.refresh();
        
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
                   //sliceables[i].sprite.x += 1;
                  sliceables[i].sprite.rotation += 0.05;
                  sliceables[i].sprite.body.rotateLeft(20);
              }
              if(cursors.left.isDown){
                  //sliceables[i].sprite.x -= 1;
                  sliceables[i].sprite.rotation -= 0.05;
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
function Sliceable(xPos, yPos, points, velocity){    
    this.sprite = game.add.sprite(xPos, yPos);
    this.shape = game.add.graphics();
    this.sprite.addChild(this.shape);
    game.physics.p2.enable(this.sprite, Phaser.Physics.P2JS, true);
    
    this.points = points;
    this.active = false;
    
    this.refresh(velocity);
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
    point1 = rotateAround(0, 0, angle, x1, y1, false);
    point2 = rotateAround(0, 0, angle, x2, y2, false);
    
    console.log(point1, point2);
    
    //this.sprite.addChild(ruler);
    var splitPolys = PolyK.Slice(this.points, point1.x, point1.y, point2.x, point2.y);
    
    //no new polys were formed.
    if(splitPolys.length <= 1){
        return;
    }
    var vel = this.sprite.body.data.velocity;
    var worldPosX = this.sprite.x;
    var worldPosY = this.sprite.y;
    for(var i = 0; i<splitPolys.length; ++i){
        //center = {x:0, y:0};
        if(PolyK.ContainsPoint(splitPolys[i], 0, 0)){
            rotatePoints(splitPolys[i], 0, 0, angle, true);
            var centroid = getCentroid(splitPolys[i]);
            moveOrigin(splitPolys[i], centroid.x, centroid.y);
            this.points = splitPolys[i];
            this.sprite.x += centroid.x;
            this.sprite.y += centroid.y;
            
            //force rotation to 0
            this.sprite.body.destroy();
            this.sprite.rotation = 0;
            game.physics.p2.enable(this.sprite, Phaser.Physics.P2JS, true);
            
            this.refresh(vel);
            continue;
        }else{
            rotatePoints(splitPolys[i], 0, 0, angle, true);
            var centroid = getCentroid(splitPolys[i]);
            moveOrigin(splitPolys[i], centroid.x, centroid.y);
            //var newChunk = new Sliceable(worldPosX, worldPosY, splitPolys[i]);
            console.log(vel);
            var newChunk = new Sliceable(centroid.x+worldPosX, centroid.y+worldPosY, splitPolys[i]);
        }
    }
    //sliceables[0].shape.clear();
    //sliceables[1].points = [];
    //sliceables[1].shape.clear();
    //sliceables[2].shape.clear();
    console.log(sliceables.length, splitPolys);
}

//Draws and initializes the physics shapes
//velocity is an optional argument. Used to allow new slices to preserve their previous velocity
Sliceable.prototype.refresh = function(velocity){
    //velocity = (typeof velocity !== 'undefined') ? velocity : {x:0, y:0}; //sets 0,0 as default value for velocity
    
    this.sprite.body.clearShapes();
    this.sprite.body.addPolygon({position:[0,0]}, this.points);
    if(typeof velocity !== 'undefined'){
        this.sprite.body.data.velocity = velocity;
    }
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

//finds the average of a group of points
//points is a flat array of type [x,y,x,y,x,y,x,y]
function getCenter(points){
    var centerX = 0;
    var centerY = 0;
    
    for(var i = 0; i<points.length; i+=2){
        centerX += points[i];
        centerY += points[i+1];
    }
    centerX /= Math.floor(points.length/2);
    centerY /= Math.floor(points.length/2);
    return {x:centerX, y:centerY}
}

//Gets the center of mass of a polygon
function getCentroid(points)
{
    var vertices = getPointsFromFlatArray(points)
    var centroid = {x:0, y:0};
    var signedArea = 0.0;
    var x0 = 0.0; // Current vertex X
    var y0 = 0.0; // Current vertex Y
    var x1 = 0.0; // Next vertex X
    var y1 = 0.0; // Next vertex Y
    var a = 0.0;  // Partial signed area

    // For all vertices except last
    var i=0;
    for (i=0; i<vertices.length-1; ++i)
    {
        x0 = vertices[i].x;
        y0 = vertices[i].y;
        x1 = vertices[i+1].x;
        y1 = vertices[i+1].y;
        a = x0*y1 - x1*y0;
        signedArea += a;
        centroid.x += (x0 + x1)*a;
        centroid.y += (y0 + y1)*a;
    }

    // Do last vertex
    x0 = vertices[i].x;
    y0 = vertices[i].y;
    x1 = vertices[0].x;
    y1 = vertices[0].y;
    a = x0*y1 - x1*y0;
    signedArea += a;
    centroid.x += (x0 + x1)*a;
    centroid.y += (y0 + y1)*a;

    signedArea *= 0.5;
    centroid.x /= (6.0*signedArea);
    centroid.y /= (6.0*signedArea);

    return centroid;
}

//adjust a group of points to be relative to a new origin
//points is a flat array of type [x,y,x,y,x,y,x,y]
function moveOrigin(points, newOriginX, newOriginY){
    for(var i = 0; i<points.length; i+=2){
        points[i] -= newOriginX;
        points[i+1] -= newOriginY;
    }
}

function rotateAround(centerX, centerY, angle, x, y, clockwise){
    var newY, newX;
    if(!clockwise){
        newX = centerX + (x-centerX)*Math.cos(angle) + (y-centerY)*Math.sin(angle);
        newY = centerY - (x-centerX)*Math.sin(angle) + (y-centerY)*Math.cos(angle);
    }else{
        newX = centerX + (x-centerX)*Math.cos(angle) - (y-centerY)*Math.sin(angle);
        newY = centerY + (x-centerX)*Math.sin(angle) + (y-centerY)*Math.cos(angle);
    }

    return {x: newX, y:newY};
}

function rotatePoints(points, centerX, centerY, angle, clockwise){
    for(var i = 0; i<points.length; i+=2){
        var newPoints = rotateAround(centerX, centerY, angle, points[i], points[i+1], clockwise);
        points[i] = newPoints.x;
        points[i+1] = newPoints.y;
    }
}

function getPointsFromFlatArray(points){
    result = [];
    for(var i=0;i<points.length;i+=2){
        result.push({x:points[i], y:points[i+1]});
    }
    return result;
}