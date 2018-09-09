// instantiate a loader
var loader = new THREE.OBJLoader();

// load a resource
loader.load(
  // resource URL
  '/assets/objects/gpu.obj',
  // called when resource is loaded
  function ( object ) {
    init( object )
  },
  // called when loading is in progresses
  function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },
  // called when loading has errors
  function ( error ) {
    console.log( 'An error happened' );
  }
);

function createPointsFrom(object, min, max) {
  var points = [];

  points.push(new THREE.Vector4(84.2875, 52.3833, 24.8891, THREE.Math.randFloat(min, max)));
  points.push(new THREE.Vector4(74.2506, 42.3264, 24.8891, THREE.Math.randFloat(min, max)));
  points.push(new THREE.Vector4(66.6022, 30.2764, 24.8891, THREE.Math.randFloat(min, max)));
  points.push(new THREE.Vector4(61.7328, 16.6248, 24.8891, THREE.Math.randFloat(min, max)));

  for (let j = 0; j < object.children.length; j++) {
    var vertices = object.children[j].geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i = i + 3) {
      let x = vertices[i];
      let y = vertices[i+1];
      let z = vertices[i+2];

      points.push(new THREE.Vector4(x, y, z, THREE.Math.randFloat(min, max)));
    }
  }

  return points;
}

function init(object) {
  var root = new THREERoot({
    container: document.getElementById('threejs-scene')
  });
  root.renderer.setClearColor(0x14141e);
  root.camera.position.set(-200, -150, 400);
  root.controls.target.set(250, 50, 0);

  //var light = new THREE.PointLight(0xffffff, 4, 1000, 2);
  var light = new THREE.AmbientLight( 0xffffff );
  light.position.set(0, 400, 0);
  root.add(light);

  // A Catmull-Rom Spline defines a smooth line that goes through at least 4 points
  // this is different than a Bezier curve where the line never goes through the control points

  // the spline will have {{length}} points, each represented by a Vector4
  // we will use the x, y and z components for the position of the point
  // we will the w component for a 'pivot' distance from that point (translation applied before rotation)
  // the pivot distance will be interpolated the same way as the position
  var length;
  var points = createPointsFrom(object, 2, 4);
  var points2 = createPointsFrom(object, 50, 100);

  //var x, y, z, pivotDistance;

    //h = 0.45 + (0.3 * zeroOneZero(i / count));
    //s = THREE.Math.randFloat(0.6, 0.8);
    //l = THREE.Math.randFloat(0.5, 0.7);

  // pass the path definition to the animation
  var animationObject = new Animation({
    path: createPointsFrom(object, 4, 8),
    scale: 0.6,
    particles: 80000,
    color: {
      h: function(i, count) {
        return (i / count);
      },
      s: function() {
        return THREE.Math.randFloat(0.6, 0.9);
      },
      l: function() {
        return THREE.Math.randFloat(0.5, 0.7);
      }
    }
  });
  animationObject.animate(10.0, {ease: Power0.easeIn, repeat:-1});
  root.add(animationObject);

  var animationSurrounding = new Animation({
    path: createPointsFrom(object, 50, 100),
    scale: 0.35,
    particles: 20000,
    color: {
      h: function(i, count) {
        return 0.45 + (0.3 * utils.zeroOneZero(i / count));
      },
      s: function() {
        return THREE.Math.randFloat(0.5, 1);
      },
      l: function() {
        return THREE.Math.randFloat(0.1, 0.5);
      }
    }
  });

  animationSurrounding.animate(200.0, {ease: Power0.easeIn, repeat:-1});
  root.add(animationSurrounding);

  scrollListener.add(function(eventScrollY) {
    if (eventScrollY >= root.container.offsetHeight && root.ticking) {
      root.ticking = false;
      cancelAnimationFrame(root.tickID);
    } else if (eventScrollY < root.container.offsetHeight && !root.ticking) {
      root.ticking = true;
      root.tick();
    }
  });
}

////////////////////
// CLASSES
////////////////////

function Animation(params) {
  // each prefab is a tetrahedron
  var prefabGeometry = new THREE.TetrahedronGeometry(params.scale);
  var prefabCount = params.particles;

  // create the buffer geometry with all the prefabs
  var geometry = new THREE.BAS.PrefabBufferGeometry(prefabGeometry, prefabCount);

  // ANIMATION

  // the actual duration of the animation is controlled by Animation.animate
  // this duration can be set to any value
  // let's set it to 1.0 to keep it simple
  var totalDuration = this.totalDuration = 1.0;

  geometry.createAttribute('aDelayDuration', 2, function(data, i, count) {
    // calculating the delay based on index will spread the prefabs over the 'timeline'
    data[0] = i / count * totalDuration;
    // all prefabs have the same animation duration, so we could store it as a uniform instead
    // storing it as an attribute takes more memory,
    // but for the sake of this demo it's easier in case we want to give each prefab a different duration
    data[1] = totalDuration;
  });

  // PIVOT SCALE

  // give each prefab a random pivot scale, which will effect how far the prefab will pivot
  // relative to the pivot distance for each of the points in the path
  geometry.createAttribute('aPivotScale', 1, function(data) {
    data[0] = Math.random();
  });

  // ROTATION

  // each prefab will get a random axis and an angle around that axis
  var axis = new THREE.Vector3();
  var angle = 0;

  geometry.createAttribute('aAxisAngle', 4, function(data) {
    axis.x = THREE.Math.randFloatSpread(2);
    axis.y = THREE.Math.randFloatSpread(2);
    axis.z = THREE.Math.randFloatSpread(2);
    axis.normalize();

    angle = Math.PI * THREE.Math.randFloat(4, 8);

    data[0] = axis.x;
    data[1] = axis.y;
    data[2] = axis.z;
    data[3] = angle;
  });

  // COLOR

  // each prefab will get a psudo-random vertex color
  var color = new THREE.Color();
  var h, s, l;

  // we will use the built in VertexColors to give each prefab its own color
  // note you have to set Material.vertexColors to THREE.VertexColors for this to work
  geometry.createAttribute('color', 3, function(data, i, count) {
    // modulate the hue
    //h = 0.45 + (0.3 * zeroOneZero(i / count));
    //s = THREE.Math.randFloat(0.6, 0.8);
    //l = THREE.Math.randFloat(0.5, 0.7);

    h = params.color.h(i, count);
    s = params.color.s();
    l = params.color.l();

    color.setHSL(h, s, l);
    color.toArray(data);
  });

  var material = new THREE.BAS.PhongAnimationMaterial({
    //wireframe: tre
    shading: THREE.FlatShading,
    vertexColors: THREE.VertexColors,
    side: THREE.DoubleSide,
    // defines act as static, immutable values
    defines: {
      // we need integer representation of path length
      PATH_LENGTH: params.path.length,
      // we also need a max index float for the catmull-rom interpolation
      // adding .toFixed(1) will set value as {{length}}.0, which will identify it as a float
      PATH_MAX: (params.path.length - 1).toFixed(1)
    },
    uniforms: {
      uTime: {value: 0},
      // the path from the constructor (array of Vector4's)
      uPath: {value: params.path},
      // this is an optional argument for the spline interpolation function
      // 0.5, 0.5 is the default, 0.0, 0.0 will create a jagged spline, other values can make it go c r a z y
      uSmoothness: {value: new THREE.Vector2(0.2, 0.2)}
    },
    uniformValues: {
      specular: new THREE.Color(0xff0000),
      shininess: 20
    },
    vertexFunctions: [
      // catmull_rom_spline defines the catmullRomSpline and getCatmullRomSplineIndices functions used in the vertexPosition chunk
      // it also defines getCatmullRomSplineIndicesClosed, which is not used in this example
      THREE.BAS.ShaderChunk['catmull_rom_spline'],
      THREE.BAS.ShaderChunk['quaternion_rotation']
    ],
    // note we do not have to define 'color' as a uniform because THREE.js will do this for us
    // trying to define it here will throw a duplicate declaration error
    vertexParameters: [
      'uniform float uTime;',
      // this is how you define an array in glsl
      // you need both a type and a length
      // the length cannot be dynamic, and must be set at compile time
      // here the length will be replaced by the define above
      'uniform vec4 uPath[PATH_LENGTH];',
      'uniform vec2 uSmoothness;',

      'attribute vec2 aDelayDuration;',
      'attribute float aPivotScale;',
      'attribute vec4 aAxisAngle;'
    ],
    vertexInit: [
      // tProgress is in range 0.0 to 1.0
      // we want each prefab to restart at 0.0 if the progress is < 1.0, creating a continuous motion
      // the delay is added to the time uniform to spread the prefabs over the path
      'float tProgress = mod((uTime + aDelayDuration.x), aDelayDuration.y) / aDelayDuration.y;',

      'vec4 tQuat = quatFromAxisAngle(aAxisAngle.xyz, aAxisAngle.w * tProgress);'
    ],
    vertexPosition: [
      // getting the progress along the spline is more involved than a bezier curve

      // first we need get the progress relative to the path length
      'float pathProgress = tProgress * PATH_MAX;',
      // getCatmullRomSplineIndices returns an integer vector with 4 indices based on pathProgress
      'ivec4 indices = getCatmullRomSplineIndices(PATH_MAX, pathProgress);',
      // use these indices to get the four points that will influence the position
      'vec4 p0 = uPath[indices[0]];', // max(0, floor(pathProgress) - 1)
      'vec4 p1 = uPath[indices[1]];', // floor(pathProgress)
      'vec4 p2 = uPath[indices[2]];', // min(length, floor(pathProgress) + 1)
      'vec4 p3 = uPath[indices[3]];', // min(length, floor(pathProgress) + 2)

      // we only care about the fractal part of the pathProgress float (what comes after the .)
      'float pathProgressFract = fract(pathProgress);',

      // get the pivot distance by using catmull-rom interpolation on the fourth component of the vector (w)
      // each prefab has its own pivotScale, which we use to spread them out
      // this translation is performed BEFORE the rotation
      'transformed += catmullRomSpline(p0.w, p1.w, p2.w, p3.w, pathProgressFract) * aPivotScale;',

      // rotate the vertex
      'transformed = rotateVector(tQuat, transformed);',

      // finally add the actual spline position
      // uSmoothness is an optional argument that controls how the spline looks.
      'transformed += catmullRomSpline(p0.xyz, p1.xyz, p2.xyz, p3.xyz, pathProgressFract, uSmoothness);'
    ]
  });

  THREE.Mesh.call(this, geometry, material);

  this.frustumCulled = false;
}
Animation.prototype = Object.create(THREE.Mesh.prototype);
Animation.prototype.constructor = Animation;
Object.defineProperty(Animation.prototype, 'time', {
  get: function () {
    return this.material.uniforms['uTime'].value;
  },
  set: function (v) {
    this.material.uniforms['uTime'].value = v;
  }
});

Animation.prototype.animate = function (duration, options) {
  options = options || {};
  options.time = this.totalDuration;

  return TweenMax.fromTo(this, duration, {time: 0.0}, options);
};

function PointHelper(color, size, position) {
  THREE.Mesh.call(this,
    new THREE.SphereGeometry(size || 1.0, 8, 8),
    new THREE.MeshBasicMaterial({
      color: color || 0xff0000,
      wireframe: true,
      depthWrite: false,
      depthTest: false
    })
  );

  position && this.position.copy(position);
}
PointHelper.prototype = Object.create(THREE.Mesh.prototype);
PointHelper.prototype.constructor = PointHelper;

function LineHelper(points, params) {
  var g = new THREE.Geometry();
  var m = new THREE.LineBasicMaterial(params);

  g.vertices = points;

  THREE.Line.call(this, g, m);
}
LineHelper.prototype = Object.create(THREE.Line.prototype);
LineHelper.prototype.constructor = LineHelper;
