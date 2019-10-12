document.body.style.backgroundColor = "black";
// endlessCanvas = true;

let MIN_MIN_DISTANCE_CONST = 0.00001;
let MAX_MIN_DISTANCE_CONST = 10000;

class Vector {
	constructor(x, y){
		this.x = x;
		this.y = y;
	}
	self(){
		return new Vector(this.x, this.y);
	}
	get angle () {
		let a = Math.atan2(this.x, this.y) - Math.PI/2;
		return a >= 0 ? a : a + Math.PI*2;
	}
	get n () {
		return new Vector(-this.x, -this.y);
	}
	set(vec){
		this.x = vec.x;
		this.y = vec.y;
	}
	add(vec){
		return new Vector(this.x + vec.x, this.y + vec.y);
	}
	muly(int){
		return new Vector(this.x*int, this.y*int);
	}
	draw(){
		context.strokeStyle = "white";
		context.beginPath();
		context.arc(this.x, this.y, 5, 0, 2 * Math.PI);
		context.closePath();
		context.stroke();
	}
}

class Figure {
	constructor(x, y, color = "green"){
		this.position = new Vector(x, y);
		this.color = color;
	}
	self(){
		let p = this.position;
		return new Figure(p.x, p.y, color);
	}
	get p () {
		return this.position
	}
	draw(){
		let p = this.position;
		context.fillStyle = this.color;
		context.beginPath();
		context.arc(p.x, p.y, 5, 0, 2 * Math.PI);
		context.closePath();
		context.fill();
	}
	distance(vec){
		let p = this.position;
		return Math.sqrt((vec.x-p.x)*(vec.x-p.x) + (vec.y-p.y)*(vec.y-p.y));
	}
	static draw(fgr){
		fgr.draw();
	}
}

class Rectangle extends Figure {
	constructor(x, y, sx, sy, color = "red"){
		super(x, y, color);
		this.size = new Vector(sx, sy);
	}
	self(){
		let p = this.position;
		let s = this.size;
		let c = this.color;
		return new Rectangle(p.x, p.y, s.x, s.y, c);
	}
	distance(vec){
		let p = this.position;
		let s = this.size;
		let dx = Math.max(Math.abs(vec.x - (p.x + s.x/2)) - s.x/2, 0);
		let dy = Math.max(Math.abs(vec.y - (p.y + s.y/2)) - s.y/2, 0);
		return Math.sqrt(dx*dx + dy*dy);
	}
	draw(){
		let p = this.position;
		let s = this.size;
		context.fillStyle = this.color;
		context.fillRect(p.x, p.y, s.x, s.y);
	}
}

class Arc extends Figure {
	constructor(x, y, s, color = "blue"){
		super(x, y, color);
		this.size = s == Infinity ? 0 : s;
	}
	self(){
		let p = this.position;
		let s = this.size;
		let c = this.color;
		return new Arc(p.x, p.y, s, c);
	}
	distance(vec){
		let s = this.size;
		let d = super.distance(vec)
		if(s > d) return 0
		return d - s;
	}
	draw(){
		let p = this.position;
		let s = this.size;
		context.fillStyle = this.color;
		context.beginPath();
		context.arc(p.x, p.y, s, 0, 2 * Math.PI);
		context.closePath();
		context.fill();
	}
	drawStroke(color){
		if(color == undefined) color = this.color;
		let p = this.position;
		let s = this.size;
		context.strokeStyle = color;
		context.beginPath();
		context.arc(p.x, p.y, s, 0, 2 * Math.PI);
		context.closePath();
		context.stroke();
	}
}

let lightSource = [];
let figures = [];
let rayCast = [];

let playerAngle = 0;
let playerRange = Math.PI/16;

// figures.push(new Rectangle(415, 117, 175, 58));
// figures.push(new Arc(792, 257, 69));
// figures.push(new Rectangle(560, 479, 66, 84));
// figures.push(new Rectangle(787, 528, 73, 222));
// figures.push(new Arc(437, 756, 80));

// lightSource.push(new Vector(150, 415));
// lightSource.push(new Vector(1120, 736));
// lightSource.push(new Vector(1015, 300));

figures.push(new Rectangle(415, 117, 175, 58));
figures.push(new Arc(792, 257, 69));
figures.push(new Rectangle(560, 479, 66, 84));

lightSource.push(new Vector(100, 100));
// lightSource.push(new Vector(700, 100));
// lightSource.push(new Vector(400, 500)); 

function initRayCast(angle = playerAngle, range = playerRange){
	rayCast = [];
	for(let i in lightSource){
		rayCasting(lightSource[i], figures, angle, range)
	}
}
initRayCast();

function rayCasting(point, figures, angle, range) {
	let ang = angle - range;
	while (ang <= angle + range) {
		ang += Math.PI/900;

		let v = rayCollide(point, ang, figures);
		rayCast.push(new Arc(v.x, v.y, 3, "yellow"));
	}
}

function rayCollide(point, angle, figures) {
	let curr = new Vector(point.x, point.y);
	for(let i = 0; i < 128; i++){

		let min_dist = Infinity;
		for(ff in figures){
			min_dist = Math.min(min_dist, figures[ff].distance(curr));
		}

		if (min_dist < MIN_MIN_DISTANCE_CONST){
			return new Vector(curr.x, curr.y);
		}

		if (min_dist > MAX_MIN_DISTANCE_CONST){
			return new Vector(curr.x, curr.y);
		}

		let a = new Arc(curr.x, curr.y, min_dist);
		let p = new Vector(a.p.x + Math.cos(angle) * min_dist, a.p.y - Math.sin(angle) * min_dist);

		// a.drawStroke("white");
		// p.draw();

		curr.set(p);
		// console.log(curr)
	}
	return new Vector(Infinity, Infinity);
}

function update() {
	if(isKeyPressed[37]){
		lightSource[0].x -= 5;
	}
	if(isKeyPressed[39]){
		lightSource[0].x += 5;
	}
	if(isKeyPressed[38]){
		lightSource[0].y -= 5;
	}
	if(isKeyPressed[40]){
		lightSource[0].y += 5;
	}
	initRayCast();
}

function draw() {
	let m = new Vector(mouseX, mouseY);
	let ls = lightSource[0];

	context.strokeStyle = "white";
	context.strokeRect(0, 0, 800, 600);


	// for(let i in figures){
	// 	figures[i].draw();
	// }

	for(let i in lightSource){
		lightSource[i].draw();
	}

	for(let i in rayCast){
		rayCast[i].draw();
	}

	context.globalAlpha = 0.3;
	if(isDragging){
		let d = figures[toDragIndex].self();
		d.position.set(m.add(dragOffset));
		d.draw();
	}

	let e1 = rayCollide(ls, playerAngle + playerRange, figures);
	let e2 = rayCollide(ls, playerAngle - playerRange, figures);

	context.beginPath();
	context.moveTo(ls.x, ls.y);
	context.lineTo(e1.x, e1.y);
	context.closePath();
	context.moveTo(ls.x, ls.y);
	context.lineTo(e2.x, e2.y);
	context.closePath();
	context.stroke();
	context.globalAlpha = 1;

}

let toDragIndex = -1;
let dragOffset = new Vector(0, 0);
let isDragging = false;

function mousedown() {
	let m = new Vector(mouseX, mouseY);
	for(let i in figures){
		if(figures[i].distance(m) == 0){
			isDragging = true;
			dragOffset.set(new Vector(figures[i].p.x - mouseX, figures[i].p.y - mouseY));
			toDragIndex = i;
		}
	}
}

function mousemove() {
	let m = new Vector(mouseX, mouseY);
	playerAngle = m.add(lightSource[0].n).angle;
}

function mouseup() {
	let m = new Vector(mouseX, mouseY);
	console.log("Mouse at:", m.x, m.y);
	if(isDragging){
		console.log(toDragIndex, figures[toDragIndex])
		figures[toDragIndex].position.set(m.add(dragOffset));
		initRayCast();
		isDragging = false;
	}
}
