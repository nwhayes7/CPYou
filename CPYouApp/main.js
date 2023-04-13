import './style.css'

import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

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

// Add Stars
function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24)
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const star = new THREE.Mesh(geometry, material) // create new star mesh

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100)) // create random x, y, z coordinates
  star.position.set(x, y, z) // set star position
  scene.add(star) // add star to scene
}
Array(100).fill().forEach(addStar) // add 100 stars to scene

scene.background = new THREE.Color(0x355c7d)

function generateDays(week, fontLoader) {
  let x = 3
  while (x > -4) {
    const geometry = new THREE.BoxGeometry(5, 5, 5)
    const material = new THREE.MeshStandardMaterial({ color: 0xc06c84 })
    const cube = new THREE.Mesh(geometry, material) // create new cube mesh
    cube.position.set(x*7, -2.5, 0) // set cube position

  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new TextGeometry('June1\nI love pandas', {
      font: font,
      size: .4,
      height: .04,
      curveSegments: 2
    })
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF }) //F8B195
    const text = new THREE.Mesh(textGeometry, textMaterial)
    text.position.set(-2.1,2.6,-1.8)
    text.rotateX(-1.6)
    cube.add(text)
  })

    week.add(cube) // add cube to scene
    x--
  }
}

function generateWeeks(fontLoader) {
  let weeks  = []
  let z = 1
  while (z > -3) {
    const week = new THREE.Object3D()
    generateDays(week, fontLoader)
    week.position.set(0, 0, z * 7 + 3.5)
    weeks.push(week)
    scene.add(week)
    z--
  }
  return weeks
} 

const loader = new FontLoader()
let weeks = generateWeeks(loader) // get weeks objects

function animate() {
  requestAnimationFrame( animate ) // ask browser to perform animation

  controls.update() // update camera position
  pointLight.position.set(camera.position.x, camera.position.y, camera.position.z) // move light with camera
  renderer.render(scene, camera)  // render scene with camera
}

animate()


// text color: 0xF8B195 