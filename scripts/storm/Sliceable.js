//xPos and yPos are in global space. points is in local.
//anchorPoints is an array of Phaser.Point
function Sliceable(xPos, yPos, points, velocity, anchorPoints){    
    this.sprite = game.add.sprite(xPos, yPos);
    this.shape = game.add.graphics();
    this.sprite.addChild(this.shape);
    game.physics.enable(this.sprite, Phaser.Physics.P2JS, false);
    console.log(this.sprite.body.debugBody);
    this.setAnchorPoints(anchorPoints);
    
    this.points = points;
    this.active = false;
        
    this.refresh(velocity);
    sliceables.push(this);
}

Sliceable.prototype.setAnchorPoints = function(anchorPoints){
    //console.log(anchorPoints, anchorPoints == null);
    this.anchorPoints = anchorPoints;
    if(anchorPoints == null){
        this.anchorPoints = [];
    }
    this.sprite.body.kinematic = !(this.anchorPoints.length < 1);
}

//arguments are in global space
Sliceable.prototype.slice = function(x1, y1, x2, y2){
    x1 -= this.sprite.x;
    y1 -= this.sprite.y;
    x2 -= this.sprite.x;
    y2 -= this.sprite.y;
    
    var angle = this.sprite.rotation;
    point1 = rotateAround(0, 0, angle, x1, y1, false);
    point2 = rotateAround(0, 0, angle, x2, y2, false);
    
    //this.sprite.addChild(ruler);
    var splitPolys = PolyK.Slice(this.points, point1.x, point1.y, point2.x, point2.y);
    
    //no new polys were formed.
    if(splitPolys.length <= 1){
        console.log("no slice");
        return;
    }
    var vel = this.sprite.body.data.velocity;
    var worldPosX = this.sprite.x;
    var worldPosY = this.sprite.y;

    var anchorPointCopy = [];
    for(var j=0; j<this.anchorPoints.length; j++){
        anchorPointCopy.push(new Phaser.Point(this.anchorPoints[j].x, this.anchorPoints[j].y));
        console.log(anchorPointCopy[j].x, anchorPointCopy[j].y);
    }
    
    for(var i = 0; i<splitPolys.length; ++i){
        
        //Look at which anchorpoints belong to which new poly and assign them accordingly.
        var anchorPoints = [];
        for(var j=0; j<this.anchorPoints.length; j++){
            if(PolyK.ContainsPoint(splitPolys[i], anchorPointCopy[j].x, anchorPointCopy[j].y)){
                console.log(i, anchorPointCopy[j].x, anchorPointCopy[j].y, this);
                anchorPoints.push(new Phaser.Point(anchorPointCopy[j].x, anchorPointCopy[j].y));
            }
        }
        
        
        if(PolyK.ContainsPoint(splitPolys[i], 0, 0)){
            rotatePoints(splitPolys[i], 0, 0, angle, true);
            var centroid = getCentroid(splitPolys[i]);
            moveOrigin(splitPolys[i], centroid.x, centroid.y);
            moveOriginForPoints(anchorPoints, centroid.x, centroid.y);
            this.points = splitPolys[i];
            
            this.sprite.body.destroy();
            this.sprite.x += centroid.x;
            this.sprite.y += centroid.y;
            //force rotation to 0
            this.sprite.rotation = 0;
            game.physics.enable(this.sprite, Phaser.Physics.P2JS);
            
            this.setAnchorPoints(anchorPoints);
            
            this.refresh(vel);
            continue;
        }else{
            rotatePoints(splitPolys[i], 0, 0, angle, true);
            var centroid = getCentroid(splitPolys[i]);
            moveOrigin(splitPolys[i], centroid.x, centroid.y);
            moveOriginForPoints(anchorPoints, centroid.x, centroid.y);
            //var newChunk = new Sliceable(worldPosX, worldPosY, splitPolys[i]);
            var newChunk = new Sliceable(centroid.x+worldPosX, centroid.y+worldPosY, splitPolys[i], null, anchorPoints);
        }
    }
    //sliceables[0].shape.clear();
    //sliceables[1].points = [];
    //sliceables[1].shape.clear();
    //sliceables[2].shape.clear();
}

//Draws and initializes the physics shapes
//velocity is an optional argument. Used to allow new slices to preserve their previous velocity
Sliceable.prototype.refresh = function(velocity){
    //velocity = (typeof velocity !== 'undefined') ? velocity : {x:0, y:0}; //sets 0,0 as default value for velocity
    
    this.sprite.body.clearShapes();
    this.sprite.body.addPolygon({position:[0,0]}, this.points);
    if(velocity != null){
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
    //this.shape.endFill();
    
    // Now change colour to green and 100% opacity/alpha
    //this.shape.beginFill(0x00ff00, 1.0);

    // Draw circle about screen's center, with 200 pixels radius
    //this.shape.drawCircle(0, 0, 3);
    
    for(var i = 0;i < this.anchorPoints.length; i++){
        this.shape.beginFill(0x00ff00, 1.0);

        // Draw circle about screen's center, with 200 pixels radius
        this.shape.drawCircle(this.anchorPoints[i].x, this.anchorPoints[i].y, 3);
        //this.shape.endFill();
    }
}