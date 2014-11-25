function Ruler(parent){
    this.length = 300;
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