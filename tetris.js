//HTML canvas stuff
var c = document.getElementById("play-area");
var ctx = c.getContext("2d");
//ctx.translate(0.5, 0.5);	//get rid of blur

//global variables
var WIDTH = 300;
var HEIGHT = 600;
var ROWS = 20;	//standard tetris board
var COLS = 10;	//standard tetris board
var BLOCK_WIDTH = WIDTH / COLS
var BLOCK_HEIGHT = HEIGHT / ROWS;
var main_game;
var active;

//all possible piece shapes stored in array of 4x4 arrays.
var pieces = [
	[
		[0,0,0,0],
		[0,1,1,0],
		[0,1,1,0],
		[0,0,0,0]
	],
	[
		[0,0,0,0],
		[0,2,2,0],
		[2,2,0,0],
		[0,0,0,0]
	],
	[
		[0,0,0,0],
		[3,3,0,0],
		[0,3,3,0],
		[0,0,0,0]
	],
	[
		[0,0,0,0],
		[0,4,0,0],
		[0,4,0,0],
		[0,4,4,0]
	],
	[
		[0,0,0,0],
		[0,0,5,0],
		[0,0,5,0],
		[0,5,5,0]
	],
	[
		[0,6,0,0],
		[0,6,0,0],
		[0,6,0,0],
		[0,6,0,0]
	],
	[
		[0,0,0,0],
		[7,7,7,0],
		[0,7,0,0],
		[0,0,0,0]
	]
];

/*
 *	MOVEMENT
 */

//add event listener for keypresses - execute the control function on keypress
window.addEventListener('keydown', control);

//execute on keypress(arrows || ASDF)
function control(e){
	e.preventDefault();

	//P
	if(e.keyCode == 80){
		if(active && main_game.paused == false){
			main_game.paused = true;
			// Store the context and clear;
			ctx.save();
			ctx.clearRect(0, 0, c.width, c.height);


		} else if(active && main_game.paused){
			main_game.paused = false;
			// Restore the transform
			ctx.restore();
		} else {
			startGame();
		}
	}

	//only allow movement if main game is not paused
	if(e.keyCode == 37 || e.keyCode == 65) //left
	{

		if(validMove(-1, 0))
		{
			main_game.move(-1, 0);
		}

	}
	else if(e.keyCode == 39 || e.keyCode == 68) //right
	{

		if(validMove(1, 0))
		{
			main_game.move(1, 0);
		}

	}
	else if(e.keyCode == 40 || e.keyCode == 83) //down
	{

		if(validMove(0,1))	// 0,0 is top left for html canvas? or is that just SVG
		{
			main_game.move(0, 1);
		}

	}
	else if(e.keyCode == 32) //spacebar
	{
		console.log("drop");
		//drop();	//TODO
	}
	else if(e.keyCode == 38 || e.keyCode == 74) //up/J
	{
		if(validMove(0,0,"left"))
		{
			main_game.rotate("left");
		}
	}
	else if(e.keyCode == 75) //K
	{
		if(validMove(0,0,"right"))
		{
			main_game.rotate("right");
		}
	}
}

//check if the user's move is valid.
function validMove(x, y, rotation = false){
	//make temp piece for checking collisions.
	var tempPiece = {
		x: main_game.currPiece.x + x,
		y: main_game.currPiece.y + y,
		shape: main_game.currPiece.shape
	}
	//check rotation only if necessary
	if(rotation)
	{
		tempPiece.shape = rotate(tempPiece.shape, rotation)
	}

	//if there's a collision, no dice.
	if(collision(main_game.board, tempPiece))
	{
		return false;
	}
	else
	{
		return true;
	}

}

function collision(board, piece){
	//iterate across the entire piece
	for(var i = 0; i < 4; i++){
		for(var j = 0; j < 4; j++){
			if(piece.shape[i][j]){ //if there's a 1 in that array position - i.e. a "block" in the tetris piece, check for a collision.
				if( piece.y+i >= ROWS || //if the combination of the piece's y position plus the location of the current block would be outside game area OR
					piece.x+j >= COLS || //if the combination of the piece's x position plus the location of the current block would be outside game area OR
					piece.x+j < 0 ||
					board[piece.y+i][piece.x+j] 	//if there is a block (1) in that position on the board already	//TODO - may need tweaking
				  ){
					return true;
				  }
			}
		}
	}
	//if none of the above checks pass, there's no collision.
	return false;
}

//drop the piece.
function drop(){

}

//rotate the piece (all pieces should be 4x4 arrays.
function rotate(piece, direction){
	if(direction == "left")
	{
		return [
			[piece[0][3], piece[1][3], piece[2][3], piece[3][3]],
			[piece[0][2], piece[1][2], piece[2][2], piece[3][2]],
			[piece[0][1], piece[1][1], piece[2][1], piece[3][1]],
			[piece[0][0], piece[1][0], piece[2][0], piece[3][0]]
		];
	}
	else if(direction == "right")
	{
		return [
			[piece[3][0], piece[2][0], piece[1][0], piece[0][0]],
			[piece[3][1], piece[2][1], piece[1][1], piece[0][1]],
			[piece[3][2], piece[2][2], piece[1][2], piece[0][2]],
			[piece[3][3], piece[2][3], piece[1][3], piece[0][3]]
		];
	}
}

/*
 *	GAME OBJECT
 */
function tetris_game(){
	//general
	this.paused = false;
	this.gameOver = false;
	this.score = 0;
	this.speed = 700;

	//define tetris board
	this.board = [];


	//piece is represented as simple object with x position, y position, and shape properties.
	this.currPiece = {
		x: 3,	//TODO - replace with calculation
		y: 0,
		shape: newShape()
	}

	//for the next piece, we only need to store the shape.
	this.nextPiece = {
		x: 3,	//TODO - replace with calculation
		y: 0,
		shape: newShape()
	}

	//start point for new pieces
	this.startX = 3;
	this.startY = -1;



	//various methods//

	//method to draw a new board.
	this.init = function(){
		for(var i=0;i<ROWS;i++)
		{
			//create empty row
			this.board[i] = [];
			for(var j=0;j<COLS;j++)
			{
				//initialize each tile on the board to 0.
				this.board[i][j] = 0;
			}
		}
		drawNext(this.nextPiece.shape);
		drawScore(this.score);
	}


	this.tick = function(){
		if(this.paused || this.gameOver)
		{
			//do not tick if the game is paused, or if the game is over.
			return false;
		}

		//placeholder for deep copy.  need to check if y+1 will have a collision without
		//altering the original piece object.
		var tempPiece = {
			x: this.currPiece.x,
			y: this.currPiece.y + 1,
			shape: this.currPiece.shape
		};

		if(collision(this.board, tempPiece))
		{
			//write piece to board
			this.addPiece(this.board, this.currPiece);
			var multiplier = destroyRows(this.board);		//destroys rows in place on the board, and returns a multiplier based on # destroyed.
			this.score += (1 + (multiplier * 100));



			//get next piece
			this.currPiece = this.nextPiece;

			//reuse placeholder piece and make it the next piece.
			tempPiece.x = 3;	//TODO - replace with calculation
			tempPiece.y = -1;
			tempPiece.shape = newShape();

			//next piece, update score and next piece
			this.nextPiece = tempPiece;
			drawBoard(this.board, this.currPiece);
			drawNext(this.nextPiece.shape);
			drawScore(this.score);
		}
		else
		{
			this.currPiece.y++;	//if no collision, move the piece down.
			drawBoard(this.board, this.currPiece);
		}
	}

	/*
	 *	CONTROL METHODS
	 */

	this.move = function(x, y){
		this.currPiece.y += y;
		this.currPiece.x += x;
		drawBoard(this.board, this.currPiece);
	}

	this.rotate = function(direction){
		this.currPiece.shape = rotate(this.currPiece.shape, direction);
		drawBoard(this.board, this.currPiece);
	}

	this.togglePaused = function(){
		this.paused = !this.paused;
	}

	//Add piece to board.  Recreates the board, adding in the new piece at its X and Y location.
	this.addPiece = function (board, piece){
		var newBoard = board;

		//if y position is 0, player has lost
		if(piece.y <= 0){
			this.gameOver = true;
			GameOver(this.score);
		}

		for(var i = 0; i < 4; i++)
		{
			for(var j = 0; j < 4; j++)
			{
				//if there's a block
				if(piece.shape[i][j])
				{
					//i.e piece.shape[i][j] = 1 now instead of 0
					newBoard[piece.y+i][piece.x+j] = piece.shape[i][j];
				}
			}
		}

		return newBoard;
	}
}





/*
 *	utility functions
 */
function newShape(){
	//generate a random piece
	var random = Math.floor(Math.random() * pieces.length);
	var shape = pieces[random];
	return shape;
}



//destroy completed rows on a designated board (in place) and return a score multiplier.
function destroyRows(board){
	var multiplier = 0;

	for(var i = ROWS-1; i >= 0; i--){			//go through each row
		while(!board[i].includes(0))			//if row is complete
		{
			multiplier = (multiplier == 0) ? 1 : multiplier *= 2;					//double multiplier
			for(var j = i; j>=0; j--){		//shift every row down
				if(j != 0)
				{
					board[j] = board[j-1];
				}
				else
				{
					board[j] = [0,0,0,0,0,0,0,0,0,0]	//insert blank row at top
				}
			}
		}

	}

	return multiplier;
}



var testBoard = [
	[0,1,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,1,1,1,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,1,0,0,1,0,1,1],
	[1,1,1,1,1,2,3,4,1,1],
	[1,1,1,1,1,1,1,1,1,1]
]



/*
 *	GRAPHICS
 */

var colors = ["red",  "violet", "blue", "yellow", "green", "orange", "cyan"];

function drawBoard(board, piece){

	//draw board
	for(var x = 0; x < COLS; x++)
	{
		for(var y = 0; y < ROWS; y++)
		{
			//draw the blocks if they exist
			if(board[y][x])
			{
				ctx.strokeStyle = 'black';
				ctx.lineWidth = '2';
				ctx.fillStyle = colors[board[y][x]-1];
				ctx.fillRect(BLOCK_WIDTH * x, BLOCK_HEIGHT * y, BLOCK_WIDTH - 1, BLOCK_HEIGHT - 1) //(x, y, width, height)
				ctx.strokeRect(BLOCK_WIDTH * x, BLOCK_HEIGHT * y, BLOCK_WIDTH - 1, BLOCK_HEIGHT - 1)


			} else	//else draw empty grid space
			{
				ctx.strokeStyle = '#adadad';
				ctx.lineWidth = '0.2';
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(BLOCK_WIDTH * x, BLOCK_HEIGHT * y, BLOCK_WIDTH - 1, BLOCK_HEIGHT - 1) //(x, y, width, height)
				ctx.strokeRect(BLOCK_WIDTH * x, BLOCK_HEIGHT * y, BLOCK_WIDTH - 1, BLOCK_HEIGHT - 1)

			}
		}
	}

	//draw moving piece
	for(var x = 0; x < piece.shape[0].length; x++)
	{
		for(var y = 0; y < piece.shape.length; y++)
		{
			if(piece.shape[y][x])
			{
				ctx.strokeStyle = "black";
				ctx.lineWidth = '2';
				ctx.fillStyle = colors[piece.shape[y][x]	-1];
				ctx.fillRect(BLOCK_WIDTH * x + BLOCK_WIDTH * piece.x, BLOCK_HEIGHT * y +  BLOCK_HEIGHT * piece.y, BLOCK_WIDTH - 1, BLOCK_HEIGHT - 1)
				ctx.strokeRect(BLOCK_WIDTH * x + BLOCK_WIDTH * piece.x, BLOCK_HEIGHT * y +  BLOCK_HEIGHT * piece.y, BLOCK_WIDTH - 1, BLOCK_HEIGHT - 1)
			}
			/*
			else //TODO - highlight for debug purposes - remove later.
			{
				ctx.fillStyle = "rgba(255, 235, 235, 0.5)";
				ctx.fillRect(BLOCK_WIDTH * x + BLOCK_WIDTH * piece.x, BLOCK_HEIGHT * y +  BLOCK_HEIGHT * piece.y, BLOCK_WIDTH - 1, BLOCK_HEIGHT - 1);
			}
			*/
		}
	}
}

//TODO - make responsive?  Rebuild as SVG?
function drawDashboard(){

	//draw dashboard
	ctx.strokeStyle = "black";
	ctx.lineWidth = '2';
	ctx.beginPath();
	ctx.moveTo(WIDTH, 0);
	ctx.lineTo(WIDTH, HEIGHT);
	ctx.stroke();


	//draw next box
	ctx.strokeStyle = "black";
	ctx.rect(WIDTH+49.5,30.5,BLOCK_WIDTH*2,BLOCK_HEIGHT*2 + 4);
	ctx.fillStyle = "#aaaaaa"
	ctx.fillText("NEXT", WIDTH+60.5, 22.5);

	//draw score box
	ctx.rect(WIDTH+20.5,150.5,110.5,40.5);
	ctx.fillStyle = "#aaaaaa"
	ctx.fillText("SCORE", WIDTH+60.5, 144.5);
	ctx.stroke();
}

function drawNext(shape){
	for(var x = 0; x < shape[0].length; x++)
	{
		for(var y = 0; y < shape.length; y++)
		{
			if(shape[y][x])
			{
				ctx.strokeStyle = "black";
				ctx.lineWidth = '2';
				ctx.fillStyle = colors[shape[y][x]-1];
				ctx.fillRect(WIDTH+49.5 + (BLOCK_WIDTH/2) * x ,34.5 + (BLOCK_HEIGHT/2) * y, (BLOCK_WIDTH/2) - 1, (BLOCK_HEIGHT/2) - 1);
				ctx.strokeRect(WIDTH+49.5 + (BLOCK_WIDTH/2) * x ,34.5 + (BLOCK_HEIGHT/2) * y, (BLOCK_WIDTH/2)  - 1, (BLOCK_HEIGHT/2) - 1);
			}
			else //TODO - highlight for debug purposes - remove later.
			{
				ctx.strokeStyle = "white"
				ctx.fillStyle = "white"
				ctx.fillRect(WIDTH+49.5 + (BLOCK_WIDTH/2) * x ,34.5 + (BLOCK_HEIGHT/2) * y, (BLOCK_WIDTH/2) - 1, (BLOCK_HEIGHT/2) - 1);
				ctx.strokeRect(WIDTH+49.5 + (BLOCK_WIDTH/2) * x ,34.5 + (BLOCK_HEIGHT/2) * y, (BLOCK_WIDTH/2)  - 1, (BLOCK_HEIGHT/2) - 1);
			}
		}
	}
}

function drawScore(score){
	ctx.fillStyle = "white";
	ctx.strokeStyle = "white";
	ctx.fillRect(WIDTH+50, 160.5, 60, 25);
	ctx.strokeRect(WIDTH+50, 160.5, 60, 25);

	ctx.fillStyle = "black";
	ctx.strokeStyle = "black";
	ctx.font="30px VT323";
	ctx.fillText(score, WIDTH+60.5, 178.5);
	ctx.stroke();
}

/*
 *	Start game
 */
var gameTimer;

function startGame(){
	main_game = new tetris_game();
	main_game.init();

	active = true;

	ctx.clearRect(0, 0, c.width, c.height);
	drawBoard(main_game.board, main_game.currPiece);
	drawDashboard();

	//game loop
	gameTimer = window.setInterval(function(){
		main_game.tick();
	}, main_game.speed);
}

function GameOver(score){
	window.clearInterval(gameTimer);
	active = false;
	window.setTimeout(function(){
		ctx.clearRect(0, 0, c.width, c.height);

		ctx.fillStyle = "black";
		ctx.strokeStyle = "black";
		ctx.font="50px VT323";
		ctx.fillText("YOU LOSE", 75, HEIGHT/2);

		ctx.font="30px VT323";
		ctx.fillText("score: " + score, 75, HEIGHT/2 + 30);
		ctx.stroke();

		ctx.font="30px VT323";
		ctx.fillText("Press P to play again", 30, HEIGHT/2 + 60);
		ctx.stroke();
	}, 500);


}
