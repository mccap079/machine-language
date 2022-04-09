import * as THREE from 'three';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

let container;

let camera, scene, renderer;

let time;
let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let headObj;

var light = new THREE.AmbientLight(0xDDDDDD, 0.8); // make head white
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.castShadow = true;
var colorPick = 0;
var rmapped = 0;
var scaleSpeed = getRandomIntInclusive(0.01, 1);

init();
animate();


function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    // scene

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);;
    camera.position.z = 10;
    camera.lookAt( scene.position );
    scene.add( camera );
    

    scene.add(directionalLight);
    scene.add(light);
    

    // manager

    function loadModel() {

        headObj.traverse( function ( child ) {

            //if ( child.isMesh ) child.material.map = texture;
            if ( child.isMesh ) child.material = new THREE.MeshBasicMaterial({color: 0xFF0000}); 

        } );

        scene.add( headObj );

    }

    const manager = new THREE.LoadingManager( loadModel );

    // texture

    // const textureLoader = new THREE.TextureLoader( manager );
    // const texture = textureLoader.load( 'textures/uv_grid_opengl.jpg' );

    // model

    function onProgress( xhr ) {

        if ( xhr.lengthComputable ) {

            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );
        }

    }

    function onError() {}

    const loader = new OBJLoader( manager );
    loader.load( 'FaceModel.obj', function ( obj ) {

        headObj = obj;
        console.log("headObj.scale.xyz = " + headObj.scale.x + ", " + headObj.scale.y + ", " + headObj.scale.z);
    }, onProgress, onError );

    //

    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    //container.appendChild( renderer.domElement );
    threejs_canvas.appendChild(renderer.domElement);

    document.addEventListener('mousemove', scaleAction);

    //mouse in
    document.getElementById('circle').addEventListener('mouseover', function(e) {
        document.getElementById('threejs_canvas').style.display = "block";
    });

    //mouse out
    document.getElementById('circle').addEventListener('mouseout', function(e) {
        document.getElementById('threejs_canvas').style.display = "none";
    });

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}



function animate() {
    time = performance.now() * 0.0001;
    requestAnimationFrame( animate );
    render();

}

function render() {

    renderer.render( scene, camera );

}

function scaleAction() {
    //console.log("headObj.scale.xyz = " + headObj.scale.x + ", " + headObj.scale.y + ", " + headObj.scale.z);
    if (headObj.scale.x > 0) {
        var pickAxis = Math.random();
        if (pickAxis > 0.5) {
            headObj.scale.x -= scaleSpeed * Math.random();
        } else {
            headObj.scale.y -= scaleSpeed * Math.random();
        }
    } else {
        scaleSpeed = Math.random() * 10;
        if (scaleSpeed < 0.02) {
            scaleSpeed = 0.02;
        }
        headObj.scale.set(1, 1, 1);
        //camera.position.x = getRandomIntInclusive(-50, 50);
    }
    headObj.rotation.y += time * Math.PI / 180
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}