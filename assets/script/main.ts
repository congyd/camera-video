import camera, { CameraCapacity } from '@byted-creative/camera';
import face, { FaceDebug, FaceEvent, FaceInfo } from '@byted-creative/camera-face';
import { CameraCocosLayer } from "@byted-creative/camera-cocos-layer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    @property(cc.Node)
    cameraNode: cc.Node = null;

    @property(cc.Node)
    colunms: cc.Node[] = [];

    @property(cc.Node)
    column: cc.Node = null;

    @property(cc.Node)
    ship: cc.Node = null;

    @property(cc.Node)
    dialog: cc.Node = null;

    onLoad(){
        const colliderMgr = cc.director.getCollisionManager();
        colliderMgr.enabled = true;
    }

    private _startFlag = false;
    private _score = 0;

    get score(){
        return this._score;
      }
    
      set score(value){
        this._score = value;
    
        const label = this.dialog.getChildByName('scoreLabel').getComponent(cc.Label);
        label.string = this._score.toFixed(0);
      }
    

    async start () {
        await this.initCamera();
        this.startGame();
    }

    private _curShipIndex = 0;
    private _shipPosCache = [];
    private readonly MAX_SHIP_POS = 9;

    update(dt){

        const SPEED = 8;

        this._curShipIndex = (this._curShipIndex + 1) % this.MAX_SHIP_POS;
        this._shipPosCache[this._curShipIndex] = this.ship.position.y;
    
        if(!this._startFlag){
          return;
        }
    
        for(let i = 0; i < this.colunms.length; i ++){
    
          if(this.colunms[i].position.x > - 215 && this.colunms[i].position.x - SPEED < - 215){
            this.score ++;
          }
    
          if(this.colunms[i].position.x < - 500){
            const otherIndex = (i + 1) % 2;
            this.colunms[i].setPosition(this.colunms[otherIndex].position.x + 470, this.colunms[i].position.y); 
            this.resetColunmPosition(this.colunms[i]);
          }
    
          this.colunms[i].setPosition(this.colunms[i].position.x - SPEED, this.colunms[i].position.y);
    
        }
    
        // ship 角度
        const lastIndex = (this._curShipIndex + 1) % this.MAX_SHIP_POS;
    
        const deltaY = this.ship.position.y - this._shipPosCache[lastIndex];
        const deltaX = this.ship.width;
    
        const l = Math.sqrt(deltaY * deltaY + deltaX * deltaX);
    
        const angle = - Math.acos(deltaY / l) / (Math.PI / 180) + 90;
        this.ship.angle = angle;
    
    }

    private startGame(){

        this.dialog.active = false;
    
        this.score = 0;
    
        face.on(FaceEvent.onFaceInfos, this.onFaceInfos, this);
    
        this.colunms[0].setPosition(115,0);
        this.colunms[1].setPosition(653,0);
        this.colunms.forEach(element => {
          this.resetColunmPosition(element);
        });

        this.ship.on('onCollision', this.onCollision, this);
    
        this._startFlag = true;
    
    }

    private stopGame(){

        face.off(FaceEvent.onFaceInfos, this.onFaceInfos, this);
    
        this.ship.off('onCollision', this.onCollision, this);
        this._startFlag = false;
    
        this.dialog.active = true;   
    
    }

    onCollision(){
        console.log('onCollision');
        this.stopGame();
    }

    private _layer;

    // 初始化
    private async initCamera() {

        this._layer = new CameraCocosLayer({ root: this.cameraNode });
        // 初始化摄像头
        camera.init({
        layerAdapter: this._layer,
        capacity: [CameraCapacity.Face],
        });
        try {
            await camera.start();

            // 设置美颜
            camera.setBeauty({ 
                whiten: 0.5, 
                smoothen: 0.5,
                enlargeEye: 0.5, 
                slimFace: 0.5,
            });

            face.init({interval: 30});
            face.startDetect();

            // face.debugEnable(FaceDebug.Box);
            // face.debugEnable(FaceDebug.Face);

        } catch (err) {
        console.log('camera start fail', err);
        }
    }

    private resetColunmPosition(node: cc.Node){

        const r = Math.random() * 360 - 180;
        node.setPosition(node.position.x, r);
    
    }

    private onFaceInfos(faceInfos: FaceInfo[]){

        if(faceInfos.length === 0){
          return;
        }
    
        const faceInfo = faceInfos[0];
        this.ship.setPosition(this.ship.position.x, faceInfo.nose[13].y);

    }
}
