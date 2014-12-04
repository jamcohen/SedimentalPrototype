function Ruler(player){
    this.length = 0;
    this.line = game.add.graphics();
    this.endpointX = 0;
    this.endpointY = 0;
    this.color = 0x00FF00;
    this.owner = player.sprite;
    this.playerTag = player.tag;
}

//x y are numbers between 0 and 1 representing the position of the endpoint of the line
Ruler.prototype.updateLine = function(x, y){
    //if(Math.abs(this.endpointY - y) < 0.01 && Math.abs(this.endpointX - x) < 0.01) return; //if x and y haven't changed return;
    
    this.line.clear();
    
    if(Math.sqrt(x*x+y*y) < 0.5) return; //if line length < 1 return
    
    //console.log(Math.atan2(y,x));
    
    this.endpointX = x;
    this.endpointY = y;
    
    this.line.lineStyle(3, this.color, 1);
    this.line.moveTo(this.owner.x,this.owner.y);
    this.line.lineTo(x*this.length+this.owner.x, y*this.length+this.owner.y);
}

Ruler.prototype.clear = function(){
    this.endpointX = 0;
    this.endpointY = 0;
    this.line.clear();
}

//Raycast to all sliceables then returns the closest one
//If the raycast fails or the sliceable objects is farther away then maxDist this function returns false
Ruler.prototype.rayCastToSliceables = function(maxDist){
    var minDist = Number.POSITIVE_INFINITY;
    var closestRaycast = null;
    var x = this.endpointX*this.length+this.owner.x;
    var y = this.endpointY*this.length+this.owner.y;
    //console.log("RAYCAST", x,y);
    var sliceable = null;
    for(var i=0; i<sliceables.length; i++){
        var raycastInfo = sliceables[i].raycast(this.owner.x, this.owner.y, this.endpointX*this.length+this.owner.x, this.endpointY*this.length+this.owner.y);
        if(raycastInfo == null) continue;
        console.log("RAYCAST", raycastInfo);
        if(raycastInfo.dist < minDist){
            closestRaycast = raycastInfo;
            minDist = raycastInfo.dist;
            sliceable = sliceables[i];
        }
    }
    
    if(closestRaycast != null && closestRaycast.dist < this.length){
        return sliceable;
    }

    return null;
}

Ruler.prototype.update = function(){
    
}

//OnCharge runs every frame while charge is running
Ruler.prototype.onCharge = function(x,y){
    this.updateLine(x,y);
}

//OnPress runs the frame the ability button is pushed
Ruler.prototype.onPress = function(x,y){
    
}

//OnRelease runs the frame the ability button is released
Ruler.prototype.onRelease = function(x,y){
    
}