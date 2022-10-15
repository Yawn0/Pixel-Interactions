const IMAGE_ID = 'image1';
const CANVAS_ID = 'canvas1';
const WARP_BTN = 'warpbutton';

const canvas = document.getElementById(CANVAS_ID);
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle{
    constructor(effect, x ,y ,color) {
        this.effect = effect;
        this.x = Math.random() * this.effect.width;
        this.y = Math.random() * this.effect.height;
        this.originX = Math.floor(x);
        this.originY = Math.floor(y);
        this.color = color;
        this.size = this.effect.gap; // - 1;
        this.vx = 0;
        this.vy = 0;
        this.ease = 0.05;
        this.friction = 0.5;
        this.dx = 0;
        this.dy = 0;
        this.distance = 0;
        this.force = 0;
        this.angle = 0;
    }
    draw(context){
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);
    }
    update(){
        this.dx = this.effect.mouse.x - this.x;
        this.dy = this.effect.mouse.y - this.y;
        // this.distance = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        this.distance = this.dx * this.dx + this.dy * this.dy;
        this.force = -this.effect.mouse.radius / this.distance;

        if(this.distance < this.effect.mouse.radius){
            this.angle = Math.atan2(this.dy, this.dx);
            this.vx += this.force * Math.cos(this.angle);
            this.vy += this.force * Math.sin(this.angle);
        }

        this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
        this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
    }
    warp(){
        this.x = Math.random() * this.effect.width;
        this.y = Math.random() * this.effect.height;
        this.ease = 0.05;
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
        this.gap = 5;
        this.mouse = {
            radius: 30000,
            x: undefined,
            y: undefined
        };
        window.addEventListener("mousemove", event => {
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
            // console.log(this.mouse.x, this.mouse.y);
        });
        window.addEventListener("touchmove", event => {
            this.mouse.x = event.touches[0].clientX;
            this.mouse.y = event.touches[0].clientY;
            // console.log(this.mouse.x, this.mouse.y);
        });
    }
    init(context){
        
        context.drawImage(this.image, this.x, this.y);
        const pixels = context.getImageData(0, 0, this.width, this.height).data;
        
        for(let y = 0; y < this.height; y += this.gap){
            for(let x = 0; x < this.width; x += this.gap){
                const index = (y * this.width + x) * 4;
                const alpha = pixels[index + 3];
                
                if(alpha > 0){
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
    warp(){
        this.particlesArray.forEach(particle => particle.warp());
    }
}

window.addEventListener('load', function() {

    const effect = new Effect(canvas.width, canvas.height);
    effect.init(ctx);

    // main function
    function animate(){
        ctx.clearRect(0,0, canvas.width, canvas.height);
        ctx.beginPath();
        effect.draw(ctx);
        effect.update();
        requestAnimationFrame(animate);
    }
    
    animate();

    // warp button
    const warpBtn = document.getElementById(WARP_BTN);
    warpBtn.addEventListener('click', function(){
        effect.warp();
    })
});