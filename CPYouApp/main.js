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

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100)) // create random x, y, z coordinates
  star.position.set(x, y, z) // set star position
  scene.add(star) // add star to scene
}

function generateTasks(dayObj, dayBackend) {
  let yPos = 0 // current y pos
  let lastHours = 1 // initial hours must be 1
  let currHours = 2 //
  let i = 0 //
  for (let i = 0; i < dayBackend.getTasks().length; i++) { // loop through task list
    const geometry = new THREE.BoxGeometry(5, currHours, 5)
    const material = new THREE.MeshStandardMaterial({ color: 0xF8B195  })
    const task = new THREE.Mesh(geometry, material) // create new cube mesh
    yPos = yPos - (lastHours/2) -.5 - (currHours/2) // update y pos
    task.position.set(0, yPos, 0) // set cube position
    dayObj.add(task) // add cube to day object
    lastHours = currHours
    i++
  }
}

function generateDays(weekObj, weekBackend) {
  let x = 3
  for (let i = 0; i < weekBackend.getDays().length; i++) {
    const geometry = new THREE.BoxGeometry(5, 1, 5)
    const material = new THREE.MeshStandardMaterial({ color: 0xc06c84 })
    const cube = new THREE.Mesh(geometry, material) // create new cube mesh

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
      cube.add(text)
    })

    // create day object and assign position
    const dayObj = new THREE.Object3D() // create new day object

    dayObj.add(cube)  // add cube to day object

    generateTasks(dayObj, weekBackend.getDays()[i]) // generate tasks for day

    dayObj.position.set(x*7, -.5, 0) // set x and y position of day object
  
    weekObj.add(dayObj) 
    x--
  }
}

function generateWeeks(monthBackend = null) {
  let weeks  = []
  let z = 1
  // Implentation with backend connection
  if (monthBackend != null) {
    for (let i = 0; i < monthBackend.getWeeks().length; i++) {
      console.log(i);
      const week = new THREE.Object3D()
      generateDays(week, monthBackend.getWeeks()[i]);
      week.position.set(0, 0, z * 7 + 3.5)
      weeks.push(week)
      scene.add(week)
      z--
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

function generateTaskList() {
  let x = 0 // initialize x
  while (x < 10 || x == 10) { // loop through tsk list up to ten tasks
    const geometry = new THREE.BoxGeometry(5, 1, 5)
    const material = new THREE.MeshStandardMaterial({ color: 0xF8B195  })
    const task = new THREE.Mesh(geometry, material) // create new cube mesh
    task.position.set(-21 + x*7, -.5, 23) // set cube position
    
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

function animate() {
  requestAnimationFrame( animate ) // ask browser to perform animation

  controls.update() // update camera position
  pointLight.position.set(camera.position.x, camera.position.y, camera.position.z) // move light with camera
  renderer.render(scene, camera)  // render scene with camera
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
camera.position.setY(23) // move camera up 50 units
camera.rotateX(90) // rotate camera to face
const controls = new OrbitControls(camera, renderer.domElement) // listen to dom events on mouse and update camera positon

const pointLight = new THREE.PointLight(0xffffff)
scene.add(pointLight)

// const ambientLight = new THREE.AmbientLight(0xffffff)
// scene.add(pointLight, ambientLight)

// Add helpers to get a sense of distance and rotation
const lightHelper = new THREE.PointLightHelper(pointLight) 
const gridHelper = new THREE.GridHelper(200, 50)
scene.add(lightHelper ,gridHelper)

// Add Background Color
scene.background = new THREE.Color(0x355c7d)

Array(100).fill().forEach(addStar) // add 100 stars to scene

const loader = new FontLoader()

// calendar has only 1 month in it by default
let calendar = new Calendar();
let month = calendar.getMonths()[0];
console.log(month instanceof Month);
let weeks = generateWeeks(month) // get weeks objects
generateTaskList() // generate task list

animate()


// text color: 0xF8B195 