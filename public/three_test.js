var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var fixedPlaneVector = new THREE.Vector3();
var mouse3dPositionVector = new THREE.Vector3();
var mouse = new THREE.Vector2();

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var raycaster = new THREE.Raycaster();

camera.position.z = 5;

var radius = 10, theta = 0, cubes = [];

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
	var intersects = raycaster.intersectObjects(scene.children);
	// if (!intersects.length)
	// 	addCubeAt3dMousePointer(0.5, {speed_modifier: 4});
	for (var x = 0; x < intersects.length; x++) {
		if (typeof(intersects[x].object.ledger_content) !== 'undefined')
			console.log(intersects[x].object.ledger_content.ledgerVersion);
	}
});

var animate = () => {
	requestAnimationFrame( animate );
	
	theta += 0.1;
	
	camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
	camera.position.y = -radius * Math.sin( THREE.Math.degToRad( theta ) );
	camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
	camera.lookAt( scene.position );
	camera.updateMatrixWorld();
	
	raycaster.setFromCamera(mouse, camera);
			
	for (var x = 0; x < cubes.length; x++) {
		var pace = -0.01 * cubes[x].speed_modifier;
		cubes[x].rotation.x += pace;
		cubes[x].rotation.y += pace;
		cubes[x].rotation.z += pace;
		
		//cubes[x].position.x += 0 * (pace);
		//cubes[x].position.y += -0.3 * (pace);
		//cubes[x].position.z += (pace);
	}
	renderer.render( scene, camera );
};

animate();








function addCubeToScene(boxGeoX, boxGeoY, boxGeoZ, meshColorHex, coordinates, params={}) {
	var geometry = new THREE.BoxGeometry( boxGeoX, boxGeoY, boxGeoZ );
	var material = new THREE.MeshBasicMaterial( { color: meshColorHex } );
	var cube = new THREE.Mesh( geometry, material );
	
	cube.position.set(coordinates.x, coordinates.y, coordinates.z);
	cube.speed_modifier = 1;

	if (params.ledger_content)
		cube.ledger_content = params.ledger_content;
	if (params.speed_modifier)
		cube.speed_modifier = params.speed_modifier;
	
	scene.add(cube);
	cubes.push(cube);
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
	var randX = Math.random() * radius * 0.8;
	randX *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
	var randY = Math.random() * radius * 0.8;
	randY *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
	var randZ = Math.random() * radius * 0.8;
	randZ *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
	addCubeToScene(
		test_size_square, 
		test_size_square, 
		test_size_square, 
		generateRandomHexColorCode(),
		{ x: randX, y: randY, z: randZ },
		params
	);
}
