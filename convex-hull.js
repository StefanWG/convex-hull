const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;
//this is a test
// An object that represents a 2-d point, consisting of an
// x-coordinate and a y-coordinate. The `compareTo` function
// implements a comparison for sorting with respect to x-coordinates,
// breaking ties by y-coordinate.
function Point (x, y, id) {
    this.x = x;
    this.y = y;
    this.id = id;

    // Compare this Point to another Point p for the purposes of
    // sorting a collection of points. The comparison is according to
    // lexicographical ordering. That is, (x, y) < (x', y') if (1) x <
    // x' or (2) x == x' and y < y'.
    this.compareTo = function (p) {
	if (this.x > p.x) {
	    return 1;
	}

	if (this.x < p.x) {
	    return -1;
	}

	if (this.y > p.y) {
	    return 1;
	}

	if (this.y < p.y) {
	    return -1;
	}

	return 0;
    }

    // return a string representation of this Point
    this.toString = function () {
	return "(" + x + ", " + y + ")";
    }
}

// An object that represents a set of Points in the plane. The `sort`
// function sorts the points according to the `Point.compareTo`
// function. The `reverse` function reverses the order of the
// points. The functions getXCoords and getYCoords return arrays
// containing x-coordinates and y-coordinates (respectively) of the
// points in the PointSet.
function PointSet () {
    this.points = [];
    this.curPointID = 0;

    //remove all elements from set
    this.reset = function(){
        while(this.points[0]){
            this.points.pop();
        }
        this.curPointID = 0;
    }

    // create a new Point with coordintes (x, y) and add it to this
    // PointSet
    this.addNewPoint = function (x, y) {
	    this.points.push(new Point(x, y, this.curPointID));
	    this.curPointID++;
    }

    // add an existing point to this PointSet
    this.addPoint = function (pt) {
	this.points.push(pt);
    }

    // sort the points in this.points 
    this.sort = function () {
	    this.points.sort((a,b) => {return a.compareTo(b)});
    }

    // reverse the order of the points in this.points
    this.reverse = function () {
	    this.points.reverse();
    }

    // return an array of the x-coordinates of points in this.points
    this.getXCoords = function () {
        let coords = [];
        for (let pt of this.points) {
            coords.push(pt.x);
        }

        return coords;
    }

    // return an array of the y-coordinates of points in this.points
    this.getYCoords = function () {
        let coords = [];
        for (pt of this.points) {
            coords.push(pt.y);
        }

        return coords;
    }

    // get the number of points 
    this.size = function () {
	    return this.points.length;
    }

    // return a string representation of this PointSet
    this.toString = function () {
        let str = '[';
        for (let pt of this.points) {
            str += pt + ', ';
        }
        str = str.slice(0,-2); 	// remove the trailing ', '
        str += ']';

        return str;
    }
}


function ConvexHullViewer (svg, ps) {
    this.svg = svg;  // an svg object where the visualization is drawn
    this.ps = ps;    // a point set of the points to be visualized
    this.clickedPoint = null;
    this.hull = [];
    
    this.addPoint = function(event) {
        const svg = document.getElementById("convex-hull-box");
        const rect = svg.getBoundingClientRect();
        // compute x and y
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // add to ps
        this.ps.addNewPoint(x, y);
        // create element and add to svg
        const points = document.getElementById("vertices");
        const p = document.createElementNS(SVG_NS, "circle");
        p.classList.add("point");
        p.setAttributeNS(null, "cx", x);
        p.setAttributeNS(null, "cy", y);
        p.id = ""+ ps.curPointID - 1+"";
        points.appendChild(p);
        console.log(points);

    }

    // Draw hull
    this.drawHull = function(hull) {
        console.log("drawing hull", hull);
        //remove old edges
        const edgeLayer = document.getElementById("edges");
        while (edgeLayer.firstChild) {
            edgeLayer.removeChild(edgeLayer.firstChild);
        }
        //avoid error if empty set or set of size 1
        if (hull.length < 2) return 0;
        //add new edges
        for (let i = 1; i < hull.length; i++) {
            const line = document.createElementNS(SVG_NS, "line");
            console.log(hull[i-1]);
            line.setAttributeNS(null, "x1", hull[i-1].x);
            line.setAttributeNS(null, "y1", hull[i-1].y);
            line.setAttributeNS(null, "x2", hull[i].x);
            line.setAttributeNS(null, "y2", hull[i].y);
            line.classList.add("edge");
            edgeLayer.appendChild(line);
        }
    }
}

/*
 * An object representing an instance of the convex hull problem. A ConvexHull stores a PointSet ps that stores the input points, and a ConvexHullViewer viewer that displays interactions between the ConvexHull computation and the 
 */
function ConvexHull (ps, viewer) {
    this.ps = ps;          // a PointSet storing the input to the algorithm
    this.viewer = viewer;  // a ConvexHullViewer for this visualization
    this.hull = 3;
    this.curElem = null;
    this.leftToRight = null;


    // start a visualization of the Graham scan algorithm performed on ps
    this.start = function () {
        //Initialize necessry variables
        this.ps.sort();
        this.hull = [];
        //add first two points to hull
        this.hull.push(this.ps.points[0]);
        this.hull.push(this.ps.points[1]);
        this.curElem = 2;
        this.leftToRight = true;
        this.viewer.drawHull(this.hull);

        this.addToHull(this.hull[0].id);
        this.highlight(this.hull[1].id);
        this.addToHull(this.hull[1].id);
        
    }

    //change the color on point to indicate it is part of hull
    this.addToHull = function (id){
        document.getElementById(id).classList.add("hullVertex");
    }

    this.removeFromHull = function (id){
        document.getElementById(id).classList.remove("hullVertex");
    }

    //highlight given point red
    this.highlight = function(id){
        document.getElementById(id).classList.add("currentVertex");
    }

    this.unhighlight = function(id){
        document.getElementById(id).classList.remove("currentVertex");
    }

    // perform a single step of the Graham scan algorithm performed on ps
    // returns true if algo is done
    this.step = function () {
        if (this.hull.length < 2) { //if hull size < 2 add element
            this.hull.push(this.ps.points[this.curElem]);
            this.addToHull(this.ps.points[this.curElem].id);
            this.curElem++;
        } else if (this.curElem == this.ps.points.length && this.leftToRight) { //we have reached end going left to right
            this.leftToRight = false;
            this.ps.reverse();
            this.hull.push(this.ps.points[1]);
            this.highlight(this.ps.points[1].id);
            this.unhighlight(this.ps.points[0].id);
            this.addToHull(this.ps.points[1].id);
            this.curElem = 2;
        } else if (this.curElem == this.ps.points.length) { //We have reached end going right to left
            
            return true;
        } else {
            const a = this.hull[this.hull.length - 2];
            const b = this.hull[this.hull.length - 1];
            const c = this.ps.points[this.curElem];
            this.unhighlight(b.id);
            this.highlight(c.id);
            if (this.isRightTurn(a,b,c)) { //All a, b, and c are part of hull
                this.hull.push(c);
                this.addToHull(c.id);
                this.curElem++;
            } else if(!this.leftToRight && (this.hull.includes(c))) { //if left turn, B is not part of convex hull
                this.hull.pop();
            }else{
                this.removeFromHull( this.hull.pop().id);
            }
        }
    
        viewer.drawHull(this.hull);
        return false;
    }

    //animate algo
    this.animate = function () {
        this.start();
        var stepResult = this.step();
        //TODO: add animation
        while (!stepResult) {
            stepResult = this.step();
        }

        this.viewer.drawHull(this.hull);
    }

    // Return a new PointSet consisting of the points along the convex
    // hull of ps. This method should **not** perform any
    // visualization. It should **only** return the convex hull of ps
    // represented as a (new) PointSet. Specifically, the elements in
    // the returned PointSet should be the vertices of the convex hull
    // in clockwise order, starting from the left-most point, breaking
    // ties by minimum y-value.
    this.getConvexHull = function () {
        //Run algo
        this.start();
        const stepResult = this.step();
        while (!stepResult) {
            stepResult = this.step();
        }
        //Create new ps and add all points
        const convexHull = new PointSet();
        for (const p of this.hull) {
            convexHull.addPoint(p);
        }
        return convexHull;
    }


    this.isRightTurn = function(a,b, c) {
        if (a.x == b.x) { //vertical line
            if (a.y < b.y) return c.x <= b.x; //a is lower than b, right turn if c is to the right of b
            if (a.y > b.y) return c.x >= b.x; //a is higher than b, right turn if c is to the left of b
            return true; //all three in same vertical line
        }
        if (a.x < b.x) { // If c is above the line a->b then a-b-c is a right turn
            const slope = (b.y - a.y) / (b.x-a.x);
            const yInt = a.y - a.x * slope
            return c.y > slope*c.x+yInt;
        } else if (a.x > b.x) { // If c is below the in b-> then a-b-c is a right turn
            const slope = (a.y - b.y) / (a.x-b.x);
            const yInt = a.y - a.x * slope
            return c.y < slope*c.x+yInt;
        }
        //REMEMBER THIS IS SCREEN COORDINATES NOT STANDARD COORDINATES
    }
}

const svg = document.getElementById("convex-hull-box");
const ps = new PointSet();
const chv = new ConvexHullViewer(svg, ps);
const ch = new ConvexHull(ps, chv);
//Add listener for clicking svg
svg.addEventListener("click", (e) => {
    chv.addPoint(e);   
});
//Add listener for steps
const stepButton = document.getElementById("step");
step.addEventListener("click", (e) => {
    ch.step();
});
//TODO: PREVENT CLICK OF STEP UNTIL START HAS BEEN CLICKED
//Add listener for animate
const animateButton = document.getElementById("animate");
animateButton.addEventListener("click", (e) => {
    ch.animate();
});
//Add listener for start
const startButton = document.getElementById("start");
startButton.addEventListener("click", (e) => {
    ch.start();
});

//Add listener for reset
const resetButton = document.getElementById("reset");
resetButton.addEventListener("click", () => {
    //remove edges
    const edgeLayer = document.getElementById("edges");
        while (edgeLayer.lastChild) {
            edgeLayer.removeChild(edgeLayer.lastChild);
        }
    //remove vertices
    const vert = document.getElementById("vertices");
        while (vert.lastChild) {
            vert.removeChild(vert.lastChild);
        }
    //reset point set
    ps.reset();
    
    
});