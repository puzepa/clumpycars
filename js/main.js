document.addEventListener('DOMContentLoaded',function(){

    var OnSocket = function (msg){
        this.receive = function (msg){

            if (msg){
                var receivedData = JSON.parse(msg)
                if (Array.isArray(receivedData)){

                    receivedData.forEach(function(currentElement){
                        var carId = currentElement.id;
                        var x = currentElement.x;
                        var y = currentElement.y;
                        var angle = currentElement.a;
                        if (!connectionIds.includes(carId)) {
                            connectionIds.push(carId);
                            connectionIds[carId] = new CarControl();
                        } else {
                            connectionIds[carId].setData({id:carId,x:x,y:y,angle:angle});
                        }
                    });

                } else {

                    var carId = receivedData.id;
                    var x = receivedData.x;
                    var y = receivedData.y;
                    var angle = receivedData.a;

                    if (firstConnect) {
                        console.log ('first!');
                        myCarId = receivedData.id;
                        var dataSender = new SendGameInfo();
                        firstConnect = false;
                    }
                }
            }
        }
    };

    var ConnectedCars = function (id){
        this.cars = [];

        this.isCarConnected = function (){
            return (this.cars.includes(id));
        }
    };

    var CarControl = function (){

        console.log ('carRender');

        this.carNode = document.createElement('div');
        this.carNode.classList.add('carContainer');
        mainParentNode.appendChild(this.carNode);

        this.setData = function (args){
            if (args){
                this._id = args.id;
                this._x = args.x;
                this._y = args.y;
                this._angle = args.angle;
                this.carNode.style.top = this._x;
                this.carNode.style.left = this._y;
                this.carNode.style.transform = 'rotate(' + this._angle + 'deg)';
            }
        }
    }

    var WS = function (args){
        var sock = this.socket = new WebSocket("ws://104.248.36.253:8080");

        if(args){
            this.action = args.action || '';
            this.message = args.message || '';
        }

        sock.onopen = function() {
            console.log ('Connection established');
        };

        this.sendMsg = function (message) {
            sock.send(message);
        };

        sock.onclose = function(event) {
            if (event.wasClean) {
                console.log('Соединение закрыто чисто');
            } else {
                console.log('Обрыв соединения'); // например, "убит" процесс сервера
            }
            console.log('Код: ' + event.code + ' причина: ' + event.reason);
        };

        sock.onmessage = function(event) {
            _onSocket.receive(event.data);
        };
        sock.onerror = function(error) {
            console.log("Ошибка " + error.message);
        };

    };

    var SendGameInfo = function (){

        setInterval(function(){
            var msg = {
                id:myCarId,
                x:Math.floor(cRCoordX),
                y:Math.floor(cRCoordY),
                a:Math.floor(cRDirection)
            };
            webSock.sendMsg(JSON.stringify(msg));
        }, 30)
    };

    var SendMessageNode = function (){
        this.inputContainer = document.createElement('div');
        this.inputContainer.classList.add('mainTextInput');

        this.submitNode = document.createElement('div');
        this.submitNode.classList.add('inputSubmit');
        this.submitNode.innerHTML = 'Submit message';
        var iNode = this.inputNode = document.createElement('input');
        this.inputContainer.appendChild(this.submitNode);
        this.inputContainer.appendChild(this.inputNode);

        this.submitNode.addEventListener('click',function(){
            webSock.sendMsg({message:iNode.value});
            });

        document.querySelector('.mainContainer').appendChild(this.inputContainer);

    };


    function readInputUp(event){
            switch (event.keyCode) {
                // UP (accelerate)
                case 38:
                    onAccelerate = true;
                    break;
                // DOWN (breaks)
                case 40:
                    onBreak = true;
                    break;
                // RIGHT 
                case 39 :
                    onTurnRight = true;
                    break;
                case 37:
                    onTurnLeft = true;
                    break;
            }
    }
    
    function readInputDown(event){
            switch (event.keyCode) {
                // UP (accelerate)
                case 38:
                    onAccelerate = false;
                    break;
                // DOWN (breaks)
                case 40:
                    onBreak = false;
                    break;
                // RIGHT 
                case 39 :
                    onTurnRight = false;
                    break;
                case 37:
                    onTurnLeft = false;
                    break;
            }
    }

    function run(){
        setInterval(function(){
            cRAcceleration += onAccelerate ? 0.02 : (cRAcceleration > 0 ? -0.01 : 0.01);
            if (cRAcceleration < 0.005 && cRAcceleration > -0.005) cRAcceleration = 0;
            if (cRAcceleration)
            cRAcceleration += onBreak ? -0.1 : 0;
            carNode.style.top = cRCoordX;
            carNode.style.left = cRCoordY;
			cRAcceleration = cRAcceleration > 2?2:cRAcceleration;

            //turnAccelLeft

            cRDirection += (turnAccelRight-turnAccelLeft);
            if (!onTurnRight) {
                (turnAccelRight > 0.01) ? turnAccelRight-=0.08 : turnAccelRight = 0;
            } else {
                if (turnAccelRight < 2){
                    turnAccelRight += 0.05
                } else turnAccelRight = 2
            }

            if (!onTurnLeft) {
                (turnAccelLeft > 0.01) ? turnAccelLeft-=0.08 : turnAccelLeft = 0;
            } else {
                if (turnAccelLeft < 2){
                    turnAccelLeft += 0.05
                } else turnAccelLeft = 2
            }
            cRCoordX += cRAcceleration * Math.sin(cRDirection * Math.PI / 180);
            cRCoordY += cRAcceleration * Math.cos(cRDirection * Math.PI / 180);
			
            carNode.style.transform = 'rotate(' + cRDirection + 'deg)';
        },10);
    }
    var firstConnect = true;
    var myCarId = '';
    var cRDirection = 0; //angle of moving
    var cRAcceleration = 0; //acceleration ratio
    var cRCoordX = 0; // x
    var cRCoordY = 0; // y

    var onAccelerate = false,
        onBreak = false,
        onTurnLeft = false,
        onTurnRight = false,
		turnAccelRight = 0,
        turnAccelLeft = 0;
    var connectionIds = [];


    var mainParentNode = document.querySelector('.mainContainer');
    var carNode = document.createElement('div');
    carNode.classList.add('carContainer');
    mainParentNode.appendChild(carNode);
    
    document.addEventListener('keydown',readInputUp);
    document.addEventListener('keyup',readInputDown);

    run();

    var webSock = new WS();
    var _onSocket = new OnSocket();
    var messageNode = new SendMessageNode();

});

