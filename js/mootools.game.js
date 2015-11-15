(function($){
	var chicken_maker, chicken_game;
	
	/*
	 |	CHICKEN GAME CLASS
	 |	@since	0.1.0
	 */
	var chickenGame = new Class({
		/*
		 |	CONSTRUCTOR
		 |	@since	0.1.0
		 */
		initialize: function(){
			if(typeof(Storage) == undefined){
				$("overlay").addClass("overlay-active");
				$("dialog-storage-error").addClass("dialog-active");
				return;
			}
			
			if(!localStorage.username){
				$("overlay").addClass("overlay-active");
				$("dialog-startgame").addClass("dialog-active");
				this.status = "invalid";
				return;
			} else {
				this.username = localStorage.username;
			}
			
			this.level = 1;
			if(localStorage.level){
				this.level = localStorage.level.toInt();
			}
			this.points = 0;
			if(localStorage.points){
				this.points = localStorage.points.toInt();
			}
			this.chickens = 0;
			if(localStorage.chickens){
				this.chickens = localStorage.chickens.toInt();
			}
			this.status = "pause";
			
			
			$("level-counter").set("text", this.level);
			$("chicken-points").set("text", this.points);
			$("chicken-counter").set("text", this.chickens);
		},
		
		/*
		 |	CREATE GAME
		 |	@since	0.1.0
		 */
		createGame: function(username){
			if(this.status !== "invalid"){
				return;
			}
			
			localStorage.setItem("username", username);
			localStorage.setItem("level", 1);
			localStorage.setItem("points", 0);
			localStorage.setItem("chickens", 0);
			location.reload();
		},
		
		/*
		 |	START GAME
		 |	@since	0.1.0
		 */
		startGame: function(){
			this.status = "play";
			
			for(var i = 0; i < this.level; i++){
				if(i == 10){ break; }
				chicken_maker.generate();
			}
		},
		
		/*
		 |	START GAME
		 |	@since	0.1.0
		 */
		pauseGame: function(){
			this.status = "pause";
		},
		
		/*
		 |	ADD LEVEL
		 |	@since	0.1.0
		 */
		addLevel: function(){
			this.level++;
			$("level-counter").set("text", this.level);
			localStorage.level = this.level;
			
			if(this.level < 11){
				chicken_maker.generate();
			}
		},
		
		/*
		 |	ADD POINTS
		 |	@since	0.1.0
		 */
		addPoints: function(points, code){
			if(code === "chicken"){
				this.points += points;
				this.chickens += 1;
				$("chicken-points").set("text", this.points);
				$("chicken-counter").set("text", this.chickens);
				localStorage.points = this.points;
				localStorage.chickens = this.chickens;
				
				if(this.chickens/20 > this.level){
					this.addLevel();
				}
			}
		},
		
		/*
		 |	ADD POINTS
		 |	@since	0.1.0
		 */
		removePoints: function(points, code){
			if(code === "chicken"){
				this.points -= points;
				$("chicken-points").set("text", this.points);
				localStorage.points = this.points;
			}
		},
		
		/*
		 |	GET STATUS
		 |	@since	0.1.0
		 */
		getStatus: function(){
			return this.status;
		}
	});
	
	/*
	 |	CHICKEN GENERATOR CLASS
	 |	@since	0.1.0
	 */
	var chickenMaker = new Class({
		/*
		 |	CONSTRUCTOR
		 |	@since	0.1.0
		 */
		initialize: function(){
			this.count = 0;							// CHICKEN COUNTER
			this.place = $("play")					// CONTAINER
			this.active = {};						// ACTIVE CHICKENS
			this.chicken = new Element("div", {		// CHICKEN TEMPLATE
				"width":	"130px",
				"class":	"chicken-object"
			});
			this.image = new Element("img", {
				"width":	"130px",
				"class":	"chicken-image",
				"src":		""
			});
		},
		
		/*
		 |	CLICK EVENT LISTENER
		 |	@since	0.1.0
		 */
		clickEvent: function(event){
			var element = event.target;
			
			if($(element).hasClass("chicken-image")){
				element = $(element).getParent();
			}
			if($(element).hasClass("chicken-object")){
				if($(element).get("data-chicken") !== undefined){
					var data = $(element).get("data-chicken");
					var check = this.active[data];
					
					if(check.element == element && check.cancel === undefined){
						// CANCEL MOVEMENT and ANIMATION
						check.cancel = true;
						$(check.element).get("tween").cancel();
						clearTimeout(this.active[data].animation);
						this.active[data].animation = false;
						
						// KILL AND POINT ANIMATION
						this.killAnimation(this.active[data]);
						this.pointAnimation(this.active[data], 15);
						chicken_game.addPoints(15, "chicken");
						
						// GENERATE NEW ONE
						this.generate();
					}
				}
			}
		},
		
		/*
		 |	END EVENT LISTENER
		 |	@since	0.1.0
		 */
		endEvent: function(chicken){
			var data = $(chicken.element).get("data-chicken");
			
			// CANCEL MOVEMENT and ANIMATION
			$(chicken.element).get("tween").cancel();
			clearTimeout(chicken.animation);
			chicken.animation = false;
			
			// REMOVE STUFF
			$(chicken.element).remove();
			delete this.active[data];
			chicken_game.removePoints(5, "chicken");
			
			// GENERATE NEW ONE
			this.generate();
		},
		
		/*
		 |	GENERATE A RANDOM CHICKEN
		 |	@since	0.1.0
		 */
		generate: function(){
			var chicken, image, images, coordinates, speed, direction;
			
			// CHECK IF PAUSE
			if(chicken_game.getStatus() !== "play"){
				return;
			}
			
			// CLONE ELEMENTS AND GET IMAGES
			chicken = this.chicken.clone();
			image = this.image.clone();
			images = {
				"animation": [
					"images/characters/chicken-1.png", "images/characters/chicken-2.png",
					"images/characters/chicken-3.png", "images/characters/chicken-4.png"
				],
				"hit": ["images/characters/chicken-5.png", "images/characters/chicken-6.png"]
			}
			
			// CALCULATE COORDINATES, SPEED AND DIRECTION
			coordinates = {
				"top": 		Math.floor((Math.random() * 35)+1),
				"left":		0,
				"right":	"auto",
				"bottom": 	"auto",
				"width":	Math.floor((Math.random() * 130)+1),
				"height":	"auto"
			};
			if(coordinates.width < 30){
				coordinates.width = 30;
			}
			if(coordinates.width%2 == 1){
				direction = "left";
				coordinates.left = "-" + coordinates.width.toInt();
			} else {
				direction = "right";
				coordinates.left = $(this.place).getStyle("width").toInt();
			}
			speed = 6000; // speed = Math.floor((Math.random() * 50)+1);
			
			// CREATE CHICKEN
			$(chicken).set({
				"width":		(coordinates.width+12) + "px",
				"padding":		"6px",
				"data-chicken":	this.count,
				styles:	{
					"top":		coordinates.top + "%",
					"left":		coordinates.left + "px",
					"width":	(coordinates.width+12) + "px"
				}
			});
			$(image).set({
				"width":	coordinates.width + "px",
				"src":		images.animation[0]
			});
			if(direction === "right"){
				$(chicken).addClass("chicken-reverse");
			}
			$(chicken).adopt(image);
			
			// STORE CHICKEN
			var active = {
				"element":	chicken,
				"settings": {
					"coordinates":	coordinates,
					"direction":	direction,
					"images":		images,
					"speed":		speed
				},
				"animation": false
			};
			active.animation = this.animation.periodical(75, this, active);
			this.active[this.count] = active;
			this.count++;
			
			// PERFORM CHICKEN
			$(this.place).adopt(chicken);
			this.movement(active);
		},
		
		/*
		 |	CHICKEN ANIMATION
		 |	@since	0.1.0
		 */
		animation: function(chicken){
			var img 	= $(chicken.element).getChildren("img")[0],
				src 	= $(img).get("src"),
				array 	= chicken.settings.images.animation;
			
			if(array.indexOf(src) >= (array.length-1)){
				var image = array[0];
			} else {
				var image = array[(array.indexOf(src)+1)];
			}
			$(img).set({"src": image});
		},
		
		/*
		 |	KILL ANIMATION
		 |	@since	0.1.0
		 */
		killAnimation: function(chicken){
			var img 	= $(chicken.element).getChildren("img")[0],
				src 	= $(img).get("src"),
				array 	= chicken.settings.images.hit;
			
			if(array.indexOf(src) == 0){
				var image = array[1];
			} else {
				var image = array[0];
			}
			$(img).set({"src": image});
			
			chicken.animation = this.killAnimation.delay(100, this, chicken);
		},
		
		/*
		 |	POINT ANIMATION
		 |	@since	0.1.0
		 */
		pointAnimation: function(chicken, points){
			var points = new Element("div", {
				"text":		points,
				"class":	"chicken-points"
			});
			
			$(chicken.element).adopt(points);
			$(points).set("morph", {duration: 500});
			$(points).morph({
				"top": "-35px",
				"opacity": 0
			});
			
			var self = this;
			$(points).get("morph").chain(function(){ 
				clearTimeout(chicken.animation);
				
				var id = $(chicken.element).get("data-chicken").toInt();
				$(points).remove();
				$(chicken.element).remove();
				delete self.active[id];
			});
		},
		
		/*
		 |	CHICKEN MOVEMENT
		 |	@since	0.1.0
		 */
		movement: function(chicken){
			var width	= $(chicken.element).getStyle("width").toInt(),
				left	= $(chicken.element).getStyle("left").toInt(),
				size	= $(this.place).getStyle("width").toInt();
			
			var self = this;
			$(chicken.element).set("tween", {
				duration: 	chicken.settings.speed,
				transition:	"linear"
			});
			if(chicken.settings.direction == "left"){
				$(chicken.element).tween("left", left, size);
				$(chicken.element).get("tween").chain(function(){ self.endEvent(chicken) });
			}
			if(chicken.settings.direction == "right"){
				$(chicken.element).tween("left", left, "-" + width + "px");
				$(chicken.element).get("tween").chain(function(){ self.endEvent(chicken) });;
			}
		}
	});
	
	
	/*
	 |	INIT GAME
	 */
	function init_game(){
		chicken_game = new chickenGame();
		
		if(chicken_game.getStatus() === "invalid"){
			$("create-account").addEvent("click", function(event){
				var username = $("create-username").get("value");
				if(username.trim() == ""){
					username = "Anonymous";
				}			
				chicken_game.createGame(username);
			});
		} else {
			$("chicken-status").addEvent("click", function(event){
				event.preventDefault();
				
				if(chicken_game.getStatus() === "pause"){
					$(this).set({
						"text":		"Pause",
						"class":	"toolbar-item toolbar-button toolbar-item-red"
					});
					chicken_game.startGame();
				} else if(chicken_game.getStatus() === "play"){
					$(this).set({
						"text":		"Start",
						"class":	"toolbar-item toolbar-button toolbar-item-green"
					});
					chicken_game.pauseGame();
				}
			});
			
			chicken_maker = new chickenMaker();
			$("play").addEvent("mousedown", function(event){
				chicken_maker.clickEvent(event);
			});
		}
	}
	
	window.addEvent("domready", function(){ init_game(); });
	
})(document.id)