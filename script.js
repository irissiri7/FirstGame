// Random variables
var score = 0;
var intervalSpeed = 500;
var intervalForUpdate;
var updatePending = false;
var paused = false;

var backgroundOpacity = 1;
var backgroundSaturation = 0;
var backgroundBlur = 5;



// Canvas
var canvas = document.getElementById("myCanvas");
var canvasContent = canvas.getContext("2d");
var video = document.getElementById("myVideo");

    // Position of the head of the snake
var headX = 60;
var headY = 60;

    // Position of the treat
var treatX = 210;
var treatY = 70;



    // Draw on canvas
function drawSnake(){

    // The first element in the array (the head) should always have opacity 1 And the last element should always have
    // opacity around 0.25 (Because lower values in opacity aren't visible enough). The value of the rest of the elements
    // depend on how long the snake is. It's important though that the values are equally spaced, so that you get that
    // smooth toning effect once the snake gets longer.

    /* To acheive this we set the opacity of the head of the snake to 1, then calculate how big of a jump in values we
    need to make between each element in order to end up at the last element with a value of around 0.25.
    Then we loop through the elements, assign the opacity value and for each loop subtract that "jumpValue"*/

    /* For my own memory the jump value is calculated by taking the value I want to start with "1" subtract that by the
    value I want to end up with "0,25". Then devide that value by snake.length - 1. WHy -1? Probably because we start on
    one element already then use that value to calculate the next value. So that first element isn't counted.*/

    canvasContent.beginPath();
    canvasContent.fillStyle = "rgba(255,255,255, 1)";
    canvasContent.fillRect(snake[0][0],snake[0][1],20,20);
    var jumpValue = 0.75  / (snake.length -1);
    var opacity = 1 - jumpValue;

    for (var i = 1; i < snake.length; i++){
        canvasContent.beginPath();
        canvasContent.fillStyle = "rgba(255,255,255," + opacity +")";
        // First two values are the position and the other two are the size. So this writes out the snake at the positions in the
        // array in the correct size.
        canvasContent.fillRect(snake[i][0],snake[i][1],20,20);
        opacity -= jumpValue;
    }
}

function drawTreat(){

    if (score < 100){
        canvasContent.beginPath();

        // canvasContent.fillStyle = "white";
        // canvasContent.fillRect(100, 100, 20, 20);

        // canvasContent.translate(100 + 10, 100 + 10);
        // canvasContent.rotate((45 * Math.PI / 180));
 
        // canvasContent.fillRect(-10, -10, 20 , 20);

        // canvasContent.rotate((22 * Math.PI / 180));
 
        // canvasContent.fillRect(-10, -10, 20 , 20); 

        // canvasContent.rotate(-(67 * Math.PI / 180));
        // canvasContent.translate(-(100 + 10), -(100 + 10));

        // Getting the image from an html-element, then drawing that image at the correct position.
        var img = document.getElementById("treat");
        canvasContent.drawImage(img, treatX - 12.5, treatY -12.5, 25, 25);
    }
    else if (score < 200){
        canvasContent.beginPath();
        canvasContent.fillStyle = "rgba(255,255,255,0.8)";
        canvasContent.arc(treatX,treatY,12.5,0,2*Math.PI);
        canvasContent.fill();
    }
    else{
        canvasContent.beginPath();
        var img = document.getElementById("treat");
        img.src = "Images/treat1.png";
        canvasContent.drawImage(img, treatX - 12.5, treatY -12.5, 25, 25);
    }
}



// Direction
var direction = 39;

    // Taking the key-down event and evaluate if the direction is permitted.
    // You cannot go right when the current directions is left since the
    // snake will instantly collide with it's own body.
function directionPermitted(e){

    if (direction == 39 && (e.keyCode == 40 || e.keyCode == 38)){
        return true;
    }
    else if (direction == 37 && (e.keyCode == 40 || e.keyCode == 38)){
        return true;
    }
    else if (direction == 38 && (e.keyCode == 37 || e.keyCode == 39)){
        return true;
    }
    else if (direction == 40 && (e.keyCode == 37 || e.keyCode == 39)){
        return true;
    }
    else{
        return false;
    }
}



// Snake
var snake = [[60, 60], [40, 60], [20, 60], [0, 60]];



// Sounds
var eatSound = new sound('eat.mp3');
var failSound = new sound('failure.mp3');

//This is a function constructor that will create a variable representing an 'invisible' <audio> element on the page.
//The audio element is then played in the script.js depending on different events.
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
      this.sound.play();
    }
    this.stop = function(){
      this.sound.pause();
    }
  }



//Events
document.onkeydown = function(e) {

    // !updatePending is needed because directionPermitted() only goes by your last key-press. That means that
    // if you go right (Meaning you shouldn't go left) then you can very quickly press up and then left.
    // If you did it so quickly that it didn't have time to go up before you pressed left, then the snake will go
    // go left and collide with it's own body. This is stopped by locking the code from registrating more key-presses
    // until after the updatecycle is complete. Hence updatePending.
    if (directionPermitted(e) && !updatePending)
    {
        direction = e.keyCode;
        updatePending = true;
    }
    else if(e.keyCode == 80 || e.keyCode == 32){
        changePauseState();

    }
};

$('.virtualBtn').on('click', (event) =>{
    var e = {};
    var id = event.target.getAttribute('id');
    switch(id){
        case 'up':
            e.keyCode = 38;
            break;
        case 'down':
                e.keyCode = 40;
                break;
        case 'left':
                e.keyCode = 37;
                break;
        case 'right':
                e.keyCode = 39;
                break;
        case 'playPause':
                changePauseState();
                break;
        default:
                alert('unknown');
    }

    if (directionPermitted(e) && !updatePending)
    {
        direction = e.keyCode;
        updatePending = true;
    }
})



// Updates
function changePauseState(){
    if (paused){
        startNewInterval();
        paused = false;
    }
    else{
         // Stops the intervalForUpdate
        clearInterval(intervalForUpdate);

        // Writes out the text Paused when the game is... well... paused.
        canvasContent.font = "80px Calibri";
        canvasContent.fillStyle = "white";
        canvasContent.textAlign = "center";

        // This aligns the text in the middle. The above line is not enough.
        canvasContent.fillText("Paused", canvas.width / 2, canvas.height / 2 );
        paused = true;
    }
}


function updateState() {

    updatePending = true;
    newSnakePosition();

    // Clears the canvas of all previous images.
    canvasContent.clearRect(0, 0, canvas.width, canvas.height);

    // If the snake found a treat, then skip snake.pop() once so that it get's longer.. Also
    // update the score, get a new position of treat, speed up the game slightly, and draw.
    // The x and y position of each rectangle of the snake is at the top left corner. The + 10
    // makes sure that it registers a fruit as eaten when approaching it head on, as opposed to
    // touching the side of the fruit.
    if (treatX == snake[0][0] + 10 && treatY == snake[0][1] + 10){
        eatSound.play();
        score += 10;
        var h2 = document.getElementsByTagName("h2");
        h2[0].textContent = "Score: " + score;
        newTreatPosition();
        intervalSpeed *= 0.95;
        drawSnake();
        drawTreat();
        updatePending = false;

        updateBackground();
        startNewInterval();
    }

    else {
        snake.pop();
        drawSnake();
        drawTreat();
        updatePending = false;

    }

    checkCollision();

}

function newSnakePosition(){

    // Inserts a new head position into the snake array. If it is on it's way into the edge then
    // make it show up on the opposite site of that edge.
     if (direction == 37)
    {
        if (edgeDetected()){
            newY = snake[0][1];
            newX = canvas.width - 20;
        }
        else{
            newY = snake[0][1];
            newX = snake[0][0] -20;
        }

        snake.unshift([newX, newY]);
    }
    else if (direction == 38){

        if (edgeDetected()){
            newY = canvas.height - 20;
            newX = snake[0][0];
        }
        else{
        newY = snake[0][1] - 20;
        newX = snake[0][0];

        }

        snake.unshift([newX, newY]);
    }
    else if (direction == 39){

        if (edgeDetected()){
            newY = snake[0][1];
            newX = 0;
        }
        else{
        newY = snake[0][1];
        newX = snake[0][0] + 20;

        }

        snake.unshift([newX, newY]);
    }
    else if (direction == 40){

        if (edgeDetected()){
            newY = 0;
            newX = snake[0][0];
        }
        else{
        newY = snake[0][1] + 20;
        newX = snake[0][0];

        }

        snake.unshift([newX, newY]);
    }
}

function newTreatPosition(){
    do {
        // There is no advanced collission detection in this game. Either the XY position of the head of the snake
        // is the exact same as the XY position of the treat and only then is it registered as eaten. This demands
        // carefully calculated size of the canvas, how much the snake can move each step and of course where the
        // treat can be positioned.

        // This was a game of trail and error. I figured I needed to use "% 20 == 0" since the snake
        // moves +20 or -20 depending on direction. That worked well until I changed the start position of
        // the snake. Because of how I changed the position I figured I could try "%20 == 10" and it worked.

        // Here a value between 10 and (canvas.height - 10) is randomized. That becomes the new Y position of the new treat. This loops checks of it's
        // an acceptable position and randomizes a new number if it's not.

        treatY = Math.floor(Math.random() * (canvas.height - 25)) + 25;

    } while(treatY % 20 !== 10)

    do {
        treatX = Math.floor(Math.random() * (canvas.width - 25)) + 25;
    } while (treatX % 20 !== 10)
}

function updateBackground(){
    // Makes the background change gradually each eaten fruit. If the opacity is is 0 meaning that
    // the video is fully visible then start making the video sharper and more colorful.
    if (backgroundOpacity < 0.1){
        backgroundSaturation += 10;
        backgroundBlur -= 0.5;
        video.style.filter = "saturate("+ backgroundSaturation + "%) blur(" + backgroundBlur + "px)";
    }
    else{
        backgroundOpacity -= 0.1;
        canvas.style.backgroundColor = "rgba(0, 0, 0, " + backgroundOpacity + ")";
    }
}

function edgeDetected(){
    // In order to detect if the snake should be appearing on the opposite side of the canvas we need
    // both position and direction. You can for example move parallell with the right edge and press left
    // and that shouldn't do anything. So need to be by the edge and still going towards it.

    if (snake[0][0] <= 0 && direction == 37){

        return true;
    }

    else if (snake[0][0] >= canvas.width - 20 && direction == 39){
        return true;
    }

    else if (snake[0][1] <= 0 && direction == 38){
        return true;
    }

    else if (snake[0][1] >= canvas.height - 20 && direction == 40){

        return true;
    }


    else{
        return false;
    }
}

function checkCollision(){

    // Loops through all the body parts of the snake, except the head and checks if the head is
    // in the same position as either of these parts. If so then Game over.
    for (var i = 1; i < snake.length; i++){
        if (snake[0][0] == snake[i][0] && (snake[0][1] == snake[i][1])){
            failSound.play();
            alert("Game over");
        }
    }
}

function startNewInterval(){
    clearInterval(intervalForUpdate)
    intervalForUpdate = setInterval(function(){

        updateState();

   }, intervalSpeed);

}

// Call methods on start
drawSnake();
startNewInterval();