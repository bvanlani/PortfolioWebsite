window.addEventListener("DOMContentLoaded", function(){

    const canvas = document.getElementById("asteroids");
    const ctx = canvas.getContext("2d");

    document.addEventListener('resize', function() {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
    }, false);

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    class Asteroid {
        constructor(x, y, radius, speedX, speedY) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.speedX = speedX;
            this.speedY = speedY;
            this.rotationAngle = 0;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.maxX = x;
            this.maxY = y;
            this.minX = x;
            this.minY = y;
            //this.boundColor = "black";
            //this.asteroidColor = "black;"
            this.vertices = generateVertices(7 + Math.floor(Math.random() * 5), radius);
        }

        draw() {
            ctx.strokeStyle = "#0E273CBF";
            ctx.fillStyle = "#0E273C40";
            ctx.beginPath();
            // Calculate the rotated position of the first vertex
            let rotatedX = this.vertices[0].x * Math.cos(this.rotationAngle) - this.vertices[0].y * Math.sin(this.rotationAngle) + this.x;
            let rotatedY = this.vertices[0].x * Math.sin(this.rotationAngle) + this.vertices[0].y * Math.cos(this.rotationAngle) + this.y;
            ctx.moveTo(rotatedX, rotatedY);

            this.maxX = rotatedX;
            this.maxY = rotatedY;
            this.minX = rotatedX;
            this.minY = rotatedY;
            
            // Calculate the rotated positions of the remaining vertices
            for (let i = 1; i < this.vertices.length; i++) {
                rotatedX = this.vertices[i].x * Math.cos(this.rotationAngle) - this.vertices[i].y * Math.sin(this.rotationAngle) + this.x;
                rotatedY = this.vertices[i].x * Math.sin(this.rotationAngle) + this.vertices[i].y * Math.cos(this.rotationAngle) + this.y;
                ctx.lineTo(rotatedX, rotatedY);
                if(rotatedX > this.maxX) this.maxX = rotatedX;
                if(rotatedY > this.maxY) this.maxY = rotatedY;
                if(rotatedX < this.minX) this.minX = rotatedX;
                if(rotatedY < this.minY) this.minY = rotatedY;
            }

            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            //Draw bounding box
            //ctx.strokeStyle = this.boundColor;
            // ctx.beginPath();
            // ctx.moveTo(this.maxX, this.maxY);
            // ctx.lineTo(this.maxX, this.minY);
            // ctx.lineTo(this.minX, this.minY);
            // ctx.lineTo(this.minX, this.maxY);
            // ctx.closePath();
            // ctx.stroke();
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            this.rotationAngle += this.rotationSpeed;

            let margin = 50;

            if (this.x < -margin) this.x = canvas.width + margin;
            if (this.x > canvas.width + margin) this.x = -margin;
            if (this.y < -margin) this.y = canvas.height + margin;
            if (this.y > canvas.height + margin) this.y = -margin;
        }

        checkCollision() {
            //this.boundColor = "black";
            //this.asteroidColor = "black";
            asteroids.forEach(asteroid => {
                if (this !== asteroid) {
                    this.checkBoxCollision(asteroid);
                }
            });
        }

        checkBoxCollision(other) {

            if (this.minX < other.maxX && this.maxX > other.minX && this.minY < other.maxY && this.maxY > other.minY) {
                //this.boundColor = "red";
                if(this.checkLineIntersection(other)){
                    //this.asteroidColor = "red";
                    //console.log(this + " and " + other)
                    this.handleCollision(other);
                }
            }
        }

        handleCollision(other) {

            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const normalX = dx / distance;
            const normalY = dy / distance;

            const relativeSpeedX = this.speedX - other.speedX;
            const relativeSpeedY = this.speedY - other.speedY;

            const velocityAlongNormal = relativeSpeedX * normalX + relativeSpeedY * normalY;

            if(velocityAlongNormal < 0){
                const impulse = (2 * velocityAlongNormal) / (this.radius + other.radius);

                this.speedX -= impulse * other.radius * normalX;
                this.speedY -= impulse * other.radius * normalY;
                other.speedX += impulse * this.radius * normalX;
                other.speedY += impulse * this.radius * normalY;
            }

        }

        checkLineIntersection(other) {
            for (let i = 0; i < this.vertices.length; i++) {
                for (let w = 0; w < other.vertices.length; w++) {
                    let nextVertThis = (i + 1) % this.vertices.length;
                    let nextVertOther = (w + 1) % other.vertices.length;

                    let thisStart = this.getWorldCoordinates(this.vertices[i]);
                    let thisEnd = this.getWorldCoordinates(this.vertices[nextVertThis]);
                    let otherStart = other.getWorldCoordinates(other.vertices[w]);
                    let otherEnd = other.getWorldCoordinates(other.vertices[nextVertOther]);

                    let o1 = this.checkOrientation(thisStart, thisEnd, otherStart);
                    let o2 = this.checkOrientation(thisStart, thisEnd, otherEnd);
                    let o3 = this.checkOrientation(otherStart, otherEnd, thisStart);
                    let o4 = this.checkOrientation(otherStart, otherEnd, thisEnd);
        
                    if (o1 !== o2 && o3 !== o4) return true;
                }
            }
            return false;
        }
        
        checkOrientation(p, q, r) {
            let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
            if(Math.abs(val) < 1e-10) return 0
            return val > 0 ? 1: 2;
        }

        getWorldCoordinates(vertex){
            return {
                x: vertex.x * Math.cos(this.rotationAngle) - vertex.y * Math.sin(this.rotationAngle) + this.x,
                y: vertex.x * Math.sin(this.rotationAngle) + vertex.y * Math.cos(this.rotationAngle) + this.y
            };
        }
    }

    function generateVertices(numSides, radius) {
        const vertices = [];
        for (let i = 0; i < numSides; i++) {
            const angle = (i / numSides) * Math.PI * 2;
            const x = Math.cos(angle) * radius + (Math.random() - 0.5) * radius * 0.5;
            const y = Math.sin(angle) * radius + (Math.random() - 0.5) * radius * 0.5;
            vertices.push({ x, y });
        }
        return vertices;
    }

    function generateAsteroids(num) {
        const asteroids = [];
        for (let i = 0; i < num; i++) {
            const radius = 20 + Math.random() * 30;
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;

            let overlap = true;

            while(overlap){
                overlap = false;
                for(let w=0;w<asteroids.length;w++){
                    const other = asteroids[w];

                    const dx = x - other.x;
                    const dy = y - other.y;

                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if(distance < radius + other.radius){
                        overlap = true;
                        x = Math.random() * canvas.width;
                        y = Math.random() * canvas.height;
                    }
                }
            }
            

            const speedX = (Math.random() - 0.5) * 3;
            const speedY = (Math.random() - 0.5) * 3;
            asteroids.push(new Asteroid(x, y, radius, speedX, speedY));
        }
        return asteroids;
    }

    let asteroids = generateAsteroids(15);

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        asteroids.forEach(asteroid => {
            asteroid.update();
            asteroid.draw();
            asteroid.checkCollision();
        });

        requestAnimationFrame(render);
    }

    render();

});