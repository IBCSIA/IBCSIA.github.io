nothingInQueue = true

class Projectile{ // Class for all created projectiles
    constructor({gravity = -9.81, mass = 1.0, xVel = 0.0, yVel = 0.0, initialHeight = 0.0, startTime = 0}){
        this.gravity = gravity
        this.mass = mass
        this.xVel = xVel
        this.yVel = yVel
        this.startTime = startTime

        this.xOri = 0.0
        this.yOri = initialHeight
        this.xPos = 0.0
        this.yPos = initialHeight
        this.xDis = 0.0
        this.yDis = 0.0
        this.dt = 0
    }
}

var slider = document.getElementById("myRange"); // Get's the slider from the HTML document to allow for time control

slider.oninput = function() { // If the slider changes then this function will be called
    projectileOne.dt = timeToGround * (this.value/100) // Calculate the current projectile time
    calculatePosition(projectileOne) // And set its position according to that time

    // ALL CODE BELOW HERE SETS THE VISUALS
    document.getElementById("circle1").setAttribute("cx", (projectileOne.xPos*5+300))
    document.getElementById("circle1").setAttribute("cy", floorHeight-(projectileOne.yPos*5))
    document.getElementById("xLabel").innerHTML = "X Position: " + Math.round(projectileOne.xPos*100)/100
    document.getElementById("yLabel").innerHTML = "Y Position: " + Math.round(projectileOne.yPos*100)/100
    document.getElementById("xVelocityLabel").innerHTML = "X Velocity: " + Math.round(projectileOne.xVel*100)/100
        label = projectileOne.yVel + projectileOne.gravity*projectileOne.dt
    document.getElementById("yVelocityLabel").innerHTML = "Y Velocity: " + Math.round(label*100)/100
    document.getElementById("timeLabel").innerHTML = "Time: " + Math.round(projectileOne.dt*100)/100
    // ALL CODE ABOVE HERE SETS THE VISUALS
}

async function launchProjectile(){ // Main event loop
    if (nothingInQueue == true){ // Prevents multple simulations from running at the same time
        nothingInQueue = false
        paused = false
        startTime = Date.now()
        timePaused = 0
        intervalMs = 10
        start = true
        projectileOne = new Projectile({ // Creates the projectile object to start the simulation
            mass: parseFloat(document.getElementById("massInput").value),
            yVel: parseFloat(document.getElementById("yVelInput").value),
            xVel: parseFloat(document.getElementById("xVelInput").value),
            initialHeight: parseFloat(document.getElementById("initialHeightInput").value),
            gravity: parseFloat(document.getElementById("gravityInput").value),
            startTime: startTime})

        // Code below is constants that will be used
        timeToGround = calculateTimeToGround(projectileOne)
        floorHeight = document.getElementById("mainsvg").parentElement.offsetHeight - 110
        oldYPos = projectileOne.yPos
        oldDt = projectileOne.dt
        // Code above is constants that will be used

        while ((start == true)){ // THE MAIN EVENT LOOP, RUNS WITH A SLEEP FUNCTION IN ORDER TO EXECUTE IN REAL-TIME
            currentTime = Date.now() - timePaused
            projectileOne.dt = (currentTime - projectileOne.startTime)/1000

            if (projectileOne.dt >= timeToGround){ // Stop the simulation if the projectile has hit the ground
                projectileOne.dt = timeToGround
                start = false
            }
            
            // Code below updates the HTML webpage to be accurate
            calculatePosition(projectileOne)
            document.getElementById("circle1").setAttribute("cx", (projectileOne.xPos*5+300))
            document.getElementById("circle1").setAttribute("cy", floorHeight-(projectileOne.yPos*5))
            document.getElementById("xLabel").innerHTML = "X Position: " + Math.round(projectileOne.xPos*100)/100
            document.getElementById("yLabel").innerHTML = "Y Position: " + Math.round(projectileOne.yPos*100)/100
            document.getElementById("xVelocityLabel").innerHTML = "X Velocity: " + Math.round(projectileOne.xVel*100)/100
            label = projectileOne.yVel + projectileOne.gravity*projectileOne.dt
            document.getElementById("yVelocityLabel").innerHTML = "Y Velocity: " + Math.round(label*100)/100
            document.getElementById("timeLabel").innerHTML = "Time: " + Math.round(projectileOne.dt*100)/100
            slider.value = projectileOne.dt*100/timeToGround
            oldYPos = projectileOne.yPos
            oldDt = projectileOne.dt
            // Code above updates the HTML webpage to be accurate

            if (paused) { // Pauses the main event loop and checks 10 times if the user resumed
                await new Promise(resolve => {
                const checkIfResumed = setInterval(() => {
                    if (!paused) {
                    clearInterval(checkIfResumed)
                    resolve()
                    }
                }, 100)
                });
            }

            await sleep(intervalMs)
        }

        document.getElementById("xVelocityLabel").innerHTML = "X Velocity: " + 0
        document.getElementById("yVelocityLabel").innerHTML = "Y Velocity: " + 0
        console.log("Function finished")

        nothingInQueue = true
    }
}

function pause(){ // This function records how long the simulation has been paused
    paused = !paused
    if (paused == true){startPause = Date.now()}
    else {endPause = Date.now(); timePaused += endPause - startPause}
    console.log(paused)
}

function calculatePosition(projectile){ // Maths out (calculates) the current position of the projectile according to time.
    projectile.xDis = projectile.xVel * projectile.dt
    projectile.yDis = (projectile.yVel * projectile.dt) + (0.5 * projectile.gravity * (projectile.dt**2))
    projectile.xPos = projectile.xOri + projectile.xDis
    projectile.yPos = projectile.yOri + projectile.yDis
}

function calculateTimeToGround(projectile){ // Simple physics equation to calculate time until projectile strikes ground.
    t = (-projectile.yVel - (projectile.yVel**2 + (2*projectile.gravity*-projectile.yOri))**0.5)/(projectile.gravity)
    return t
}
