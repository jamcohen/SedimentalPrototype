function Ruler(parent, length){
    this.length = length;
    this.line = game.add.graphics();
    this.endpointX = 0;
    this.endpointY = 0;
    this.parent = parent;
    parent.addChild(this.line);
}

//x y are numbers between 0 and 1 representing the position of the endpoint of the line
Ruler.prototype.updateLine = function(x, y){
    //if(Math.abs(this.endpointY - y) < 0.01 && Math.abs(this.endpointX - x) < 0.01) return; //if x and y haven't changed return;
    
    this.line.clear();
    
    if(Math.sqrt(x*x+y*y) < 0.5) return; //if line length < 1 return
    
    this.endpointX = x;
    this.endpointY = y;
    
    this.line.lineStyle(3, 0x00FF00, 1);
    this.line.moveTo(0,0);
    this.line.lineTo(x*this.length, y*this.length);
}

Ruler.prototype.clear = function(){
    this.endpointX = 0;
    this.endpointY = 0;
    this.line.clear();
}

Ruler.prototype.slice = function(){
    slice(this.parent.x, this.parent.y, this.endpointX*this.length+this.parent.x, this.endpointY*this.length+this.parent.y); 
}

Ruler.prototype.launch = function(playerTag){
    var minDist = Number.POSITIVE_INFINITY;
    var closestRaycast = null;
    var x = this.endpointX*this.length+this.parent.x;
    var y = this.endpointY*this.length+this.parent.y;
    var sliceable = null;
    for(var i=0; i<sliceables.length; i++){
        var raycastInfo = sliceables[i].raycast(this.parent.x, this.parent.y, this.endpointX*this.length+this.parent.x, this.endpointY*this.length+this.parent.y);
        if(raycastInfo == null) continue;
        if(raycastInfo.dist < minDist){
            closestRaycast = raycastInfo;
            minDist = raycastInfo.dist;
            sliceable = sliceables[i];
            
        }
    }
    if(closestRaycast != null && closestRaycast.dist < this.length){
        if(!sliceable.sprite.body.kinematic){
            sliceable.tag = playerTag;
        }
        sliceable.draw();
        sliceable.sprite.body.applyForce([-this.endpointX*5000,-this.endpointY*5000], sliceable.sprite.x, sliceable.sprite.y);
    }
}

Ruler.prototype.getAngle = function(x,y){
    this.endpointX = x;
    this.endpointY = y;
    
    var xdiff = x*this.length;
    var ydiff = y*this.length;
    var angle = ((180/Math.PI) * Math.atan2(ydiff, xdiff));
    return angle + 90; // In order for thrust to work properly
    
    // Our angles produced: Up - -90, Right - 0, Down - 90, Left - 180
    // Thrust angles: Up - 0, Right - 90, Down - 180, Left - -90
    
    
}