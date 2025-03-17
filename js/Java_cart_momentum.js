nothingInQueue = true

class CartSystem{ // Class for the cart systems that run the simulation
    constructor({rad1=10.0, rad2=10.0, dis1=0.0, mass1=1.0, vel1=0.0, dis2=10.0, mass2=1.0, vel2=0.0, cType="elastic", time=0}){
        
        this.rad1 = rad1
        this.ori1=dis1
        this.dis1=dis1
        this.mass1=mass1
        this.vel1=vel1

        this.rad2 = rad2
        this.ori2=dis2
        this.dis2=dis2
        this.mass2=mass2
        this.vel2=vel2
 
        this.cType=cType
        this.time=time
    }
}

function elastic(system){ // Calculates how the system will change in an elastic collision
    const u1 = system.vel1
    const u2 = system.vel2
    const massSum = system.mass1 + system.mass2
    const massDif = system.mass1 - system.mass2
    system.vel1 = (massDif/massSum)*u1 + 2*(system.mass2/massSum)*u2
    system.vel2 = u1 + system.vel1 - u2
}

function inelastic(system){ // Calculates how the system will change in an inelastic collision
    const p1 = system.mass1 * system.vel1
    const p2 = system.mass2 * system.vel2
    const massSum = system.mass1 + system.mass2
    system.vel1 = system.vel2 = (p1 + p2)/massSum
}

function explosive(system, newtons){ // Calculates how the system will change in an explosive collision
    const u = system.vel1
    system.vel1 = -(newtons/system.mass1) + u
    system.vel2 = (newtons/system.mass2) + u
}

function timeToCollide(system){ // Calculates it takes for both of the carts in the system to collide
    if (system.cType == "explosive") {return 0}
    else {return (system.ori2 - system.ori1) / (system.vel1 - system.vel2)}
}

function collisionPosition(system){ // Using timeToCollide() this function calcuates the position where the collision will happen
    const collisionTime = timeToCollide(system)
    return system.ori1 + collisionTime*system.vel1
}

function checkValid(system){ // Long string of "if" statements to check if there will be a collision in the systme
    if ((system.vel1 <= 0) && (0 <= system.vel2)){return false}
    if ((system.vel1 <= system.vel2) && (system.vel2 <= 0)){return false}
    if ((0 <= system.vel1) && (system.vel1 <= system.vel2)){return false}
    return true
}

function pause(){ // Records how long the system has been paused
    paused = !paused
    if (paused == true){startPause = Date.now()}
    else {endPause = Date.now(); timePaused += endPause - startPause}
    console.log(paused)
}

async function startCartSystem(){ // The function that holds the main event loop
    if (nothingInQueue == true){ // Makes sure only one simulation can run at a time
        nothingInQueue = false

        // Code below collects the inputs from the HTML document
        let rad1 = parseFloat(document.getElementById("radius1Input").value)
        let dis1 = parseFloat(document.getElementById("dis1Input").value)
        let mass1 = parseFloat(document.getElementById("mass1Input").value)
        let vel1 = parseFloat(document.getElementById("vel1Input").value)
        let rad2 = parseFloat(document.getElementById("radius2Input").value)
        let dis2 = parseFloat(document.getElementById("dis2Input").value)
        let mass2 = parseFloat(document.getElementById("mass2Input").value)
        let vel2 = parseFloat(document.getElementById("vel2Input").value)
        let cType = document.getElementById("cTypeInput").value
        // Code above collects the inputs from the HTML document

        document.getElementById("circle1").setAttribute("r", rad1)
        document.getElementById("circle2").setAttribute("r", rad2)

        paused = false
        timePaused = 0
        xPos = document.getElementById("mainsvg").parentElement.offsetWidth/2 + 100
        system = new CartSystem({rad1:rad1, dis1:dis1, mass1:mass1, vel1:vel1, rad2:rad2, dis2:dis2, mass2:mass2, vel2:vel2, cType:cType}) // Makes the CartSystem object
        if ((checkValid(system)==true) || (system.cType == "explosive")){ // Makes sure the system is valid before running it
            
            // Code below defines useful constants
            const explosionTimer = 3
            let edgeSystem = new CartSystem({rad1:rad1, dis1:dis1+rad1, mass1:mass1, vel1:vel1, rad2:rad2, dis2:dis2-rad2, mass2:mass2, vel2:vel2, cType:cType})
            const edgeCollisionPos = collisionPosition(edgeSystem)
            const edgeCollisionTime = timeToCollide(edgeSystem)
            const msInterval = 10
            let startTime = Date.now()
            let start = true
            let beforeCollision = true
            // Code above defines useful constants
            
            if (system.cType == "explosive"){ // Checks if the system is explosive (which is a special case)
                system.ori2 = system.dis2 = system.ori1 + system.rad1 + system.rad2
                system.vel2 = system.vel1
            }

            while (start == true){ // The main event loop

                currentTime = Date.now() - timePaused
                system.time = (currentTime - startTime)/1000

                if ((system.time > 5) && (beforeCollision == false)){
                    start = false
                    break
                }

                system.dis1 = system.ori1 + system.vel1*system.time
                system.dis2 = system.ori2 + system.vel2*system.time

                if ((system.cType == "explosive") && (beforeCollision == true) && (system.time >= explosionTimer)) { // Explosive systems are a special case
                    system.ori1 = system.dis1
                    system.ori2 = system.dis1 + system.rad1 + system.rad2
                    explosive(system, 40)
                    startTime = Date.now()
                    beforeCollision = false
                }

                if  ((beforeCollision == true) && (system.cType != "explosive") && // If the system isn't explosive then calculate the collision position according to the cart radii
                    (((system.vel1 < 0) && (system.dis1 <= edgeCollisionPos - system.rad1)) ||
                    ((system.vel1 > 0) && (system.dis1 >= edgeCollisionPos - system.rad1)) ||
                    ((system.vel2 < 0) && (system.dis2 <= edgeCollisionPos + system.rad2)) ||
                    ((system.vel2 > 0) && (system.dis2 >= edgeCollisionPos + system.rad2)))){

                    const timeRemainder = edgeCollisionTime - system.time

                    if (system.cType == "elastic"){
                        elastic(system)
                    }
                    else if (system.cType == "inelastic"){
                        inelastic(system)
                    }
                    
                    system.ori1 = edgeCollisionPos - system.rad1
                    system.ori2 = edgeCollisionPos + system.rad2

                    system.dis1 = system.ori1 + system.vel1*timeRemainder
                    system.dis2 = system.ori2 + system.vel2*timeRemainder

                    startTime = Date.now() - timePaused
                    beforeCollision = false
                }

                // Code below updates the HTML visuals
                document.getElementById("circle1").setAttribute("cx", system.dis1+xPos)
                document.getElementById("circle2").setAttribute("cx", system.dis2+xPos)
                document.getElementById("position1Label").innerHTML = "Cart 1 Position: " + Math.round(system.dis1*100)/100
                document.getElementById("position2Label").innerHTML = "Cart 2 Position: " + Math.round(system.dis2*100)/100
                document.getElementById("velocity1Label").innerHTML = "Cart 1 Velocity: " + Math.round(system.vel1*100)/100
                document.getElementById("velocity2Label").innerHTML = "Cart 2 Velocity: " + Math.round(system.vel2*100)/100
                document.getElementById("mass1Label").innerHTML = "Cart 1 Mass: " + Math.round(system.mass1*100)/100
                document.getElementById("mass2Label").innerHTML = "Cart 2 Mass: " + Math.round(system.mass2*100)/100
                // Code above updates the HTML visuals
                
                if (paused) { // If the function is paused, check 10 times a second for if the user resumed it
                    await new Promise(resolve => {
                    const checkIfResumed = setInterval(() => {
                        if (!paused) {
                        clearInterval(checkIfResumed)
                        resolve()
                        }
                    }, 100)
                    });
                }

                await sleep(msInterval)
            }

            console.log("Done!")
        }

        else {console.log("INVALID INPUTS")}
        nothingInQueue = true
    }

}