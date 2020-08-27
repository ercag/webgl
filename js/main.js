gsap.registerPlugin(ScrollTrigger);

let panels = gsap.utils.toArray(".panel");
const sound8bit = PIXI.sound.Sound.from('webgl/music/2019-12-11_-_Retro_Platforming_-_David_Fesliyan.mp3');
sound8bit.volume = 0.25;
panels.forEach((panel, i) => {
    let id = panel.getAttribute("id");

    if (id !== null) {
        ScrollTrigger.create({
            trigger: panel,
            start: "top top",
            // pin: "#" + id + "-content",
            pin: true,
            pinSpacing: false,
            scrub: 1, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
            onEnter: ({ progress, direction, isActive }) => {
                if (id == "wallpaper") { sound8bit.play(); }
            },
            onEnterBack: ({ progress, direction, isActive }) => {
                if (id == "wallpaper") { sound8bit.play(); }
            },
            onLeave: ({ progress, direction, isActive }) => {
                if (id == "wallpaper") { sound8bit.pause(); }
            },
            onLeaveBack: ({ progress, direction, isActive }) => {
                if (id == "wallpaper") { sound8bit.pause(); }
            }
        });
    }
});

/*PIXI: START */
let containerWidth = document.querySelector('.panel').offsetWidth;
let containerHeight = document.querySelector('.panel').offsetHeight;
console.log(document.querySelector('panel'));
const app = new PIXI.Application({ width: containerWidth, height: containerHeight, transparent: true });
document.getElementById("panel-welcome").appendChild(app.view);
// document.body.appendChild(app.view);

// Get the texture for rope.
const starTexture = PIXI.Texture.from('webgl/img/star.png');

const starAmount = 1000;
let cameraZ = 0;
const fov = 20;
const baseSpeed = 0.025;
let speed = 0;
let warpSpeed = 0.5;
const starStretch = 5;
const starBaseSize = 0.05;


// Create the stars
const stars = [];
for (let i = 0; i < starAmount; i++) {
    const star = {
        sprite: new PIXI.Sprite(starTexture),
        z: 0,
        x: 0,
        y: 0,
    };
    star.sprite.anchor.x = 0.5;
    star.sprite.anchor.y = 0.7;
    randomizeStar(star, true);
    app.stage.addChild(star.sprite);
    stars.push(star);
}

function randomizeStar(star, initial) {
    star.z = initial ? Math.random() * 2000 : cameraZ + Math.random() * 1000 + 2000;

    // Calculate star positions with radial random coordinate so no star hits the camera.
    const deg = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 1;
    star.x = Math.cos(deg) * distance;
    star.y = Math.sin(deg) * distance;
}

// Listen for animate update
app.ticker.add((delta) => {
    // Simple easing. This should be changed to proper easing function when used for real.
    speed += (warpSpeed - speed) / 20;
    cameraZ += delta * 10 * (speed + baseSpeed);
    for (let i = 0; i < starAmount; i++) {
        const star = stars[i];
        if (star.z < cameraZ) randomizeStar(star);

        // Map star 3d position to 2d with really simple projection
        const z = star.z - cameraZ;
        star.sprite.x = star.x * (fov / z) * app.renderer.screen.width + app.renderer.screen.width / 2;
        star.sprite.y = star.y * (fov / z) * app.renderer.screen.width + app.renderer.screen.height / 2;

        // Calculate star scale & rotation.
        const dxCenter = star.sprite.x - app.renderer.screen.width / 2;
        const dyCenter = star.sprite.y - app.renderer.screen.height / 2;
        const distanceCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
        const distanceScale = Math.max(0, (2000 - z) / 2000);
        star.sprite.scale.x = distanceScale * starBaseSize;
        // Star is looking towards center so that y axis is towards center.
        // Scale the star depending on how fast we are moving, what the stretchfactor is and depending on how far away it is from the center.
        star.sprite.scale.y = distanceScale * starBaseSize + distanceScale * speed * starStretch * distanceCenter / app.renderer.screen.width;
        star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
    }
});


const style = new PIXI.TextStyle({
    fontFamily: 'Oxygen',
    fontSize: 42,
    // fontStyle: 'italic',
    // fontWeight: 'bold',
    fill: ['#FFF'], // gradient
    stroke: '#4a1850',
    strokeThickness: 1,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 1,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 1,
    wordWrap: true,
    wordWrapWidth: 440,
});


const richText = new PIXI.Text('Hello my name is Ercag', style);
richText.x = -100;
richText.y = -100;

const richText2 = new PIXI.Text('aaaaaand', style);
richText2.x = (containerWidth / 2) - 50;
richText2.y = 400;
richText2.alpha = 0;

const richText3 = new PIXI.Text('Welcome to my journey', style);
richText3.x = containerWidth;
richText3.y = 0;

app.stage.addChild(richText);
app.stage.addChild(richText2);
app.stage.addChild(richText3);

var tl = gsap.timeline({ defaults: { duration: 1.5 } });

tl.to(richText, {
    x: "+=" + 300,
    y: "+=" + 300,
    onComplete: () => {
    }
});

tl.to(richText, {
    delay: 1,
    x: "-=" + 400,
    y: "-=" + 400,
});

tl.to(richText2, {
    alpha: 1,
    onComplete: () => {
    }
});

tl.to(richText2, {
    alpha: 0,
});


tl.to(richText3, {
    x: containerWidth - 500,
    y: "+=" + 200,
    onComplete: () => {
    }
});

tl.to(richText3, {
    delay: 1,
    x: containerWidth,
    y: 0,
});

tl.to('.crawl', 30, {
    css: { top: -2000 }, ease: Linear.easeNone
});


const appWalking = new PIXI.Application({
    width: containerWidth, height: containerHeight, transparent: true
});

document.getElementById("walking-man").appendChild(appWalking.view);

const containerWalking = new PIXI.Container();
appWalking.stage.addChild(containerWalking);
let goRight;
let goLeft;

PIXI.loader
    .add("walkedme", "webgl/img/sprite/texture.json")
    .load(setup);

function setup(loader, res) {
    // let sheet = PIXI.loader.resources["img/sprite/texture.json"];
    let sheet = res.walkedme.spritesheet;
    goRight = new PIXI.AnimatedSprite(sheet.animations["go_right"]);
    goRight.animationSpeed = 0.167;
    // goRight.width = 80;
    // goRight.height = 100;
    goRight.y = containerHeight / 2;
    goRight.play();

    goLeft = new PIXI.AnimatedSprite(sheet.animations["go_left"]);
    goLeft.x = containerWidth;
    // goLeft.width = 80;
    // goLeft.height = 100;
    goLeft.animationSpeed = 0.167;
    goLeft.y = containerHeight / 2;
    goLeft.stop();
    // goLeft.play();

    containerWalking.addChild(goRight);
    containerWalking.addChild(goLeft);

    appWalking.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {

    if (goLeft.playing == false && goRight.playing == false) {
        goRight.x = -50;
        goLeft.x = containerWidth;
        goRight.play();
    }

    if (!goRightIsComplete() && goRight.playing) {
        goRight.x = (goRight.x + 2 * delta);
    }
    else {
        goLeft.play();
    }

    if (!goLeftIsComplete() && goLeft.playing) {
        goLeft.x = (goLeft.x - 2 * delta);
    }
}

function goRightIsComplete() {
    if (goRight.x > containerWidth) {
        goRight.stop();
        return true;
    }
    else {
        return false;
    }
}

function goLeftIsComplete() {
    if (goLeft.x < -100) {
        goLeft.stop();
        return true;
    }
    else {
        return false;
    }
}

/*PIXI: END */