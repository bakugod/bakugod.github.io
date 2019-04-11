console.log(window.Worker);

!(function() {
	let timeouts = [];
	let messageName = "zero-timeout-message";

	function setZeroTimeout(fn) {
		timeouts.push(fn);
		window.postMessage(messageName, "*");
	}

	function handleMessage(event) {
		if (event.source == window && event.data == messageName) {
			event.stopPropagation();
			if (timeouts.length > 0) {
				let fn = timeouts.shift();
				fn();
			}
		}
	}

	window.addEventListener("message", handleMessage, true);

	window.setZeroTimeout = setZeroTimeout;
})();

let Neuvol;
let game;
let FPS = 60;
let maxScore = 0;

let images = {};

const speed = function(fps){
	FPS = parseInt(fps);
}

const loadImages = function(sources, callback){
	let nb = 0;
	let loaded = 0;
	let imgs = {};
	for(let i in sources){
		nb++;
		imgs[i] = new Image();
		imgs[i].src = sources[i];
		imgs[i].onload = function(){
			loaded++;
			if(loaded == nb){
				callback(imgs);
			}
		}
	}
}

const Bird = function(json){
	this.x = 80;
	this.y = 250;
	this.width = 40;
	this.height = 30;

	this.alive = true;
	this.gravity = 0;
	this.velocity = 0.3; 
	this.jump = -6; 

	this.init(json);
}

Bird.prototype.init = function(json){
	for(let i in json){
		this[i] = json[i];
	}
}

Bird.prototype.flap = function(){
	this.gravity = this.jump;
}

Bird.prototype.update = function(){
	this.gravity += this.velocity;
	this.y += this.gravity;
}

Bird.prototype.isDead = function(height, pipes){ //труп ли птичка
	if(this.y >= height || this.y + this.height <= 0){
		return true;
	}
	for(let i in pipes){
		if(!(
			this.x > pipes[i].x + pipes[i].width ||
			this.x + this.width < pipes[i].x || 
			this.y > pipes[i].y + pipes[i].height ||
			this.y + this.height < pipes[i].y
			)){
			return true;
		}
	}
}

let Pipe = function(json){//труба
	this.x = 0;
	this.y = 0;
	this.width = 50;
	this.height = 40;
	this.speed = 3;

	this.init(json);
}

Pipe.prototype.init = function(json){
	for(let i in json){
		this[i] = json[i];
	}
}

Pipe.prototype.update = function(){
	this.x -= this.speed;
}

Pipe.prototype.isOut = function(){
	if(this.x + this.width < 0){
		return true;
	}
}

let Game = function(){
	this.pipes = [];
	this.birds = [];
	this.score = 0;
	this.canvas = document.querySelector("#flappy");
	this.ctx = this.canvas.getContext("2d");
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.spawnInterval = 90;
	this.interval = 0;
	this.gen = [];
	this.alives = 0;
	this.generation = 0;
	this.backgroundSpeed = 0.5;
	this.backgroundx = 0;
	this.maxScore = 0;
}

Game.prototype.start = function(){
	this.interval = 0;
	this.score = 0;
	this.pipes = [];
	this.birds = [];

	this.gen = Neuvol.nextGeneration();
	for(let i in this.gen){
		let b = new Bird();
		this.birds.push(b)
	}
	this.generation++;
	this.alives = this.birds.length;
}

Game.prototype.update = function(){
	this.backgroundx += this.backgroundSpeed;
	let nextHoll = 0;
	if(this.birds.length > 0){
		for(let i = 0; i < this.pipes.length; i+=2){
			if(this.pipes[i].x + this.pipes[i].width > this.birds[0].x){
				nextHoll = this.pipes[i].height/this.height;
				break;
			}
		}
	}

	for(let i in this.birds){
		if(this.birds[i].alive){

			let inputs = [
			this.birds[i].y / this.height,
			nextHoll
			];

			let res = this.gen[i].compute(inputs);
			if(res > 0.5){
				this.birds[i].flap();
			}

			this.birds[i].update();
			if(this.birds[i].isDead(this.height, this.pipes)){
				this.birds[i].alive = false;
				this.alives--;
				//console.log(this.alives);
				Neuvol.networkScore(this.gen[i], this.score);
				if(this.isItEnd()){
					console.log(Math.floor(this.maxScore/90))
					this.start();
				}
			}
		}
	}

	for(let i = 0; i < this.pipes.length; i++){
		this.pipes[i].update();
		if(this.pipes[i].isOut()){
			this.pipes.splice(i, 1);
			i--;
		}
	}

	if(this.interval == 0){
		let deltaBord = 50;
		let pipeHoll = 120;
		let hollPosition = Math.round(Math.random() * (this.height - deltaBord * 2 - pipeHoll)) +  deltaBord;
		this.pipes.push(new Pipe({x:this.width, y:0, height:hollPosition}));
		this.pipes.push(new Pipe({x:this.width, y:hollPosition+pipeHoll, height:this.height}));
	}

	this.interval++;
	if(this.interval == this.spawnInterval){
		this.interval = 0;
	}

	this.score++;
	this.maxScore = (this.point > this.maxScore) ? this.point : this.maxScore;
	let self = this;

	if(FPS == 0){
		setZeroTimeout(function(){
			self.update();
		});
	}else{
		setTimeout(function(){
			self.update();
		}, 1000/FPS);
	}
}


Game.prototype.isItEnd = function(){
	for(let i in this.birds){
		if(this.birds[i].alive){
			return false;
		}
	}
	return true;
}

Game.prototype.display = function(){
	this.ctx.clearRect(0, 0, this.width, this.height);
	for(let i = 0; i < Math.ceil(this.width / images.background.width) + 1; i++){
		this.ctx.drawImage(images.background, i * images.background.width - Math.floor(this.backgroundx%images.background.width), 0)
	}

	for(let i in this.pipes){
		if(i % 2 == 0){
			this.ctx.drawImage(images.pipetop, this.pipes[i].x, this.pipes[i].y + this.pipes[i].height - images.pipetop.height, this.pipes[i].width, images.pipetop.height);
		}else{
			this.ctx.drawImage(images.pipebottom, this.pipes[i].x, this.pipes[i].y, this.pipes[i].width, images.pipetop.height);
		}
	}

	this.ctx.fillStyle = "#FFC600";
	this.ctx.strokeStyle = "#CE9E00";
	for(let i in this.birds){
		if(this.birds[i].alive){
			this.ctx.save(); 
			this.ctx.translate(this.birds[i].x + this.birds[i].width/2, this.birds[i].y + this.birds[i].height/2);
			this.ctx.rotate(Math.PI/2 * this.birds[i].gravity/20);
			this.ctx.drawImage(images.bird, -this.birds[i].width/2, -this.birds[i].height/2, this.birds[i].width, this.birds[i].height);
			this.ctx.restore();
		}
	}

	//attach our score 0 points and round it to min value
	this.point = this.score - 48;
	let gg = () => this.point < 0 ? 0 : Math.floor(this.point/this.spawnInterval);
	gg();
	
	this.ctx.fillStyle = "white";
	this.ctx.font="20px Oswald, sans-serif";
	this.ctx.fillText("Score : "+ gg(), 10, 25);
	this.ctx.fillText("Max Score : "+ Math.floor(this.maxScore/this.spawnInterval), 10, 50);
	this.ctx.fillText("Generation : "+this.generation, 10, 75);
	this.ctx.fillText("Alive : "+this.alives+" / "+Neuvol.options.population, 10, 100);

	let self = this;
	//console.log(self)
	requestAnimationFrame(function(){
		self.display();
	});
}

const startButton = document.querySelector(".sub");

startButton.onclick = function(){
	const sprites = {
		bird : "./src/img/dragon.png",
		background : "./src/img/background.png",
		pipetop : "./src/img/pipetop.png",
		pipebottom : "./src/img/pipebottom.png"
	}

	const template = {
		"0": (a) => 1337,
		"1": (a) => Math.cosh(a) * -a * 3,
		"2": (a) => Math.exp(-(a**2)),
		"3": (a) => a / 1 + Math.abs(a),
		"4": (a) => a
	}
	
	const userInput = function(){
		const pop = document.querySelector(".population");
		let get  = () => (pop.value == "" || pop.value < 5 || pop.value > 100) ? 50 : pop.value;
		return get();
	}

	const functionActivation = function(){
		const index = document.querySelector(".select").options.selectedIndex;
		return index.toString();
	}

	let start =  function(){
		Neuvol = new Neuroevolution({
			population: userInput(), //популяция наших птичек
			network:[2, [3], 1], //это многослойный перцептрон теперь
			activation: template[functionActivation()] //выбор функции активации
		});
		game = new Game(); //старт
		game.start();
		game.update();
		game.display();
	}

	loadImages(sprites, function(imgs){ //старт движения карты
		images = imgs;
		start();	
	})
}
