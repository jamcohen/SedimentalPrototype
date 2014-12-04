var sliceables = [];
var game;
window.onload = function () {

    game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { preload: preload, create: create, update: update});
    var cursors;
    var ledge;
    var player;
    var player2;
    
    function preload () {
        game.load.image('player', 'player.png');
    }

    function create () {
        //var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
        //logo.anchor.setTo(0.5, 0.5);

        initPhysics();
        

        
        var anchorPoints = [new Phaser.Point(0,0)];
        var points = [-100, 30, 100, 20, 100, -20, -100, -20];
        var poly = new Sliceable(550,350, points, undefined, anchorPoints);
        poly.active = true;
        
        var points = [-100, 20, 100, 30, 100, -30, -100, -20];
        var poly = new Sliceable(250,350, points, undefined, anchorPoints);
        poly.active = true;
        
        var points = [-100, 20, 100, 20, 100, -20, -100, -20];
        var poly = new Sliceable(400,500, points, undefined, anchorPoints);
        poly.active = true;
        
         var points = [-100, 20, 100, 20, 100, -20, -100, -20];
        var poly = new Sliceable(120,450, points, undefined, anchorPoints);
        poly.active = true;
        
         var points = [-100, 20, 100, 20, 100, -20, -100, -20];
        var poly = new Sliceable(650,450, points, undefined, anchorPoints);
        poly.active = true;
        
        var points = [-100, 20, 100, 20, 100, -20, -100, -20];
        var poly = new Sliceable(400,200, points, undefined, [new Phaser.Point(-90,0), new Phaser.Point(90,0)]);
        poly.active = true;
        
        var points = [-100, 40, 100, 20, 100, -20, -100, -20];
        var poly = new Sliceable(150,130, points, undefined, [new Phaser.Point(-90,0), new Phaser.Point(90,0)]);
        poly.active = true;
        
        
        player = new Player(100,100, 1);
        player2 = new Player(600, 100, 2);
        
        
        //poly.slice(0,0,800,600);
        cursors = game.input.keyboard.createCursorKeys();
        
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
          
        player.update();
        player2.update();
    }

};

function slice(x1, y1, x2, y2){
      for(var i=0; i<sliceables.length; i++){
         if(sliceables[i].active){
             sliceables[i].slice(x1,y1,x2,y2);
         }else{
            sliceables[i].active = true; 
         }
      }
}

function initPhysics(){
      game.physics.startSystem(Phaser.Physics.P2JS);
      game.physics.p2.gravity.y = 500;
      game.physics.p2.restitution = 0.0;
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

//adjust a group of points to be relative to a new origin
//points is an array of Phaser.Points
function moveOriginForPoints(points, newOriginX, newOriginY){
    for(var i = 0; i<points.length; i++){
        points[i].x -= newOriginX;
        points[i].y -= newOriginY;
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