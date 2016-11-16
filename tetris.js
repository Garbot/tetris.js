//HTML canvas stuff
var c = document.getElementById("play-area");
var ctx = c.getContext("2d");


//global variables
var WIDTH = 350;
var HEIGHT = 700;
var ROWS = 20;	//standard tetris board
var COLS = 10;	//standard tetris board
var BLOCK_WIDTH = WIDTH / COLS
var BLOCK_HEIGHT = HEIGHT / ROWS;
var main_game;

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
	if(e.keyCode == 37 || e.keyCode == 65) //left
	{
		console.log("left");
		if(validMove(-1, 0))
		{
			main_game.move(-1, 0);	//TODO
		}
	}
	else if(e.keyCode == 39 || e.keyCode == 68) //right
	{
		console.log("right");
		if(validMove(1, 0))
		{
			main_game.move(1, 0);  //TODO
		}
	}
	else if(e.keyCode == 40 || e.keyCode == 83) //down
	{
		console.log("down");
		if(validMove(0,1))	//TODO - 0,0 is top left for html canvas? or is that just SVG
		{
			main_game.move(0, 1); //TODO
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
			console.log("rotate left");
			main_game.rotate("left");
		}
	}
	else if(e.keyCode == 75) //K
	{
		if(validMove(0,0,"right"))
		{
			console.log("rotate right");
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
	}

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
			addPiece(this.board, this.currPiece);
			var multiplier = destroyRows(this.board);		//destroys rows in place on the board, and returns a multiplier based on # destroyed.
			this.score += (1 + (multiplier * 100));
			
			//get next piece
			this.currPiece = this.nextPiece;
			
			//reuse placeholder piece and make it the next piece.
			tempPiece.x = 3;	//TODO - replace with calculation
			tempPiece.y = 0;
			tempPiece.shape = newShape();
			
			this.nextPiece = tempPiece;
			drawBoard(this.board, this.currPiece);
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


//Add piece to board.  Recreates the board, adding in the new piece at its X and Y location.
function addPiece(board, piece){
	var newBoard = board;
	for(var i = 0; i < 4; i++)
	{
		for(var j = 0; j < 4; j++)
		{
			//if there's a block
			if(piece.shape[i][j])
			{
				console.log(i, j);
				console.log(piece.y+i, piece.x+j);
				console.log(newBoard[piece.y+i][piece.x+j]);
				//i.e piece.shape[i][j] = 1 now instead of 0
				newBoard[piece.y+i][piece.x+j] = piece.shape[i][j];
			}
		}
	}
	return newBoard;
}

//destroy completed rows on a designated board (in place) and return a score multiplier.
function destroyRows(board){
	var multiplier = 1;
	
	for(var i = ROWS-1; i >= 0; i--){			//go through each row
		while(!board[i].includes(0))			//if row is complete
		{
			multiplier *= 2;					//double multiplier
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
 
var colors = ["red",  "violet", "blue", "yellow", "green", "orange", "pink"];

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
				ctx.strokeStyle = 'grey';
				ctx.lineWidth = '1';
				ctx.fillStyle = 'white';
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
				ctx.strokeStyle = 'black';
				ctx.lineWidth = '2';
				ctx.fillStyle = colors[piece.shape[y][x]	-1];
				ctx.fillRect(BLOCK_WIDTH * x + BLOCK_WIDTH * piece.x, BLOCK_HEIGHT * y +  BLOCK_HEIGHT * piece.y, BLOCK_WIDTH - 1, BLOCK_HEIGHT - 1)
				ctx.strokeRect(BLOCK_WIDTH * x + BLOCK_WIDTH * piece.x, BLOCK_HEIGHT * y +  BLOCK_HEIGHT * piece.y, BLOCK_WIDTH - 1, BLOCK_HEIGHT -1)
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

function startGame(){
	main_game = new tetris_game();
	main_game.init();
	drawBoard(main_game.board, main_game.currPiece);
	
	//game loop
	window.setInterval(function(){
		main_game.tick();
	}, main_game.speed);
}

//for testing purposes only		//TODO - remove
function printPiece(piece){
	for(i=0;i<piece.length;i++){
		console.log(piece[i]);
	}
}

