var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var fixedPlaneVector = new THREE.Vector3();
var mouse3dPositionVector = new THREE.Vector3();
var mouse = new THREE.Vector2();
var renderer = new THREE.WebGLRenderer({antialias: true});
var raycaster = new THREE.Raycaster();
var overlay = document.querySelector('#mainOverlay');

var radius = 10, theta = 0, cubes = [], ledger_cubes_emi = 0;

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 5;

var ambientLight = new THREE.AmbientLight( 0x404040, 0.1 ); // soft white light
scene.add( ambientLight );

var lightVertexList = [
	[-50, -50, -50], [-50, 50, -50], [-50, 50, 50], [-50, -50, 50],
	[50, -50, -50], [50, 50, -50], [50, 50, 50], [50, -50, 50],
	[0, 0, 0], [0, -50, -50], [0, 50, -50], [0, 50, 50], [0, -50, 50],
	[0, 0, -50], [0, 0, 50], [0, 50, 0], [0, -50, 0], [-50, 0, 0], [50, 0, 0]
];

for (var vertex_index = 0; vertex_index < lightVertexList.length; vertex_index++) {
	var light_xyz = lightVertexList[vertex_index];
	var light_color = 0x00ff00, light_intensity = 0.2, light_decay = 75;
	if (!light_xyz[0] && !light_xyz[1] && !light_xyz[2]) {
		light_color = 0xffffff; 
		light_intensity = 0.5;
		light_decay = 500;
	}
	addPointLightToScene( 
		light_xyz[0], light_xyz[1], light_xyz[2], 
		light_color, light_intensity, light_decay);
}

// Start out with some 'npc' cubes :)
for (var x = 0; x < 150; x++ ) 
	addCubeAtRandom3DPosition(0.6, { color: 0x00da00, wireframe: false });
for (var x = 0; x < 200; x++ ) 
	addCubeAtRandom3DPosition(0.6, { color: 0xc4c0c0, wireframe: false });

init();
animate();





function addPointLightToScene(pos_x, pos_y, pos_z, hu, sa, l) {
	var light = new THREE.PointLight( hu, sa, l );
	light.position.set( pos_x, pos_y, pos_z );
	scene.add( light );
}


function init() {
	window.addEventListener('mousemove', (event) => {
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	});
	window.addEventListener('resize', (event) => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	});

	document.addEventListener('click', (event) => {
		event.preventDefault();
		update3dMousePointer();
		if (event.target.closest('#mainOverlay')) {
			processOverlayClickEvent(event);
		} else {
			processCanvasClickEvent(event);
		}
	});

}

function animate() {
	requestAnimationFrame( animate );
	render();
}




function addCubeToScene(boxGeoX, boxGeoY, boxGeoZ, meshColorHex, coordinates, params={}) {
	if (cubes.length >= 1000) {
		var remove_cube = cubes.shift();
		remove_cube.geometry.dispose();
		remove_cube.material.dispose();
		scene.remove(remove_cube);
	}

	var geometry = new THREE.BoxGeometry( boxGeoX, boxGeoY, boxGeoZ );
	var material = new THREE.MeshPhongMaterial( { 
		color: meshColorHex,
		emissive: meshColorHex, 
		emissiveIntensity: typeof(params.emmissiveIntensity) === 'undefined' ? 0.25 : params.emmissiveIntensity,
		wireframe: typeof(params.wireframe) === 'undefined' ? false : params.wireframe
	} );
	var cube = new THREE.Mesh( geometry, material );
	
	cube.position.set(coordinates.x, coordinates.y, coordinates.z);
	cube.speed_modifier = 1;
	cube.onScaleCollapseActions = [];

	if (params.ledger_content)
		cube.ledger_content = params.ledger_content;
	if (params.speed_modifier)
		cube.speed_modifier = params.speed_modifier;
	
	scene.add(cube);
	cubes.push(cube);
	cube.scale.x += 2;
	cube.scale.y += 2;
	cube.scale.z += 2;
}

function generateRandomHexColorCode() {
	var letters = "0123456789ABCDEF"; 
    var color = '#'; 
    for (var i = 0; i < 6; i++) 
	   color += letters[(Math.floor(Math.random() * 16))];
	return color;
}

function update3dMousePointer() {
	fixedPlaneVector.set(
		( event.clientX / window.innerWidth ) * 2 - 1,
		- ( event.clientY / window.innerHeight ) * 2 + 1,
		0.5 );
	fixedPlaneVector.unproject( camera );
	fixedPlaneVector.sub( camera.position ).normalize();
	var distance = - camera.position.z / fixedPlaneVector.z;
	mouse3dPositionVector.copy( camera.position ).add( fixedPlaneVector.multiplyScalar( distance ) );
}

function addCubeAt3dMousePointer(test_size_square, params={}) {
	addCubeToScene(
		test_size_square, 
		test_size_square, 
		test_size_square, 
		generateRandomHexColorCode(),
		{ x: mouse3dPositionVector.x, y: mouse3dPositionVector.y, z: mouse3dPositionVector.z },
		params
	);
}

function addCubeAtRandom3DPosition(test_size_square, params={}) {
	addCubeToScene(
		test_size_square, 
		test_size_square, 
		test_size_square, 
		params.color ? params.color : generateRandomHexColorCode(),
		{ x: getRandomPositiveNegativePoint(), 
		  y: getRandomPositiveNegativePoint(), 
		  z: getRandomPositiveNegativePoint() },
		params
	);
}

function getRandomPositiveNegativePoint(scale_adjusment=1) {
	var random_point = Math.random() * radius * scale_adjusment;
	random_point *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
	return random_point;
}







function render() {
	theta += 0.1;
	
	camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
	camera.position.y = -radius * Math.sin( THREE.Math.degToRad( theta ) );
	camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
	camera.lookAt( scene.position );
	camera.updateMatrixWorld();
	
	raycaster.setFromCamera(mouse, camera);
			
	updateCubesForNextFrame();

	renderer.render( scene, camera );
}


function processCanvasClickEvent(event) {
	var intersects = raycaster.intersectObjects(scene.children);
	var overlay_handler = (obj) => {
		var ledgerVersion = obj.ledger_content.ledgerVersion;
		var ledgerOpts = {
			ledgerVersion: ledgerVersion,
			includeTransactions: true
		};
		if (typeof(obj.ledger_content.transactionHashes) === 'undefined') {
			console.log('noshas', obj.ledger_content.transactionHashes,typeof(obj.ledger_content.transactionHashes));
			api.getLedger(ledgerOpts).then((data) => {
				obj.ledger_content = data;
				console.log(obj.ledger_content.transactionHashes.length);
				overlay.innerHTML = 
				    `<button id="closeOverlayButton" onclick="hideOverlay();">- X -</button>
			 	     <pre>${JSON.stringify(obj.ledger_content, null, 2)}</pre>`;
			    showOverlay();
			});
		} else {
			overlay.innerHTML = 
				`<button id="closeOverlayButton" onclick="hideOverlay();">- X -</button>
				<pre>${JSON.stringify(obj.ledger_content, null, 2)}</pre>`;
			showOverlay();
		}
	};
	for (var x = 0; x < intersects.length; x++) {
		intersects[x].object.scale.x += 0.25;
		intersects[x].object.scale.y += 0.25;
		intersects[x].object.scale.z += 0.25;
		if (intersects[x].object.ledger_content) {
			overlay_handler(intersects[x].object);
			break;
		}
	}
	if (!intersects.length) addCubeAt3dMousePointer(0.5, {speed_modifier: 4});
}


function processOverlayClickEvent(event) {
	console.log('test', event);
}


function hideOverlay() {
	overlay.style.display = 'none';
}
function showOverlay() {
	overlay.style.display = 'block';
}


function updateCubesForNextFrame() {
	ledger_cubes_emi -= Math.random() * 0.004;
	for (var x = 0; x < cubes.length; x++) {
		var rotation_pace = -0.005 * cubes[x].speed_modifier;
		var scale_revert_pace = 0.02 * cubes[x].speed_modifier;

		cubes[x].rotation.x += rotation_pace;
		cubes[x].rotation.y += rotation_pace;
		cubes[x].rotation.z += rotation_pace;
		
		if (cubes[x].hasOwnProperty('ledger_content')) {
			ledger_cubes_emi = ledger_cubes_emi <= 0 ? 0.4 : ledger_cubes_emi;
			cubes[x].material.emissiveIntensity = ledger_cubes_emi;
		}
		
		if (cubes[x].scale.x.toPrecision(6) != 1) {
			cubes[x].scale.x += cubes[x].scale.x < 1 ? scale_revert_pace : -(scale_revert_pace);
		}
		if (cubes[x].scale.y.toPrecision(6) != 1) {
			cubes[x].scale.y += cubes[x].scale.y < 1 ? scale_revert_pace : -(scale_revert_pace);
		}
		if (cubes[x].scale.z.toPrecision(6) != 1) {
			cubes[x].scale.z += cubes[x].scale.z < 1 ? scale_revert_pace : -(scale_revert_pace);
		}

		//cubes[x].position.x += 0 * (pace);
		//cubes[x].position.y += -0.3 * (pace);
		//cubes[x].position.z += (pace);
	}
}