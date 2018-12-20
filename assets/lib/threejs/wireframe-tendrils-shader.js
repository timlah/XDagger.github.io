// default: 136 speed



var APP = APP || {};
var controls;
APP.ShaderDemo5 = function() {

	this.actors = [];
	this.ready = false;
	var self = this;



	this.init = function() {

		renderer.autoClear = false;
		//renderer.setClearColor( 0x000000, .15 );
		APP.disableComposer = true;
		APP.startTime = new Date().getTime();
		APP.updateInterval = 75;
		APP.nextUpdate = APP.updateInterval;
		APP.spawnThreshold = .3;

		APP.stageSize = 10;

		camera.setLens(13, 7.49); // 16mm bolex
		scene.fog = null;

		scene.remove(camera);

		APP.cameraHolder = new THREE.Object3D();
		APP.cameraHolder.add(camera);

		APP.noiseTex = THREE.ImageUtils.loadTexture("/assets/lib/threejs/rgb-perlin-seamless-512.png");
		APP.noiseTex.wrapT = APP.noiseTex.wrapS = THREE.RepeatWrapping;
		// APP.noiseTex.minFilter = APP.noiseTex.maxFilter = THREE.NearestFilter;

		camera.position.z = 20;
		camera.position.x = 2;
		camera.position.y = -1;
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		controls = new THREE.TrackballControls( camera );

		controls.rotateSpeed = 1.0;
		controls.zoomSpeed = 2.2;
		controls.panSpeed = .3;

		controls.noZoom = false;
		controls.noPan = false;
		controls.noRoll = true;
		// controls.noRotate = true;

	  controls.staticMoving = false;
		controls.dynamicDampingFactor = 0.25;

		scene.add(APP.cameraHolder);
		APP.zoomDivider = 12;

		APP.shaderMat = new THREE.ShaderMaterial( {
			transparent: true,
			wireframe: true,
			uniforms: {
				"uTime": { type: "f", value: 0.0 },
				"tDiffuse": { type: "t", value: APP.noiseTex },
				"uZoomMultiplyer": { type: "f", value: APP.zoomDivider / (new THREE.Vector3().distanceTo(camera.position)) }
			},
			depthTest: false,
			vertexShader: document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentShader' ).textContent
		} );

		// APP.shaderMat.lights = true;
		APP.shaderPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100, 100, 100), APP.shaderMat);
		APP.shaderPlane.scale.set(5, 5, 5);
		// scene.add(APP.shaderPlane2);
		// // APP.shaderPlane.rotation.x = -55 * Math.PI / 180;
		APP.shaderPlane.position.y = 0;
		scene.add(APP.shaderPlane);


		APP.stage.cameraUpdate = function() {

		}

		window.addEventListener("mousewheel", MouseWheelHandler, false);
		function MouseWheelHandler(e) {
			// // cross-browser wheel delta
			// var e = window.event || e; // old IE support
			// var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			// // camera.fov -= e.wheelDelta * .01;
			// camera.position.z -= e.wheelDelta * .0005;
			// if(camera.position.z < -10.5) camera.position.z = -4.5;
			// APP.shaderMat.uniforms['uZoomMultiplyer'].value = APP.zoomDivider / (new THREE.Vector3().distanceTo(camera.position));
			// // console.log(camera.position.z);
			// camera.lookAt(new THREE.Vector3(0., 0., 0.));
			// // console.log(camera.fov);
			// //camera.position.z -= e.wheelDelta * .01;
			// camera.updateProjectionMatrix();
		}


		scene.fog = null;//new THREE.FogExp2(0, .0005);

		// load all our assets
		this.setupAssets();
	}

	this.setupAssets = function() {

		APP.materials = APP.materials || {};
		APP.models = APP.models || {};

		self.ready = true;

	}

	this.tick = function() {

	}

	this.update = function() {
		controls.update();
		// update the time
		APP.time = new Date().getTime() - APP.startTime;
		APP.shaderMat.uniforms['uTime'].value = APP.time * .000000250;
		APP.shaderPlane.rotation.y += .05 * Math.PI / 180;
		APP.shaderPlane.rotation.x += .025 * Math.PI / 180;
		if(APP.time > APP.nextUpdate) {

			APP.nextUpdate = APP.time + APP.updateInterval;
			this.tick();
			// console.log("tick");
		}

	}

	this.add = function( actor ) {
		actor.init();
		this.actors.push(actor);
	}

	this.remove = function( actor ) {
		// remove actor from list
		var i = this.actors.indexOf(actor);
		if(i > -1) {
			this.actors.splice(i, 1);
		}
		actor.destroy();
	}

}

window.onload = function() {
	APP.stage = new THREE.StageManager();
	APP.stage.play = new APP.ShaderDemo5();
	APP.stage.init();

}
