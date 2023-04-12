import './style.css'

import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
})

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
camera.position.setZ(50)

const boxGeometry =  new THREE.BoxGeometry(5, 5, 5)
const material = new THREE.MeshStandardMaterial({ color: 0xff6347 })
const rectangle = new THREE.Mesh( boxGeometry, material ) //  actual object to add to scene

scene.add(rectangle)

const pointLight = new THREE.PointLight(0xffffff)
pointLight.position.set(10, 0, 25)
scene.add(pointLight)

// const ambientLight = new THREE.AmbientLight(0xffffff)
// scene.add(pointLight, ambientLight)

const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 50)
scene.add(lightHelper, gridHelper)

const controls = new OrbitControls(camera, renderer.domElement) // listen to dom events on mouse and update camera positon

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24)
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const star = new THREE.Mesh(geometry, material)

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100))
  star.position.set(x, y, z)
  scene.add(star)
}

Array(200).fill().forEach(addStar)

const squareTexture = new THREE.TextureLoader().load('gray-square-pattern.jpg')
scene.background = squareTexture

const jeff = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3),
  new THREE.MeshBasicMaterial({ map: squareTexture })
)

jeff.position.set(0, 0, 20)

scene.add(jeff)

function animate() {
  requestAnimationFrame( animate ) // ask browser to perform animation

  rectangle.rotation.x += 0.01
  rectangle.rotation.y += 0.005
  rectangle.rotation.z += 0.01

  controls.update() // update camera position

  renderer.render(scene, camera)  // render scene with camera
}

animate()
