document.addEventListener('DOMContentLoaded',function(){



    var Render = function(){
        this.step = 0;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight , 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({antialias:true});

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        var axes = new THREE.AxesHelper(20);
        var planeGeometry = new THREE.PlaneGeometry(60,30,1,1);
        var planeMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc});

        var plane = new THREE.Mesh(planeGeometry,planeMaterial);
        plane.position.x = 15;
        plane.position.y = 0;
        plane.position.z = 0;

        var cube1g = new THREE.CubeGeometry(6,6,6);
        var cube1m = new THREE.MeshLambertMaterial (
            {color: 0xe05421});
        this.obstacle = new THREE.Mesh(cube1g,cube1m);

        var cubeGeometry = new THREE.CubeGeometry(4,2,1);
        var cubeMaterial = new THREE.MeshLambertMaterial (
            {color: 0xff0000});
        this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        this.cube.position.x = 3;
        this.cube.position.y = 2;

        this.scene.add(this.cube);
        this.scene.add(plane);
        this.scene.add(this.obstacle);
        this.scene.add(axes);

        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 50;
        this.camera.lookAt(this.scene.position);

        this.scene.add(new THREE.AmbientLight(0x404040, 1));

        var pointLight = new THREE.PointLight(0xffffff,1);
        pointLight.position.copy(this.camera.position);
        pointLight.castShadow = true;
        this.scene.add(pointLight);

        document.querySelector(".mainContainer").appendChild(this.renderer.domElement);

        this.getRenderer = function (){
            return this.renderer;
        }
        this.getScene = function (){
            return this.scene;
        }
        this.getCamera = function (){
            return this.camera;
        }

    };

    var RenderMovement = function (render){
        var self = this;
        self.render = render;
        self.renderer = render.getRenderer();
        self.camera = render.getCamera();
        self.scene = render.getScene();
        self.accelerationAddition = 0;
        self.turnAccelRight = 0;
        self.turnAccelLeft = 0;
        self.angle = 0;

        this.renderScene = function (){

            function makeCloseToZero (value,threshold){

                if (value > 0) {
                     value = value - threshold;
                    if (value < threshold) value = 0;
                }

                if (value < 0) {
                    value = value + threshold;
                    if (value > threshold) value = 0;
                }
                return value;
            }

            var currentCarAcceleration = playerCarData.getAcceleration();
            var onTurnLeft = playerCarData.getOnTurnLeft();
            var onTurnRight = playerCarData.getOnTurnRight();


            if (onTurnRight) {
                self.turnAccelRight += 0.05;
                self.turnAccelRight = Math.min (0.1,self.turnAccelRight);
            }

            if (onTurnLeft) {
                self.turnAccelLeft += 0.05;
                self.turnAccelLeft = Math.min (0.1,self.turnAccelLeft);
            }

            self.turnAccelRight = makeCloseToZero(self.turnAccelRight, 0.01);
            self.turnAccelLeft = makeCloseToZero(self.turnAccelLeft, 0.01);

            self.angle += (self.turnAccelLeft-self.turnAccelRight);
            playerCarData.setAngle(self.angle);

            if (playerCarData.getOnAccelerate()) {
                self.accelerationAddition = self.accelerationAddition + 0.01;
            }
            if (playerCarData.getOnBreak()) {
                self.accelerationAddition = self.accelerationAddition - 0.01;
            }

            self.accelerationAddition = makeCloseToZero(self.accelerationAddition,0.003);
            if (self.accelerationAddition > 1) self.accelerationAddition = 1;

            playerCarData.setAcceleration(self.accelerationAddition);
            playerCarData.setX (playerCarData.getX() + playerCarData.getAcceleration() * Math.cos(playerCarData.getAngle()));
            playerCarData.setY (playerCarData.getY() + playerCarData.getAcceleration() * Math.sin(playerCarData.getAngle()));
            console.log ('getX:'+playerCarData.getX());
            console.log ('getY:'+playerCarData.getY());
            console.log ('angle:'+playerCarData.getAngle());
            self.render.cube.position.x = playerCarData.getX();
            self.render.cube.position.y = playerCarData.getY();
            self.render.cube.rotation.z = (self.angle);

            self.camera.position.x = playerCarData.getX()+7;
            self.camera.position.y = playerCarData.getY()+7;

            //self.camera.lookAt (playerCarData.getX, playerCarData.getY(), 0);
            requestAnimationFrame(self.renderScene);
            self.renderer.render(self.scene,self.camera);
        };
        this.renderScene();
    };

    var CarCoordinates = function (){

        this._x = 0;
        this._y = 0;
        this._z = 0;
        this._angle = 0;
        this._acceleration = 0;
        this._onAccelerate = false;
        this._onBreak = false;
        this._onTurnRight = false;
        this._onTurnLeft = false;

        this.setX = function (x){
            this._x = x;
        };
        this.setY = function (y){
            this._y = y;
        };
        this.setZ = function (z){
            this._z = z;
        };

        this.getX = function(){
            return this._x;
        };
        this.getY = function(){
            return this._y;
        };
        this.getZ = function(){
            return this._z;
        };

        this.setAcceleration = function(acceleration){
            this._acceleration = acceleration;
        };

        this.getAcceleration = function(){
            return (this._acceleration);
        };

        this.setOnAccelerate = function (onAccelerate){
            this._onAccelerate = onAccelerate;
        };

        this.setOnBreak = function (onBreak){
            this._onBreak = onBreak;
        };

        this.getOnAccelerate = function (){
            return this._onAccelerate;
        }

        this.getOnBreak = function (){
            return this._onBreak;
        }
        this.setOnTurnLeft = function(onTurnLeft){
            this._onTurnLeft = onTurnLeft;
        }
        this.getOnTurnLeft = function (){
            return this._onTurnLeft;
        }
        this.setOnTurnRight = function(onTurnRight){
            this._onTurnRight = onTurnRight;
        }
        this.getOnTurnRight = function (){
            return this._onTurnRight;
        }

        this.getAngle = function (){
            return this._angle;
        }
        this.setAngle = function (angle){
            this._angle = angle;
        }
    };



    var InputReader = function (){

        this.readInputUp = function(event){
            switch (event.keyCode) {
                // UP (accelerate)
                case 38:
                    playerCarData.setOnAccelerate(true);
                    break;
                // DOWN (breaks)
                case 40:
                    playerCarData.setOnBreak(true);
                    break;
                // RIGHT
                case 39 :
                    playerCarData.setOnTurnRight(true);
                    break;
                case 37:
                    playerCarData.setOnTurnLeft(true);
                    break;
            }
        }

        this.readInputDown = function(event){
            switch (event.keyCode) {
                // UP (accelerate)
                case 38:
                    playerCarData.setOnAccelerate(false);
                    break;
                // DOWN (breaks)
                case 40:
                    playerCarData.setOnBreak(false);
                    break;
                // RIGHT
                case 39 :
                    playerCarData.setOnTurnRight(false);
                    break;
                case 37:
                    playerCarData.setOnTurnLeft(false);
                    break;
            }
        }

        document.addEventListener('keydown',this.readInputUp);
        document.addEventListener('keyup',this.readInputDown);
    };

    function animate (){

    }

    var playerCarData = new CarCoordinates();
    var render = new Render();
    var renderMovement = new RenderMovement(render);
    var inputReader = new InputReader();

});
