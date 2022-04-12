import * as THREE from 'three';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import green_vert from "./green-vert.js";
import green_frag from "./green-frag.js";

let container;
let cube; 
let cubeBoundingBox;

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

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
    //camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
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

        // scene.add( headObj );

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

    // Translate circle pixel dimensions (300x300) to worldspace points

    //                  v normalized output of Vector3.project()
    //                      v pixel value of screen position

    // top-left     x: -1 = 0px
    // top-left     y: -1 = 0px
    // bottom-right x:  1 = window.innerWidth
    // bottom-right y:  1 = window.innerHeight

    /// Calc bounding box for the cube to get its worldspace size
    // cubeBoundingBox = new THREE.Box3().setFromObject( cube );
	// let boxSize = new THREE.Vector3();
	// cubeBoundingBox.getSize(boxSize);
    // console.log("BoxSize.x: " + boxSize.x);

    //get worldspace top left
    // let topLeft_px = new THREE.Vector2(0,0);
    // let btmRight_px = new THREE.Vector2(0,0);
    // let topLeft_worldspace = new THREE.Vector3(cube.position.x - (boxSize.x/2),
    //                                            cube.position.y - (boxSize.y/2), 0);
    // let btmRight_worldspace = new THREE.Vector3(cube.position.x + (boxSize.x/2),
    //                                            cube.position.y + (boxSize.y/2), 0);

    // let cubeCenter_projection = cube.position.project(camera);
    // let topLeft_projection = topLeft_worldspace.project(camera);
    // let btmRight_projection = btmRight_worldspace.project(camera);

    // topLeft_px.x = map(topLeft_projection.x, -1, 1, 0, window.innerWidth);
    // topLeft_px.y = map(topLeft_projection.y, -1, 1, 0, window.innerHeight);
    // btmRight_px.x = map(btmRight_projection.x, -1, 1, 0, window.innerWidth);
    // btmRight_px.y = map(btmRight_projection.y, -1, 1, 0, window.innerHeight);

    // Set top left and btm right px based on current window size
    let cw = window.innerWidth/2;
    let ch = window.innerHeight/2;
    let new_topLeft_px = new THREE.Vector2(cw-150, ch-150);
    let new_btmRight_px = new THREE.Vector2(cw+150, ch+150);

    // Set normalized vals (conver to NDC)
    let new_topLeft_ndc = new THREE.Vector3(0,0,0.5);
    new_topLeft_ndc.x = map(new_topLeft_px.x, 0, window.innerWidth, -1, 1);
    new_topLeft_ndc.y = map(new_topLeft_px.y, 0, window.innerHeight, 1, -1);
    let new_btmRight_ndc = new THREE.Vector3(0,0,0.5);
    new_btmRight_ndc.x = map(new_btmRight_px.x, 0, window.innerWidth, -1, 1);
    new_btmRight_ndc.y = map(new_btmRight_px.y, 0, window.innerHeight, 1, -1);

    console.log("new_topLeft_ndc = " + new_topLeft_ndc.x + ", " + new_topLeft_ndc.y);
    console.log("new_btmRight_ndc = " + new_btmRight_ndc.x + ", " + new_btmRight_ndc.y);
    ///CORRECT

    // Cast ray to go from NDC -> world space coords
    let new_topLeft_world = new THREE.Vector3();
    new_topLeft_ndc.unproject(camera);
    new_topLeft_ndc.sub( camera.position ).normalize();
    var distance = - camera.position.z / new_topLeft_ndc.z;
    new_topLeft_world.copy( camera.position ).add( new_topLeft_ndc.multiplyScalar( distance ) );

    let new_btmRight_world = new THREE.Vector3();
    new_btmRight_ndc.unproject(camera);
    new_btmRight_ndc.sub( camera.position ).normalize();
    var distance = - camera.position.z / new_btmRight_ndc.z;
    new_btmRight_world.copy( camera.position ).add( new_btmRight_ndc.multiplyScalar( distance ) );

    console.log("new_topLeft_world = " + new_topLeft_world.x + ", " + new_topLeft_world.y);
    console.log("new_btmRight_world = " + new_btmRight_world.x + ", " + new_btmRight_world.y);
    /// SEEMS WRONG

    // Calc box width and height
    let boxWidth = new_btmRight_world.x - new_topLeft_world.x;
    let boxHeight = new_topLeft_world.y - new_btmRight_world.y;
    console.log("boxWidth = " + boxWidth);
    console.log("boxHeight = " + boxHeight);

    // Circle

    const geometry = new THREE.BoxGeometry( boxWidth, boxHeight, 1 );
    const material = new THREE.ShaderMaterial( {
        color: 0x00ff00,
        uniforms:{
            u_time: { value: 1.0 },
            u_width: { value: boxWidth },
            u_height: { value: boxHeight },
        },
        vertexShader: green_vert,
	    fragmentShader: green_frag
    } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    /// Renderer

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

    // width = window.innerWidth;
    // height = window.innerHeight;

    // cube.material.uniforms.u_width.value = width;
    // cube.material.uniforms.u_height.value = height;

    // camera.aspect = window.innerWidth / window.innerHeight;
    // camera.updateProjectionMatrix();

    // renderer.setSize( window.innerWidth, window.innerHeight );

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

function map(value, min1, max1, min2, max2)
{
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}