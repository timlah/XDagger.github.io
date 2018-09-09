    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    var renderer, scene, camera, controls;
    var object, uniforms;
    var loader = new THREE.FontLoader();

    loader.load( '/assets/lib/threejs/helvetiker_bold.typeface.json', function ( font ) {
      init( font );
      animate();
    });

    function init( font ) {
      camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
      camera.position.z = 400;
      scene = new THREE.Scene();
      scene.background = new THREE.Color( 0x14141e );
      controls = new THREE.TrackballControls( camera );
      uniforms = {
        amplitude: { value: 5.0 },
        opacity:   { value: 0.1 },
        color:     { value: new THREE.Color( 0xffffff ) }
      };

      var shaderMaterial = new THREE.ShaderMaterial( {
        uniforms:       uniforms,
        vertexShader:   document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        //blending:       THREE.AdditiveBlending,
        depthTest:      false,
        transparent:    true
      });

      var geometry = new THREE.TextBufferGeometry( 'XDAG', {
        font: font,
        size: 50,
        height: 15,
        curveSegments: 10,
        bevelThickness: 5,
        bevelSize: 1.5,
        bevelEnabled: true,
        bevelSegments: 10,
      } );

      geometry.center();

      var count = geometry.attributes.position.count;
      var displacement = new THREE.Float32BufferAttribute( count * 3, 3 );

      geometry.addAttribute( 'displacement', displacement );

      var customColor = new THREE.Float32BufferAttribute( count * 3, 3 );

      geometry.addAttribute( 'customColor', customColor );

      var color = new THREE.Color( 0xffffff );

      for( var i = 0, l = customColor.count; i < l; i ++ ) {
        color.setHSL( 1, 0.5, 0.5 );
        color.toArray( customColor.array, i * customColor.itemSize );
      }

      object = new THREE.Line( geometry, shaderMaterial );
      object.rotation.x = 0.2;

      scene.add( object );

      renderer = new THREE.WebGLRenderer( { antialias: true } );
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( window.innerWidth, window.innerHeight );

      var container = document.getElementById( 'fold' );

      container.appendChild( renderer.domElement );

      window.addEventListener( 'resize', onWindowResize, false );
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function animate() {
      requestAnimationFrame( animate );
      controls.update();
      render();
    }

    function render() {
      var time = Date.now() * 0.001;
      object.rotation.y += 0.001;
      uniforms.amplitude.value = 1;
      uniforms.color.value.offsetHSL( 0.0005, 0, 0 );
      var attributes = object.geometry.attributes;
      var array = attributes.displacement.array;

      for ( var i = 0, l = array.length; i < l; i += 3 ) {
        array[ i     ] = 5 * ( 0.5 - Math.random() );
        array[ i + 1 ] = 5 * ( 0.5 - Math.random() );
        array[ i + 2 ] = 5 * ( 0.5 - Math.random() );
      }

      attributes.displacement.needsUpdate = true;
      renderer.render( scene, camera );
    }
