const { ccclass } = cc._decorator;

@ccclass
export default class Ship extends cc.Component {
  onCollisionEnter(other: cc.BoxCollider, self: cc.BoxCollider) {
    this.node.emit('onCollision');
  }
}