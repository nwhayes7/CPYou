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

function generateWeeks(monthBackend = null, monthObj = null) {
  let weeks  = []
  let z = 1
  let yMax = 0
  // Implentation with backend connection
  if (monthBackend != null) {
    for (let i = 0; i < monthBackend.getWeeks().length; i++) {
      const week = new THREE.Object3D()
      yMax = Math.max(generateDays(week, monthBackend.getWeeks()[i]), yMax)
      week.position.set(0, 0, z * 7 + 3.5)
      weeks.push(week)
      monthObj.add(week)
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
      z--
    }
  }
  return weeks
} 

function generateTaskList(y, taskList, taskListObject) {
  let x = 0 // initialize x
  
  for (let i = 0; i < taskList.length; i++) { // loop through tsk list up to ten tasks
    const geometry = new THREE.BoxGeometry(5, 1, 5)
    const material = new THREE.MeshStandardMaterial({ color: 0xF8B195  })
    const task = new THREE.Mesh(geometry, material) // create new cube mesh
    task.position.set(-21 + x*7, y, -22) // set cube position
    
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
      const textGeometry = new TextGeometry(taskList[i].name, {
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
    taskListObject.add(task) // add cube to scene
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

function week1View(weeks, taskList) {
  standardWeeksView(week, taskList)
  weeks[0].position.set(0,0,-1000) //  set week 4 to back
  weeks[1].position.set(0,0,-1000) //  set week 4 to back
  weeks[2].position.set(0,0,-1000) //  set week 4 to back
  weeks[3].position.set(0, 0, 10.5) // set week 1 to front
  camera.position.set(0, 13, 40) 
}

function week2View(weeks, taskList) {
  standardWeeksView(weeks, taskList)
  weeks[0].position.set(0,0,-1000) //  set week 4 to back
  weeks[1].position.set(0,0,-1000) //  set week 4 to back
  weeks[3].position.set(0,0,-1000) //  set week 4 to back
  weeks[2].position.set(0,0, 10.5) // set week 2 to front
  camera.position.set(0, 13, 40) 
}

function week3View(weeks, taskList) {
  standardWeeksView(weeks, taskList)
  weeks[0].position.set(0,0,-1000) //  set week 4 to back
  weeks[3].position.set(0,0,-1000) //  set week 4 to back
  weeks[2].position.set(0,0,-1000) //  set week 4 to back
  weeks[1].position.set(0,0, 10.5) // set week 3 to front
  camera.position.set(0, 13, 40) 
}

function week4view (weeks, taskList) {
  standardWeeksView(weeks, taskList)
  weeks[3].position.set(0,0,-1000) //  set week 4 to back
  weeks[1].position.set(0,0,-1000) //  set week 4 to back
  weeks[2].position.set(0,0,-1000) //  set week 4 to back
  camera.position.set(0, 13, 40) 
}

function standardWeeksView(weeks, taskList) {
  weeks[0].position.set(0,0,10.5) // set week 1 to back
  weeks[1].position.set(0,0,3.5) // set week 2 to 3rd back
  weeks[2].position.set(0,0,-3.5) // set week 3 to 2nd back
  weeks[3].position.set(0,0,-10.5) // set week 4 to front
  taskList.position.setZ(0)
  camera.position.set(0, 45, 0)
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
let monthObj = new THREE.Object3D() // create new month object
let weeks = generateWeeks(month, monthObj) // get weeks objects
scene.add(monthObj)
// scene.remove(monthObj)
let taskList = new THREE.Object3D() // create new task list object
generateTaskList(weeks[0].children[7].position.y, month.getTasks(), taskList) // generate task list
scene.add(taskList)

document.getElementById("FCFS").addEventListener("click", toggleFCFS, false);
document.getElementById("Deadline").addEventListener("click", toggleDeadline, false);
document.getElementById("Priority").addEventListener("click", togglePriority, false);
document.getElementById("RoundRobin").addEventListener("click", toggleRoundRobin, false);
document.getElementById("SJF").addEventListener("click", toggleSJF, false);
document.getElementById("W1").addEventListener("click", function(){ week1View(weeks, taskList); }, false);
document.getElementById("W2").addEventListener("click", function(){ week2View(weeks, taskList); }, false);
document.getElementById("W3").addEventListener("click", function(){ week3View(weeks), taskList; }, false);
document.getElementById("W4").addEventListener("click", function(){ week4view(weeks, taskList); }, false);
document.getElementById("std").addEventListener("click", function(){ standardWeeksView(weeks,  taskList); }, false);
document.getElementById("recenter").addEventListener("click", function() { recenter(); }, false);
document.getElementById("viewtasks").addEventListener("click", function() { viewTasks(weeks, taskList); }, false);


function toggleFCFS() {
  calendar.setSchedulerAlgorithm("FCFS");
  calendar.runScheduler(month);
  // Clear the scene
  // Rebuild scene with new backend values
  scene.remove(monthObj)
  monthObj = new THREE.Object3D() // create new month object
  scene.add(monthObj)
  weeks = generateWeeks(month, monthObj) // get weeks objects
  generateTaskList(weeks[0].children[7].position.y, month.getTasks()) // generate task list
}
function toggleDeadline() {
  calendar.setSchedulerAlgorithm("Deadline");
  calendar.runScheduler(month);
  // Clear the scene
  // Rebuild scene with new backend values
  scene.remove(monthObj)
  monthObj = new THREE.Object3D() // create new month object
  scene.add(monthObj)
  weeks = generateWeeks(month, monthObj) // get weeks objects
  generateTaskList(weeks[0].children[7].position.y, month.getTasks()) // generate task list
}
function togglePriority() {
  calendar.setSchedulerAlgorithm("Priority");
  calendar.runScheduler(month);
  // Clear the scene
  // Rebuild scene with new backend values
  scene.remove(monthObj)
  monthObj = new THREE.Object3D() // create new month object
  scene.add(monthObj)
  weeks = generateWeeks(month, monthObj) // get weeks objects
  generateTaskList(weeks[0].children[7].position.y, month.getTasks()) // generate task list
}
function toggleRoundRobin() {
  calendar.setSchedulerAlgorithm("RR");
  calendar.runScheduler(month);
  // Clear the scene
  // Rebuild scene with new backend values
  scene.remove(monthObj)
  monthObj = new THREE.Object3D() // create new month object
  scene.add(monthObj)
  weeks = generateWeeks(month, monthObj) // get weeks objects
  generateTaskList(weeks[0].children[7].position.y, month.getTasks()) // generate task list
}
function toggleSJF() {
  calendar.setSchedulerAlgorithm("SJF");
  calendar.runScheduler(month);
  // Clear the scene
  // Rebuild scene with new backend values
  scene.remove(monthObj)
  monthObj = new THREE.Object3D() // create new month object
  scene.add(monthObj)
  weeks = generateWeeks(month, monthObj) // get weeks objects
  generateTaskList(weeks[0].children[7].position.y, month.getTasks()) // generate task list
}
function recenter() {
  camera.position.setX(0)
  camera.position.setZ(0) 
  camera.position.setY(45) // move camera up 45 units
}

function viewTasks(weeks, taskList) {
  weeks[0].position.set(0,0,10000) // set week 1 to back
  weeks[1].position.set(0,0,1000) // set week 2 to 3rd back
  weeks[2].position.set(0,0,1000) // set week 3 to 2nd back
  weeks[3].position.set(0,0,1000) // set week 4 to front
  taskList.position.setZ(20)
  camera.position.set(0, 45, 0)
}

animate()


// text color: 0xF8B195 