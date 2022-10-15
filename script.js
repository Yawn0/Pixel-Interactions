const IMAGE_ID = 'image1';
const CANVAS_ID = 'canvas1';
const RESET_BTN = 'resetbutton';
const ADD_LAYER_BTN = 'addlayer';

var layers_count = 0;

// editable settings
var particle_size = 6;
var ease = 0.1;
var friction = 0.9;
var pixel_gap = 0;          // number between 0 and (pixel size - 1);
var force_multiplier = 1;   // can be negative
var input_radius = 30000;
var destruction_mode = false; // do particles realign themselves
var delay_mode = false;       // do particles realign with a delay

var zip_mode = false;
var zip_mode_angle = 0;
var zip_mode_radians = zip_mode_angle * Math.PI / 180;

class Particle{
    constructor(effect, x ,y ,color) {
        this.effect = effect;
        this.x = Math.random() * this.effect.width;   // particle origin x 
        this.y = Math.random() * this.effect.height;  // particle origin y 
        this.originX = Math.floor(x);                 // particle position x 
        this.originY = Math.floor(y);                 // particle position y
        this.color = color;                           // particle color
        this.size = this.effect.size - pixel_gap;  // particle size
        this.vx = 0;                               // particle velocity x
        this.vy = 0;                               // particle velocity y
        this.ease = ease;                          // particle easing coefficient
        this.friction = friction;                  // particle friction coefficient
        this.dx = 0;                        // particle x distance from input
        this.dy = 0;                        // particle y distance from input
        this.distance = 0;                  // diagonal distance from input (hypotenuse)
        this.force = 0;                     // gravitational force applied to particle
        this.angle = 0;                     // angle in radians of particle position in respect to input
    }
    draw(context){
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);
    }
    update(){
        this.dx = this.effect.input.x - this.x;
        this.dy = this.effect.input.y - this.y;
        this.distance = this.dx * this.dx + this.dy * this.dy;
        this.force = (delay_mode ? (-this.effect.input.radius * this.distance)
                                 : (-this.effect.input.radius / this.distance)
                                 ) * force_multiplier;

        if(this.distance < this.effect.input.radius){
            this.angle = zip_mode ? Math.atan(this.dy, this.dx) + zip_mode_radians 
                                  : Math.atan2(this.dy, this.dx);
            this.vx += this.force * Math.cos(this.angle);
            this.vy += this.force * Math.sin(this.angle);
        }

        if(destruction_mode){
            this.x += this.vx + (this.originX - this.x) * this.ease;
            this.y += this.vy + (this.originY - this.y) * this.ease;
        }
        else{
            this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
            this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
        }
    }
}

class Effect{
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.particlesArray = [];
        this.image = document.getElementById(IMAGE_ID);
        this.centerX = this.width * 0.5;
        this.centerY = this.height * 0.5;
        this.x = this.centerX - this.image.width * 0.5;
        this.y = this.centerY - this.image.height * 0.5;
        this.size = particle_size;                       // particle size
        this.input = {                                   // input data ( mouse or touch )
            radius: input_radius / particle_size - 1,    // radius of input
            x: undefined,                                // input x position
            y: undefined                                 // input y position
        };
        window.addEventListener("mousemove", event => {
            this.input.x = event.clientX;
            this.input.y = event.clientY;
        });
        window.addEventListener("touchmove", event => {
            this.input.x = event.touches[0].clientX;
            this.input.y = event.touches[0].clientY;
        });
    }
    init(context){
        
        context.drawImage(this.image, this.x, this.y);
        const pixels = context.getImageData(0, 0, this.width, this.height).data;
        
        for(let y = 0; y < this.height; y += this.size){
            for(let x = 0; x < this.width; x += this.size){
                const index = (y * this.width + x) * 4; // pixel information has 4 information slots (rgba)
                const alpha = pixels[index + 3];
                
                if(alpha > 0){  // if alpha > 0 then pixel belongs to image
                    const red = pixels[index];
                    const green = pixels[index + 1];
                    const blue = pixels[index + 2];
                    const color = `rgb(${red}, ${green}, ${blue})`;
                    this.particlesArray.push(new Particle(this, x, y, color));
                }
            }
        }
    }
    draw(context){
        this.particlesArray.forEach(particle => particle.draw(context));
    }
    update(){
        this.particlesArray.forEach(particle => particle.update());
    }
}

const canvas = document.getElementById(CANVAS_ID);
var context;
var effect;

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context = canvas.getContext('2d');
    effect = new Effect(canvas.width, canvas.height);
    effect.init(context);
    animate();
    layers_count++;
}

// main function
function animate(){
    context.clearRect(0,0, canvas.width, canvas.height);
    context.beginPath();
    effect.draw(context);
    effect.update();
    requestAnimationFrame(animate);
}

//reset button
const resetBtn = document.getElementById(RESET_BTN);
resetBtn.addEventListener('click', function(){
    init();
    layers_count = 1;
    updateLayerCount(true);
})

//add layer button
const addLayerBtn = document.getElementById(ADD_LAYER_BTN);

function updateLayerCount(reset){
    if(reset){
        addLayerBtn.innerHTML = 'Add layer';
    }
    else{
        layers_count++;
        addLayerBtn.innerHTML = 'Add layer ' + layers_count;
    }
}

addLayerBtn.addEventListener('click', function(){
    effect.init(context);
    updateLayerCount();
})

init();