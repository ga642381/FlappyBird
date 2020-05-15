let cvsWrapper = null;

let MODE;
let SCORE;
let state;
let MUTE = false;

//Image
let bgsImg;
let bgImg;
let bgImgScale;
let birdsImg;
let startImg;
let scoresImg;
const birdW = 51;
const birdH = 36;
const birdFireW = 90;
const birdFireH = 45;
const pipeW = 78;
const pipeH = 480;
const pipeGap = 150;
const pipeInterval = 300;
const fireW = 36;
const fireH = 63;
const scoreW = 36;
const scoreH = 54;
const scoreBestW = 12;
const scoreBestH = 27;
let gotScore;

let bgX, bgY;
let baseX, baseY;
let pipe0X, pipe1X;
let fireX, fireY;
let pipeCycle;
let pipeBorder, fireBorder;


const birdIniX = 190;  //  width / 2.5
const birdIniY = 300;  //  height / 2.5
const birdUpAngle = -0.5;
let birdAngle = birdUpAngle;
const angleCoolCount = 30;
let stayAngleCount = angleCoolCount;
let birdBorderX;
let birdBorderY;
const fireStep = 2750;

//start screen
const flapCycle = 27;
const flapCycleFire = 9;
const upDownPosition = [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 4, 4, 6, 6, 8, 8, 10, 10, 10, 12, 12, 12, 12, 12, 12, 12, 12, 10, 10, 10, 8, 8, 6, 6, 4, 4, 2, 2, 2];;
const upDownCycle = upDownPosition.length;

let flapCount;
let flapCountFire;
let upDownCount;
let pose;

//physics parameter
const VDefBg = 1;
const VDefBase = 4;
const a = 0.5;
const alpha = 0.028;
const Vup = 8.66;
let Vy = 0;
const fireVy = 1;

//
let BESTSCORE = 0;


// assets from: https://github.com/sourabhv/FlapPyBird/tree/master/assets

function preload() {
    /*#################### ( image ) ##################*/
    baseImg = loadImage("assets/sprites/base.png");
    startImg = loadImage("assets/sprites/message.png");
    gameOverImg = loadImage("assets/sprites/gameover.png");
    fireImg = loadImage("assets/sprites/fire.png");

    soundOnImg = loadImage("assets/sprites/soundOn.png");
    soundOffImg = loadImage("assets/sprites/soundOff.png");

    bgsImg = ["day", "night"].map(
        light => loadImage(`assets/sprites/background-${light}.png`)
    );

    birdsImg = ["blue", "red", "yellow"].map(
        color => ["midflap", "upflap", "downflap"].map(
            flap => loadImage(`assets/sprites/${color}bird-${flap}.png`)
        )
    );

    birdsFireImg = ["midflap", "upflap", "downflap"].map(
        flap => loadImage(`assets/sprites/redbird-${flap}-fire.png`)
    )

    pipesGImg = ["upper", "lower"].map(
        position => loadImage(`assets/sprites/pipe-green-${position}.png`)
    )

    pipesRImg = ["upper", "lower"].map(
        position => loadImage(`assets/sprites/pipe-red-${position}.png`)
    )

    scoresImg = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
        number => loadImage(`assets/sprites/${number}.png`)
    )



    /*#################### ( audio ) ##################*/
    wingSound = loadSound("assets/audio/wing.ogg");
    scoreSound = loadSound("assets/audio/point.ogg");
    hitSound = loadSound("assets/audio/hit.ogg");
    dieSound = loadSound("assets/audio/die.ogg");
    swooshSound = loadSound("assets/audio/swoosh.ogg");
}



function setup() {
    // Game basic setup.
    // Mounting canvas onto div for convenient styling.
    cvsWrapper = document.getElementById("canvasWrapper");
    const myCanvas = createCanvas(
        cvsWrapper.offsetWidth,
        cvsWrapper.offsetHeight
    );
    myCanvas.parent("canvasWrapper");


    /*################( hyper variable )##############*/
    MODE = "start";
    state = "flying";
    SCORE = 0;
    gotScore = [false, false]

    /*################# ( environment setup ) ################*/
    bgImg = bgsImg[floor(random() * 2)];
    bgImgScale = width / bgImg.width;
    bgW = bgImg.width * bgImgScale;
    bgH = bgImg.height * bgImgScale;
    bgX = 0;
    bgY = 0;

    baseScale = width / baseImg.width;
    baseW = baseImg.width * baseScale;
    baseH = baseImg.height * baseScale;
    baseX = 0;
    baseY = height - baseH;
    fireY = random(100, height - baseH - 400);

    pipe0X = 700;
    pipe1X = pipe0X + pipeInterval;

    pipe0L = random(100, height * 1 / 2);
    pipe1L = random(100, height * 1 / 2);

    pipeCycle = 0;


    vBg = VDefBg;
    vBase = VDefBase;

    /*################# ( bird setup ) ################*/
    bird = birdsImg[floor(random() * 3)]; //bird color
    birdFire = birdsFireImg;
    birdAngle = birdUpAngle;
    stayAngleCount = angleCoolCount;

    flapCount = 0;
    flapCountFire = 0;
    upDownCount = 0;
    fireStepCount = fireStep;
    fireSoundCount = 0;

}

function draw() {
    // Render function (called per frame.)
    background(0);

    /*########################## ( START ) #########################*/

    if (MODE == "start") {



        //draw the backgound 
        image(bgImg, bgX, bgY, width, bgH);
        image(bgImg, bgX + width, bgY, width, bgH);
        bgX = bgX - vBg; if (-bgX >= width) { bgX = 0; }


        //draw the base
        image(baseImg, baseX, baseY, width, baseH);
        image(baseImg, baseX + width, baseY, width, baseH);
        baseX -= vBase - vBg; if (-baseX >= width) { baseX = 0; }

        //draw the start image        
        image(startImg, 32, 170, startImg.width * 2, startImg.height * 2)

        if (!MUTE) {
            image(soundOnImg, width - soundOnImg.width * 2 / 3, height - soundOnImg.height * 2 / 3, soundOnImg.width * 2 / 3, soundOnImg.height * 2 / 3)
        }

        else if (MUTE) {
            image(soundOffImg, width - soundOffImg.width * 2 / 3, height - soundOffImg.height * 2 / 3, soundOffImg.width * 2 / 3, soundOffImg.height * 2 / 3)
        }

        //draw the bird
        flapCount++; if (flapCount % flapCycle == 0) { flapCount = 0 };
        upDownCount++; if (upDownCount % upDownCycle == 0) { upDownCount = 0 };
        birdFlyingY = birdIniY + upDownPosition[upDownCount]
        pose = floor(flapCount / 9);
        image(bird[pose], birdIniX, birdFlyingY, 51, 36);

    }


    /*########################## ( PLAYING  ) #########################*/
    //draw the bird (playing)
    if (MODE == "playing") {

        /*----draw environment"----*/


        //draw the backgound 
        image(bgImg, bgX, bgY, width, bgH);
        image(bgImg, bgX + width, bgY, width, bgH);
        bgX = bgX - vBg; if (-bgX >= width) { bgX = 0; }

        //draw the pipe
        image(pipesGImg[0], pipe0X, -(pipeH - pipe0L), pipeW, pipeH);
        image(pipesGImg[1], pipe0X, pipe0L + pipeGap, pipeW, pipeH);

        image(pipesGImg[0], pipe1X, -(pipeH - pipe1L), pipeW, pipeH);
        image(pipesGImg[1], pipe1X, pipe1L + pipeGap, pipeW, pipeH);

        let prevPipeNumber = pipeCycle;
        pipe0X -= vBase - vBg; if (pipe0X <= -100) {
            pipe0X = pipe1X + pipeInterval;
            pipe0L = random(100, height * 1 / 2);
            gotScore[0] = false;
        };

        pipe1X -= vBase - vBg; if (pipe1X <= -100) {
            pipe1X = pipe0X + pipeInterval;
            pipe1L = random(100, height * 1 / 2);
            gotScore[1] = false;
            pipeCycle++;
        };

        //draw fire
        if (pipeCycle - prevPipeNumber == 1) {
            fireY = random(100, height - baseH - 400);
        }

        if (pipeCycle % 7 == 0) {
            fireY += fireVy;
            fireX = pipe1X - 60;
            image(fireImg, fireX, fireY);

        }




        //draw the base
        image(baseImg, baseX, baseY, width, baseH);
        image(baseImg, baseX + width, baseY, width, baseH);
        baseX -= vBase - vBg; if (-baseX >= width) { baseX = 0; }

        [birdBorderX, birdBorderY] = getBirdBorder(birdW, birdH, birdAngle);
        fireBorder = getFireBorder();
        pipeBorder = getPipeBorder();



        //draw score
        if (SCORE < 10) {
            image(scoresImg[SCORE], width / 2 - scoreW / 2, 100, scoreW, scoreH);
        }

        else if (SCORE >= 10 && SCORE <= 99) {
            let firstNumber = floor(SCORE / 10);
            let secondNumber = SCORE % 10;
            image(scoresImg[firstNumber], width / 2 - scoreW, 100, scoreW, scoreH);
            image(scoresImg[secondNumber], width / 2, 100, scoreW, scoreH);

        }

        else if (SCORE >= 100) {
            let firstNumber = floor(SCORE / 100);
            let secondNumber = floor((SCORE - firstNumber * 100) / 10);
            let thirdNumber = floor(SCORE - firstNumber * 100 - secondNumber * 10);

            image(scoresImg[firstNumber], width / 2 - scoreW * 3 / 2, 100, scoreW, scoreH);
            image(scoresImg[secondNumber], width / 2 - scoreW / 2, 100, scoreW, scoreH);
            image(scoresImg[thirdNumber], width / 2 + scoreW / 2, 100, scoreW, scoreH);
        }


        if (BESTSCORE < 10) {
            image(scoresImg[BESTSCORE], scoreBestW * 2 - scoreBestW / 2, 735, scoreBestW, scoreBestH);
        }

        else if (BESTSCORE >= 10 && BESTSCORE <= 99) {
            let firstNumber = floor(BESTSCORE / 10);
            let secondNumber = BESTSCORE % 10;
            image(scoresImg[firstNumber], scoreBestW * 2 - scoreBestW, 735, scoreBestW, scoreBestH);
            image(scoresImg[secondNumber], scoreBestW * 2, 735, scoreBestW, scoreBestH);
        }

        else if (BESTSCORE >= 100) {
            firstNumber = floor(BESTSCORE / 100);
            secondNumber = floor((BESTSCORE - firstNumber * 100) / 10);
            thirdNumber = floor(BESTSCORE - firstNumber * 100 - secondNumber * 10);

            image(scoresImg[firstNumber], scoreBestW * 2 - scoreBestW * 3 / 2, 735, scoreBestW, scoreBestH);
            image(scoresImg[secondNumber], scoreBestW * 2 - scoreBestW / 2, 735, scoreBestW, scoreBestH);
            image(scoresImg[thirdNumber], scoreBestW * 2 + scoreBestW / 2, 735, scoreBestW, scoreBestH);
        }

        /*----determine if the bird hits something----*/
        //BIRD MOVEMENT
        if (state == "flying") {
            Vy += a;
            stayAngleCount--;
            flapCount++; if (flapCount % flapCycle == 0) { flapCount = 0 };
            birdFlyingY += Vy;//The step might be too big!!         

            if (birdAngle < (PI / 2)) {
                if (stayAngleCount >= 5 && stayAngleCount <= 20) { birdAngle += alpha; }
                if (stayAngleCount < 5) { birdAngle += alpha * 3; }
                if (birdAngle < (PI / 2) && birdAngle >= (PI / 2 - alpha * 3)) { birdAngle = (PI / 2) }
            }

            //determin if hitting 

            if (touch() == "fire") {
                state = "onfire";
                vBg = vBg * 7;
                vBase = vBase * 7;
            }

            if (touchGround()) {
                birdFlyingY = baseY - (birdH / 2 + birdBorderY) + 13;
                MODE = "gameover";
                state = "dead";
                if (!MUTE) {
                    hitSound.play();
                    dieSound.play();
                }
            }

            if (touch() == "pipe") {
                MODE = "gameover";
                state = "falling";
                if (!MUTE) {
                    hitSound.play();
                    dieSound.play();
                }
            }
            /*----draw the bird----*/

            push();
            translate(birdIniX + birdW / 2, birdFlyingY + birdH / 2); //the origin is in the middle of the bird!
            rotate(birdAngle);
            let pose = floor(flapCount / 9);
            image(bird[pose], -birdW / 2, -birdH / 2, birdW, birdH);
            pop();
        }

        else if (state == "onfire") {
            flapCountFire++; if (flapCountFire % flapCycleFire == 0) { flapCountFire = 0 };
            let pose = floor(flapCountFire / (flapCycleFire / 3));
            image(birdsFireImg[pose], birdIniX, birdFlyingY, birdFireW, birdFireH);
            fireStepCount -= vBase;
            if (fireSoundCount % 30 == 0) {
                if (!MUTE) { swooshSound.play() }
            };
            fireSoundCount++;
        }

        if (fireStepCount <= 0) {
            Vy = 0;
            state = "flying";
            fireSoundCount = 0;
            fireStepCount = fireStep;
            vBg = VDefBg;
            vBase = VDefBase;
        }

        /*--- pipe--- */
        checkBirdPoint = birdIniX + birdW / 2;
        checkPipePoints = [pipeBorder[0][0][1] - 80, pipeBorder[1][0][1] - 80];

        if (!gotScore[0]) {
            if (checkBirdPoint > checkPipePoints[0]) {
                SCORE++;
                if (SCORE > BESTSCORE) { BESTSCORE = SCORE; };
                gotScore[0] = true;
                if (!MUTE) { scoreSound.play(); }
            }
        }

        if (!gotScore[1]) {
            if (checkBirdPoint > checkPipePoints[1]) {
                SCORE++;
                if (SCORE > BESTSCORE) { BESTSCORE = SCORE; };
                gotScore[1] = true;
                if (!MUTE) { scoreSound.play(); }
            }
        }

    }



    /*########################## ( GAMEOVER  ) #########################*/

    if (MODE == "gameover") {
        /*----draw ENVIRONMENT----*/
        image(bgImg, bgX, 0, width, bgH);
        image(bgImg, bgX + width, 0, width, bgH);

        image(pipesGImg[0], pipe0X, -(pipeH - pipe0L), pipeW, pipeH);
        image(pipesGImg[1], pipe0X, pipe0L + pipeGap, pipeW, pipeH);

        image(pipesGImg[0], pipe1X, -(pipeH - pipe1L), pipeW, pipeH);
        image(pipesGImg[1], pipe1X, pipe1L + pipeGap, pipeW, pipeH);


        /*----draw BIRD----*/
        if (state == "dead") {
            push();
            translate(birdIniX + birdW / 2, birdFlyingY + birdH / 2); //the origin is in the middle of the bird!
            rotate(birdAngle);
            image(bird[pose], -birdW / 2, -birdH / 2, birdW, birdH);
            pop();
        }

        else if (state == "falling") {

            if (birdAngle < (PI / 2)) {
                birdAngle += alpha * 6;
                if (birdAngle < (PI / 2) && birdAngle >= (PI / 2 - alpha * 6)) { birdAngle = (PI / 2) }

                Vy = 15;
            }

            if (birdAngle >= (PI / 2)) {
                birdFlyingY += Vy;
                Vy += a;

            }

            push();
            translate(birdIniX + birdW / 2, birdFlyingY + birdH / 2); //the origin is in the middle of the bird!
            rotate(birdAngle);
            image(bird[pose], -birdW / 2, -birdH / 2, birdW, birdH);
            pop();

            if (touchGround()) {
                state = "dead";
            }
        }

        //circle(birdIniX,birdFlyingY, 2);
        /*----draw BASE----*/
        image(baseImg, baseX, baseY, width, baseH);
        image(baseImg, baseX + width, baseY, width, baseH);

        /*----draw GAMEOVER----*/
        image(gameOverImg, 26, 170, gameOverImg.width * 2, gameOverImg.height * 2);

        /*----draw SCORE----*/
        if (SCORE < 10) {
            image(scoresImg[SCORE], width / 2 - scoreW / 2, 300, scoreW, scoreH);
        }

        else if (SCORE >= 10 && SCORE <= 99) {
            let firstNumber = floor(SCORE / 10);
            let secondNumber = SCORE % 10;
            image(scoresImg[firstNumber], width / 2 - scoreW, 300, scoreW, scoreH);
            image(scoresImg[secondNumber], width / 2, 300, scoreW, scoreH);

        }

        else if (SCORE >= 100) {
            let firstNumber = floor(SCORE / 100);
            let secondNumber = floor((SCORE - firstNumber * 100) / 10);
            let thirdNumber = floor(SCORE - firstNumber * 100 - secondNumber * 10);

            image(scoresImg[firstNumber], width / 2 - scoreW * 3 / 2, 300, scoreW, scoreH);
            image(scoresImg[secondNumber], width / 2 - scoreW / 2, 300, scoreW, scoreH);
            image(scoresImg[thirdNumber], width / 2 + scoreW / 2, 300, scoreW, scoreH);
        }
    }
}



function keyPressed() {
    if (keyCode == 32) {
        if (MODE == "playing") {
            Vy = -Vup;
            birdAngle = birdUpAngle;
            stayAngleCount = angleCoolCount;
            if (!MUTE) { wingSound.play(); }
        }
        else if (MODE == "start") {
            Vy = -Vup;
            MODE = "playing";
            if (!MUTE) { wingSound.play(); }
        }

        else if (MODE == "gameover") {
            setup();
        }
    }
}

function mouseClicked() {
    if (MODE == "playing") {
        Vy = -Vup;
        birdAngle = birdUpAngle;
        stayAngleCount = angleCoolCount;
        if (!MUTE) { wingSound.play(); }
    }


    else if (MODE == "start") {
        if (inRange(mouseX, [width - soundOnImg.width * 2 / 3, width]) && inRange(mouseY, [height - soundOnImg.height * 2 / 3, height])) {
            if (MUTE) {
                MUTE = false;
            }

            else {
                MUTE = true;
            }
        }
        else {
            Vy = -Vup;
            MODE = "playing";
            if (!MUTE) { wingSound.play(); }
        }
    }

    else if (MODE == "gameover") {
        setup();
    }
}

function touchGround() {
    let birdCenterY = birdFlyingY + birdH / 2;
    if (birdCenterY + birdBorderY >= baseY) {
        return true;
    }
    else return false;
}

function touch() {
    const birdCenterX = birdIniX + birdW / 2;
    const birdCenterY = birdFlyingY + birdH / 2;
    const constrain = 6;
    const birdRUCorner = [birdCenterX + birdBorderX - constrain, birdCenterY - birdH / 2 + constrain]
    const birdRDCorner = [birdCenterX + birdW / 2 - constrain, birdCenterY + birdBorderY - constrain]
    const top = [birdCenterX, birdCenterY - birdW / 2 * cos(birdAngle) + constrain]
    const bottom = [birdCenterX, birdCenterY + birdW / 2 * cos(birdAngle) - constrain]

    // very good debugger
    // circle(top[0], top[1],2); 
    // circle(bottom[0], bottom[1],2); 
    // circle(birdRUCorner[0],birdRUCorner[1],2);
    // circle(birdRDCorner[0],birdRDCorner[1],2);

    /*--- fire--- */
    // circle(fireBorder[0][0],fireBorder[1][0],4);
    // circle(fireBorder[0][1],fireBorder[1][1],4);
    // circle(fireBorder[0][0],fireBorder[1][1],4);
    // circle(fireBorder[0][1],fireBorder[1][0],4);

    if (hitFire(top, fireBorder) | hitFire(bottom, fireBorder) | hitFire(birdRUCorner, fireBorder) | hitFire(birdRDCorner, fireBorder)) {
        return "fire";
    }

    if (hitPipe(top, pipeBorder) | hitPipe(bottom, pipeBorder) | hitPipe(birdRUCorner, pipeBorder) | hitPipe(birdRDCorner, pipeBorder)) {
        return "pipe";
    }
}



function getBirdBorder(imgW, imgH, angle) {
    angle = abs(angle)
    let borderX = (imgW / 2) * cos(angle) + (imgH / 2) * sin(angle);
    let borderY = (imgW / 2) * sin(angle) + (imgH / 2) * cos(angle);

    return [borderX, borderY]
}

function getFireBorder() {
    let borderX = [fireX, fireX + fireW];
    let borderY = [fireY, fireY + fireH];

    return [borderX, borderY];
}


function getPipeBorder() {
    let border0X = [pipe0X, pipe0X + pipeW];
    let border0UpperY = [-(pipeH - pipe0L) - 1000, pipe0L];
    let border0LowerY = [pipe0L + pipeGap, baseY];

    let border1X = [pipe1X, pipe1X + pipeW];
    let border1UpperY = [-(pipeH - pipe1L) - 1000, pipe1L];
    let border1LowerY = [pipe1L + pipeGap, baseY];

    return [[border0X, border0UpperY, border0LowerY],
    [border1X, border1UpperY, border1LowerY]];

}

//i in range [a,b]
function inRange(i, interval) {
    if (i >= interval[0] && i <= interval[1]) {
        return true;
    }
}

function hitPipe(point, border) {
    if (inRange(point[0], border[0][0])) {
        if (inRange(point[1], border[0][1])) return true;
        if (inRange(point[1], border[0][2])) return true;
    }

    if (inRange(point[0], border[1][0])) {
        if (inRange(point[1], border[1][1])) return true;
        if (inRange(point[1], border[1][2])) return true;
    }
}

function hitFire(point, border) {
    if (inRange(point[0], border[0])) {
        if (inRange(point[1], border[1])) return true;
    }
}