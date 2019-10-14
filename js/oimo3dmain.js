document.addEventListener('DOMContentLoaded',function(){

    var step = 0;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight , 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({antialias:true});

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    //renderer.setClearColor(0xEEEEEE);
    renderer.setSize(window.innerWidth, window.innerHeight);
    var axes = new THREE.AxesHelper(20);
    scene.add(axes);
    var planeGeometry = new THREE.PlaneGeometry(60,20,1,1);
    var planeMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc});
    var plane = new THREE.Mesh(planeGeometry,planeMaterial);
    plane.rotation.x=-0.5*Math.PI;
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = 0;
    scene.add(plane);
    var cubeGeometry = new THREE.CubeGeometry(4,4,4);
    var cubeMaterial = new THREE.MeshLambertMaterial (
        {color: 0xff0000});
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    //cube.position.x = -4;
    cube.position.y = 3;
    cube.position.z = 0;
    cube.rotation.y = 10;
    scene.add(cube);
    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 30;
    camera.lookAt(scene.position);

    scene.add(new THREE.AmbientLight(0x404040, 1));

    var pointLight = new THREE.PointLight(0xffffff,1);
    pointLight.position.copy(camera.position);
    pointLight.castShadow = true;
    scene.add(pointLight);

    document.querySelector(".mainContainer").appendChild(renderer.domElement);
    renderScene();

    function renderScene() {
        requestAnimationFrame(renderScene);
        renderer.render(scene, camera);
    }

});
