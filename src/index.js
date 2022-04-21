import * as THREE from 'three';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import circle_vert from "./circle-vert.js";
import circle_frag from "./circle-frag.js";
import frag_screen from './frag_screen.js';
import vert from './vert.js';

let container;
let cube; 
let boxSz;

let camera, cameraRT, scene, sceneRT, sceneScreen, renderer;

let time;

var width = document.documentElement.clientWidth;
var height = window.innerHeight;
var frameNum = 0;

let headObj;
let headScale = 150;

var light = new THREE.AmbientLight(0xDDDDDD, 0.8); // make head white
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.castShadow = true;
let scaleSpeedMax = 20;
let scaleSpeedMin = 10;
var scaleSpeed = getRandomIntInclusive(scaleSpeedMin, scaleSpeedMax);

let rtTexture, quadMat, quad;

init();
animate();


function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    // scenes

    scene = new THREE.Scene(); //Add cube to this
    sceneRT = new THREE.Scene(); //Add head to this
    sceneScreen = new THREE.Scene();

    scene.add(directionalLight);
    scene.add(light);

    // cameras

    camera = new THREE.PerspectiveCamera(30, width / height, 1, 10000);
    //camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    camera.position.z = 100;
    camera.lookAt( scene.position );  
    
    cameraRT = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, - 10000, 10000 );
    cameraRT.position.z = 100;

    // rtTex stuff

    rtTexture = new THREE.WebGLRenderTarget( width, height );

    quadMat = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

    const materialScreen = new THREE.ShaderMaterial( {

        uniforms: { tDiffuse: { value: rtTexture.texture } },
        vertexShader: vert,
        fragmentShader: frag_screen,

        depthWrite: false

    } );

    // Create an intermediary quad that renders the entire scene to offset the upside down output
    const plane = new THREE.PlaneGeometry( width, height );

    quad = new THREE.Mesh( plane, quadMat );
    quad.position.z = - 100;
    sceneRT.add( quad );

    quad = new THREE.Mesh( plane, materialScreen );
    quad.position.z = - 100;
    sceneScreen.add( quad );
    
    // manager

    function loadModel() {

        headObj.traverse( function ( child ) {

            if ( child.isMesh ) child.material = new THREE.MeshBasicMaterial({color: 0x000000}); 

        } );
    }

    const manager = new THREE.LoadingManager( loadModel );

    // Upload faceModel obj

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
        headObj.position.set(0,0,100);
        sceneRT.add( headObj );
    }, onProgress, onError );

    boxSz = setBoxSize();
    
    // Circle box

    const geometry = new THREE.BoxGeometry( boxSz.x, boxSz.y, 1 );
    const cubeMat = new THREE.ShaderMaterial( {
        uniforms:{
            u_width: { value: boxSz.x },
            u_height: { value: boxSz.y },
            u_texture: { value: rtTexture.texture },
            u_resolution_screen: {value: new THREE.Vector2(width, height)},
            u_frameNum: {value: 0.0}
        },
        vertexShader: circle_vert,
	    fragmentShader: circle_frag
    } );
    cube = new THREE.Mesh( geometry, cubeMat );
    scene.add( cube );

    /// Renderer

    renderer = new THREE.WebGLRenderer({});
    renderer.setClearColor(0xff0000);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );
    renderer.autoClear = false;

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

function setBoxSize(){
    // Set top left and btm right px based on current window size
    let cw = width/2;
    let ch = height/2;
    let new_topLeft_px = new THREE.Vector2(cw-150, ch-150);
    let new_btmRight_px = new THREE.Vector2(cw+150, ch+150);

    // Set normalized vals (conver to NDC)
    let new_topLeft_ndc = new THREE.Vector3(0,0,0.5);
    new_topLeft_ndc.x = map(new_topLeft_px.x, 0, width, -1, 1);
    new_topLeft_ndc.y = map(new_topLeft_px.y, 0, height, 1, -1);
    let new_btmRight_ndc = new THREE.Vector3(0,0,0.5);
    new_btmRight_ndc.x = map(new_btmRight_px.x, 0, width, -1, 1);
    new_btmRight_ndc.y = map(new_btmRight_px.y, 0, height, 1, -1);

    // Cast ray to go from NDC -> world space coords
    let new_topLeft_world = new THREE.Vector3();
    new_topLeft_ndc.unproject(camera);
    new_topLeft_ndc.sub( camera.position ).normalize();
    let distance = - camera.position.z / new_topLeft_ndc.z;
    new_topLeft_world.copy( camera.position ).add( new_topLeft_ndc.multiplyScalar( distance ) );

    let new_btmRight_world = new THREE.Vector3();
    new_btmRight_ndc.unproject(camera);
    new_btmRight_ndc.sub( camera.position ).normalize();
    distance = - camera.position.z / new_btmRight_ndc.z;
    new_btmRight_world.copy( camera.position ).add( new_btmRight_ndc.multiplyScalar( distance ) );

    // Calc box width and height
    let boxWidth_ = new_btmRight_world.x - new_topLeft_world.x;
    let boxHeight_ = new_topLeft_world.y - new_btmRight_world.y;
    return new THREE.Vector2(boxWidth_, boxHeight_);
}

function onWindowResize() {

    width = document.documentElement.clientWidth;
    height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );

    // // Update size of circle box
    boxSz = setBoxSize();
    let newCubeGeom = new THREE.BoxGeometry( boxSz.x, boxSz.y, 1 );
    cube.geometry.dispose();
    cube.geometry = newCubeGeom;

    // cube.material.uniforms.u_width.value = boxSz.x;
    // cube.material.uniforms.u_height.value = boxSz.y;
    // cube.material.uniforms.u_resolution_screen = new THREE.Vector2(width, height); //TODO: debug why this causes tons of errors

    const newCubeMat = new THREE.ShaderMaterial( {
        uniforms:{
            u_width: { value: boxSz.x },
            u_height: { value: boxSz.y },
            u_texture: { value: rtTexture.texture },
            u_resolution_screen: {value: new THREE.Vector2(width, height)},
            u_frameNum: {value: 0.0}
        },
        vertexShader: circle_vert,
	    fragmentShader: circle_frag
    } );
    cube.material.dispose();
    cube.material = newCubeMat;
}

function animate() {
    
    requestAnimationFrame( animate );
    render();

}

function render() {

    time = performance.now() * 0.0001;

    cube.material.uniforms.u_frameNum.value = frameNum;
    
    frameNum++;
    if(frameNum >= 10000) frameNum = 0;

    camera.lookAt(scene.position);

    renderer.setRenderTarget( rtTexture );
	renderer.clear();
    renderer.render( sceneRT, cameraRT );

    renderer.setRenderTarget( null );
	renderer.clear();
    renderer.render( sceneScreen, cameraRT );

    renderer.render(scene, camera);

}

function scaleAction() {
    if (headObj.scale.x > 0) {
        var pickAxis = Math.random();
        if (pickAxis > 0.5) {
            headObj.scale.x -= scaleSpeed * Math.random();
        } else {
            headObj.scale.y -= scaleSpeed * Math.random();
        }
    } else {
        scaleSpeed = Math.random() * scaleSpeedMax;
        if (scaleSpeed < scaleSpeedMin) {
            scaleSpeed = scaleSpeedMin;
        }
        let newHeadScale = new THREE.Vector3(
            headScale + ((Math.random() - 0.5) * 100),
            headScale + ((Math.random() - 0.5) * 100),
            headScale + ((Math.random() - 0.5) * 100)
        )
        headObj.scale.set(newHeadScale.x, newHeadScale.y, newHeadScale.z);
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