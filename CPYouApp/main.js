import './style.css'
import {Month, Week, Day, Task, Event} from "./calendarObjects.js"
import {Calendar} from "./calendarScheduler.js"

import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// Add Stars
function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24)
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const star = new THREE.Mesh(geometry, material) // create new star mesh

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(150)) // create random x, y, z coordinates
  star.position.set(x, y, z) // set star position
  scene.add(star) // add star to scene
}

function generateSchedule(dayObj, dayBackend) {
  let yPos = -.5 // current y pos
  let lastHours = 0 // initial hours must be 1
  let currHours = 1 // get currHours from current task
  let i = 0 //
  for (let j = dayBackend.getEventsAndTasks().length - 1; j >= 0; j--) { // loop through events and tasks
    let newEventOrTask = dayBackend.getEventsAndTasks()[j]
    let color = 0xC06C84
    let printString = newEventOrTask.getName()
    if (newEventOrTask instanceof Event) {
      currHours = (newEventOrTask.getEndDate() - newEventOrTask.getStartDate())/3000000 // get currHours from current task
      if (currHours >= 1.5) {
        printString = printString + "\n" + newEventOrTask.getStartDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + " - " + newEventOrTask.getEndDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }
    } else if (newEventOrTask instanceof Task) {
      color = 0xf67280
      currHours = newEventOrTask.getDuration()/30// get currHours from current task
      if (currHours >= 1.5) {
        printString = printString + "\n" + newEventOrTask.getDuration() + " minutes"
      }
    }
    const geometry = new THREE.BoxGeometry(5, currHours, 5)
    const material = new THREE.MeshStandardMaterial({ color: color  })
    const task = new THREE.Mesh(geometry, material) // create new cube mesh

    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
      const textGeometryTask = new TextGeometry(printString, {
        font: font,
        size: .35,
        height: .04,
        curveSegments: 2
      })
      const textMaterialTask = new THREE.MeshStandardMaterial({ color: 0xFFFFFF }) //F8B195
      const textTask = new THREE.Mesh(textGeometryTask, textMaterialTask)
      textTask.position.set(-2.1, task.geometry.parameters.height/2 - .7, 2.6)
      task.add(textTask)
    })

    yPos = yPos + (lastHours/2) +.5 + (currHours/2) // update y pos
    task.position.set(0, yPos, 0) // set cube position
    dayObj.add(task) // add cube to day object
    lastHours = currHours // update lastHours
    if (j == 0) {
      yPos = yPos + (currHours/2) + 1
    }
  }
  return yPos;
}

function generateDays(weekObj, weekBackend) {
  // for date formatting
  const options = { month: 'long', day: 'numeric' };

  const calFace = new THREE.Object3D()
  let x = 3
  let yMax = 0
  for (let i = 0; i < weekBackend.getDays().length; i++) {
    const geometry = new THREE.BoxGeometry(5, 1, 5)
    const material = new THREE.MeshStandardMaterial({ color: 0xc06c84 })
    const cube = new THREE.Mesh(geometry, material) // create new cube mesh

    // get summary of the day
    const summary = weekBackend.getDays()[i].getSummary();

    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const formattedDate = weekBackend.getDays()[i].getDate().toLocaleString('en-US', options);
        const textGeometry = new TextGeometry(formattedDate + '\nEvent Time: ' + summary[2].toFixed(2) + '\nTask Time: ' + summary[3].toFixed(2) + '\nFree Time: ' + summary[4].toFixed(2), {
        font: font,
        size: .4,
        height: .04,
        curveSegments: 2
      })
      const textMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF }) //F8B195
      const text = new THREE.Mesh(textGeometry, textMaterial)
      text.position.set(-2.1,.6,-1.8)
      text.rotateX(-1.6)
      cube.add(text)
    })

    // create day object and assign position
    const dayObj = new THREE.Object3D() // create new day object
    let yPos = generateSchedule(dayObj, weekBackend.getDays()[i]) // generate schedule for day
    yMax = Math.max(yPos, yMax)
    cube.position.setZ(dayObj.position.z)

    dayObj.position.set(x*7, 0, 0) // set x
    cube.position.setX(dayObj.position.x)

    calFace.add(cube)

    weekObj.add(dayObj)
    x--
  }
  weekObj.add(calFace)
  return yMax
}

function generateWeeks(monthBackend = null) {
  let weeks  = []
  let z = 1
  let yMax = 0
  // Implentation with backend connection
  if (monthBackend != null) {
    for (let i = 0; i < monthBackend.getWeeks().length; i++) {
      console.log(i);
      const week = new THREE.Object3D()
      yMax = Math.max(generateDays(week, monthBackend.getWeeks()[i]), yMax)
      week.position.set(0, 0, z * 7 + 3.5)
      weeks.push(week)
      scene.add(week)
      z--
    }
    for (let i = 0; i < monthBackend.getWeeks().length; i++) {
      const calFace = weeks[i].children[7]
      calFace.position.setY(yMax)
    }  
  }
  // Original implementation
  else {
    while (z > -3) {
      const week = new THREE.Object3D()
      generateDay(week)
      week.position.set(0, 0, z * 7 + 3.5)
      weeks.push(week)
      scene.add(week)
      z--
    }
  }
  return weeks
} 

function generateTaskList(y) {
  let x = 0 // initialize x
  while (x < 10 || x == 10) { // loop through tsk list up to ten tasks
    const geometry = new THREE.BoxGeometry(5, 1, 5)
    const material = new THREE.MeshStandardMaterial({ color: 0xF8B195  })
    const task = new THREE.Mesh(geometry, material) // create new cube mesh
    task.position.set(-21 + x*7, y, -22) // set cube position
    
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
      const textGeometry = new TextGeometry('June1\nI love pandas', {
        font: font,
        size: .4,
        height: .04,
        curveSegments: 2
      })
      const textMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF }) //F8B195
      const text = new THREE.Mesh(textGeometry, textMaterial)
      text.position.set(-2.1,.6,-1.8)
      text.rotateX(-1.6)
      task.add(text)
  })
    x++
    scene.add(task) // add cube to scene
  }
}

// For stopping and restarting the scene
let animationID;

function animate() {
  animationID = requestAnimationFrame( animate ) // ask browser to perform animation

  controls.update() // update camera position
  pointLight.position.set(camera.position.x, camera.position.y, camera.position.z) // move light with camera
  renderer.render(scene, camera)  // render scene with camera
}

function stopAnimation() {
  cancelAnimationFrame(animationID);
}

function restartAnimation() {
  animate();
}

// Create Scene and Camera to be Rendered
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

// Create Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'), // render to canvas element with id bg
})

renderer.setPixelRatio(window.devicePixelRatio) // set pixel ratio to match device
renderer.setSize(window.innerWidth, window.innerHeight) // set renderer size to match window size
camera.position.setY(45) // move camera up 50 units
camera.rotateX(90) // rotate camera to face
const controls = new OrbitControls(camera, renderer.domElement) // listen to dom events on mouse and update camera positon

const pointLight = new THREE.PointLight(0xffffff)
scene.add(pointLight)

// const ambientLight = new THREE.AmbientLight(0xffffff)
// scene.add(pointLight, ambientLight)

// Add helpers to get a sense of distance and rotation
// const lightHelper = new THREE.PointLightHelper(pointLight) 
// const gridHelper = new THREE.GridHelper(200, 50)
// scene.add(lightHelper ,gridHelper)

// Add Background Color
scene.background = new THREE.Color(0x355c7d)

Array(200).fill().forEach(addStar) // add 100 stars to scene

const loader = new FontLoader()

// calendar has only 1 month in it by default
let calendar = new Calendar();
let month = calendar.getMonths()[0];
console.log(month instanceof Month);
let weeks = generateWeeks(month) // get weeks objects
generateTaskList(weeks[0].children[7].position.y) // generate task list

document.getElementById("FCFS").addEventListener("click", toggleFCFS, false);
document.getElementById("Deadline").addEventListener("click", toggleDeadline, false);
document.getElementById("Priority").addEventListener("click", togglePriority, false);
document.getElementById("RoundRobin").addEventListener("click", toggleRoundRobin, false);
document.getElementById("SJF").addEventListener("click", toggleSJF, false);


function toggleFCFS() {
	console.log("BEEEEEP");	// toggles between 0 and 1
  console.log(month.getTasks());
  calendar.setSchedulerAlgorithm("FCFS");
  calendar.runScheduler(month);
  console.log(month.getTasks());
}
function toggleDeadline() {
  console.log("BEEEEEP");	// toggles between 0 and 1
  calendar.setSchedulerAlgorithm("Deadline");
  calendar.runScheduler(month);
}
function togglePriority() {
  calendar.setSchedulerAlgorithm("Priority");
  calendar.runScheduler(month);
  // Clear the scene
  // Rebuild scene with new backend values
  generateWeeks(month) // get weeks objects
  generateTaskList(weeks[0].children[7].position.y) // generate task list

}
function toggleRoundRobin() {
  console.log("BEEEEEP");	// toggles between 0 and 1
  calendar.setSchedulerAlgorithm("RR");
  calendar.runScheduler(month);
}
function toggleSJF() {
  console.log("BEEEEEP");	// toggles between 0 and 1
  calendar.setSchedulerAlgorithm("SJF");
  calendar.runScheduler(month);
}

animate()


// text color: 0xF8B195 