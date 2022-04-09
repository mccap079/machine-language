import * as THREE from 'three';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import green_vert from "./green-vert.js";
import green_frag from "./green-frag.js";

let container;

let camera, scene, renderer;

let time;
let mouseX = 0, mouseY = 0;

var width = window.innerHeight;
var height = window.innerHeight;

let headObj;
let headScale = 25;

var light = new THREE.AmbientLight(0xDDDDDD, 0.8); // make head white
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.castShadow = true;
var scaleSpeed = getRandomIntInclusive(0.01, 1);

init();
animate();


function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    // scene

    scene = new THREE.Scene();

    // camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    camera.position.z = 100;
    camera.lookAt( scene.position );
    scene.add( camera );
    

    scene.add(directionalLight);
    scene.add(light);
    
    // manager

    function loadModel() {

        headObj.traverse( function ( child ) {

            if ( child.isMesh ) child.material = new THREE.MeshBasicMaterial({color: 0xFF0000}); 

        } );

        scene.add( headObj );

    }

    const manager = new THREE.LoadingManager( loadModel );

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
        headObj.scale.set(headScale,headScale,headScale);
        console.log("headObj.scale.xyz = " + headObj.scale.x + ", " + headObj.scale.y + ", " + headObj.scale.z);
    }, onProgress, onError );

    // Circle

    const geometry = new THREE.BoxGeometry( 500, 500, 1 );
    const material = new THREE.ShaderMaterial( {
        color: 0x00ff00,
        uniforms:{
            u_time: { value: 1.0 },
            u_width: { value: width },
            u_height: { value: height },
        },
        vertexShader: green_vert,
	    fragmentShader: green_frag
    } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

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

    width = window.innerWidth;
    height = window.innerHeight;

    cube.material.uniforms.u_width.value = width;
    cube.material.uniforms.u_height.value = height;

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
        headObj.scale.set(headScale, headScale, headScale);
        //camera.position.x = getRandomIntInclusive(-50, 50);
    }
    headObj.rotation.y += time * Math.PI / 180
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}