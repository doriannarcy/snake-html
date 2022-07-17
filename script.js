/*
Snake Game by Blackdori (Dorian Narcy)
           /^\/^\
         _|__|  O|
\/     /~     \_/ \
 \____|__________/  \
        \_______      \
                `\     \                 \
                  |     |                  \
                 /      /                    \
                /     /                       \\
              /      /                         \ \
             /     /                            \  \
           /     /             _----_            \   \
          /     /           _-~      ~-_         |   |
         (      (        _-~    _--_    ~-_     _/   |
          \      ~-____-~    _-~    ~-_    ~-_-~    /
            ~-_           _-~          ~-_       _-~
               ~--______-~                ~-___-~
;D
*/
const music = new Audio("music.mp3");
const biteSound = new Audio("bite.mp3");
const gameOverSound = new Audio("game over.wav");
const newRecordSound = new Audio("new record.m4a");
const startSound = new Audio("start.mp3");

const canvas = document.getElementById("snake");
const scoreBox = document.getElementById("score");
const recordBox = document.getElementById("record");
const ctx = canvas.getContext("2d");

const fps = 10;
const timeStep = 1000/fps;

const boxWidth = 30;
const boxHeight = 30;
const gridWidth = 25;
const gridHeight = 15;
const canvasWidth = gridWidth * boxWidth;
const canvasHeight = gridHeight * boxHeight;

const initialSnakeLenght = 6;

const snakeColor = "green";
const appleColor = "red";
const headColor = "darkgreen";

const leftKey = "q";
const rightKey = "d";
const upKey = "z";
const downKey = "s";
const playKey = " ";

ctx.canvas.width = canvasWidth;
ctx.canvas.height = canvasHeight;
canvas.style.backgroundColor = "black";


class Snake
{
    constructor()
    {
        this.reset();
    }

    getLenght()
    {
        return this.parts.length;
    }

    setDirection(direction)
    {
        this.direction = direction;
    }

    advance()
    {
        let direction;
        switch(this.direction)
        {
            case "right":
                direction = [1, 0];
                break;
            case "left":
                direction = [-1, 0];
                break;
            case "down":
                direction = [0, 1];
                break;
            case "up":
                direction = [0, -1];
                break;
            default:
                direction = [0, 0];
                break;
        }
        const headX = this.parts[0][0];
        const headY = this.parts[0][1];
        const newHeadX = headX + direction[0];
        const newHeadY = headY + direction[1];
        this.parts.unshift([newHeadX, newHeadY]);
        this.parts.pop();
    }

    draw()
    {
        ctx.fillStyle = headColor;
        for (let part of this.parts)
        {
            ctx.fillRect(part[0]*boxWidth, part[1]*boxHeight, boxWidth, boxHeight);
            ctx.fillStyle = snakeColor;
        }
    }

    eatHimself()
    {
        const headX = this.parts[0][0];
        const headY = this.parts[0][1];
        for (let i = 1; i < this.parts.length; i++)
        {
            if (this.parts[i][0] == headX && this.parts[i][1] == headY)
            {
                return true;
            }
        }
        return false;
    }

    addPart()
    {
        const queueX = this.parts[this.parts.length-1][0];
        const queueY = this.parts[this.parts.length-1][1];
        this.parts.push([queueX, queueY]);
    }

    isInWall()
    {
        const headX = this.parts[0][0];
        const headY = this.parts[0][1];

        if (headX >= gridWidth || headX < 0 || headY >= gridHeight || headY < 0) return true;

        return false;
    }

    reset()
    {
        this.direction = "right";
        this.parts = [];
        this.parts.push([Math.floor(gridWidth/2), Math.floor(gridHeight/2)]);
        for (let i = 1; i < initialSnakeLenght; i++)
        {
            this.parts.push([Math.floor(gridWidth/2)-1, Math.floor(gridHeight/2)]);
        }
    }
}

class Apple
{
    constructor()
    {
        this.newRandomPosition();
    }

    newRandomPosition()
    {
        do
        {
            this.x = Math.floor(Math.random()*gridWidth);
            this.y = Math.floor(Math.random()*gridHeight);
        }
        while (this.isOnSnake())
    }

    isOnSnake()
    {
        for (let part of snake.parts)
        {
            if (this.x == part[0] && this.y == part[1])
            {
                return true;
            }
        }
        return false;
    }

    draw()
    {
        ctx.fillStyle = appleColor;
        ctx.fillRect(this.x*boxWidth, this.y*boxHeight, boxWidth, boxHeight);
    }

    reset()
    {
        this.direction = "right";
        this.parts = [];
        for (let i = 0; i < initialSnakeLenght; i++)
        {
            this.parts.push([initialSnakeLenght-i-2, 0]);
        }
    }
}

function loop()
{
    const date = new Date();
    let newTime = date.getTime();
    if (!playing)
    {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        snake.draw();
        apple.draw();
        window.requestAnimationFrame(loop);
        return;
    }
    if (newTime - lastTime < timeStep)
    {
        window.requestAnimationFrame(loop);
        return;
    }
    // ===
    snake.advance();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    snake.draw();
    apple.draw();
    if (apple.isOnSnake())
    {
        biteSound.play();
        snake.addPart();
        apple.newRandomPosition();
    }
    const score = snake.getLenght() - initialSnakeLenght;
    if (snake.eatHimself() || snake.isInWall())
    {
        // LOSE
        if (score > record)
        {
            newRecordSound.play();
            record = score;
            recordBox.innerText = `BEST : ${record} Pts`;
        }
        else
        {
            gameOverSound.play();
        }
        playing = false;
        snake.reset();
        apple.newRandomPosition();
        window.requestAnimationFrame(loop);
        return;
    }
    scoreBox.innerText = `SCORE : ${score} Pts`;
    // ===
    lastTime = newTime;
    window.requestAnimationFrame(loop);
}

const snake = new Snake();
const apple = new Apple();
let lastTime = 0;
let record = 0;
let playing = false
recordBox.innerText = `BEST : ${record} Pts`;
music.play();
music.loop = true;

document.addEventListener("keydown", (event) => {
    switch(event.key)
    {
        case leftKey:
            if (snake.direction != "right")
            {
                snake.setDirection("left");
            }
            break;
        case rightKey:
            if (snake.direction != "left")
            {
                snake.setDirection("right");
            }  
            break;
        case upKey:
            if (snake.direction != "down")
            {
            snake.setDirection("up");
            }
            break;
        case downKey:
            if (snake.direction != "up")
            {
                snake.setDirection("down");
            }
            break;
        case playKey:
            if (playing == false)
            {
                startSound.play();
            }
            playing = true;
            break;
    }
});

// disable realoading
window.onbeforeunload = function () {return false;}

window.requestAnimationFrame(loop);
