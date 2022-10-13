window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const image1 = document.getElementById('image1');

    class Particle{
        constructor(effect) {
            this.effect = effect;
            this.x = Math.random() * this.effect.width;
            this.y = Math.random() * this.effect.height;
            this.size = 30;
        }

        draw(context){
            context.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    class Effect{
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.particlesArray = [];
        }
        init(){
            this.particlesArray.push(new Particle(this));
        }
        draw(context){
            this.particlesArray.forEach(particle => particle.draw(context));
        }
    }

    const effect = new Effect(canvas.width, canvas.height);
    effect.init();
    effect.draw(ctx);

    function animate(){

    }

    // ctx.fillRect(120, 120 , 100, 200);
    // ctx.drawImage(image1, 0, 0, 500, 800);


    
})