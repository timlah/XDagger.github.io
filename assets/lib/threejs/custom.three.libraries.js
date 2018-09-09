
THREE.CircleOutlineGeometry = function(radius, resolution) {
	var radius = radius || 1;
	var resolution = resolution || 16;

	var g = new THREE.Geometry();

	for (var i = 0; i <= resolution; i++) {
	    var theta = (i / resolution) * Math.PI * 2;
	    g.vertices.push(
	        new THREE.Vector3(
	            Math.cos(theta) * radius,
	            Math.sin(theta) * radius,
	            0));            
	}

	return g;
}

THREE.CircleDiscGeometry = function(innerRadius, outerRadius, resolution) {
	var innerRadius = innerRadius || .5;
	var outerRadius = outerRadius || 1;
	var resolution = resolution || 16;

	var g = new THREE.Geometry();

	// plot innerRadius vertices
	for (var i = 0; i < resolution; i++) {
	    var theta = (i / resolution) * Math.PI * 2;
	    g.vertices.push(
	        new THREE.Vector3(
	            Math.cos(theta) * innerRadius,
	            Math.sin(theta) * innerRadius,
	            0));
	}

	// plot outerRadius vertices
	for (var i = 0; i < resolution; i++) {
	    var theta = (i / resolution) * Math.PI * 2;
	    g.vertices.push(
	        new THREE.Vector3(
	            Math.cos(theta) * outerRadius,
	            Math.sin(theta) * outerRadius,
	            0));            
	}

	// define faces, 
	for (var v = 0; v < resolution; v++) {
		if(v < resolution - 1) {
			g.faces.push(new THREE.Face3(v + 1, v + resolution + 1, v + resolution));
			g.faces.push(new THREE.Face3(v + resolution, v, v + 1));	
		} else {
			g.faces.push(new THREE.Face3(0, resolution, resolution * 2 - 1));
			g.faces.push(new THREE.Face3(resolution * 2 - 1, resolution - 1, 0));				
		}
	}

	g.computeFaceNormals();
	g.normalsNeedUpdate = true;

	return g;

}


var spawnMesh = function(g) {
	var m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
	scene.add(m);
	return m;
};

var spawnLine = function(g) {
	var m = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xFFFFFF }));
	scene.add(m);
	return m;
}


// manager class for delivering tiles of a sheet of texture content
THREE.UVTileManager = function() {
	var tilesW = 4;
	var tilesH = 3;
	var maxUv = 1;

	this.getUVs = function(col, row) {

		var uvs = [
			new THREE.Vector2( (col / tilesW), (row / tilesH) ), // bottom left 0
			new THREE.Vector2( ((col + 1) / tilesW), (row / tilesH) ), // bottom right 1
			new THREE.Vector2( ((col + 1) / tilesW), ((row + 1) / tilesH) ), // top right 2
			new THREE.Vector2( (col / tilesW), ((row + 1) / tilesH) ) // top left 3				
		];

		return uvs;
	}
}
				
THREE.DataSmoother = function() {

	this.smoothed = 0;
	this.smoothing = 98;
	this.lastUpdate = new Date;

	this.smoothedValue = function( newValue ){
	  var now = new Date;
	  var elapsedTime = now - this.lastUpdate;
	  this.smoothed += elapsedTime * ( newValue - this.smoothed ) / this.smoothing;
	  this.lastUpdate = now;
	  return this.smoothed;
	}
}


var q = function(options, myVar, myDefault) {
	function isDefined(target, path) {
	    if (typeof target != 'object' || target == null) {
	        return false;
	    }

	    var parts = path.split('.');

	    while(parts.length) {
	        var branch = parts.shift();
	        if (!(branch in target)) {
	            return false;
	        }

	        target = target[branch];
	    }

	    return true;
	}
}

var def = function(variable, defaultValue) {
	if(typeof(variable) == 'undefined') {
		return defaultValue;
	} else {
		return variable;
	}
}
