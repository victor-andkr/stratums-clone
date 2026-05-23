'use strict';

// GameObject class extracted from Stratums.io bundle-deobf.js (class aM)

class GameObject {
  constructor(sid) {
    this.sid = sid;
    this.active = true;
    this.x = 0;
    this.y = 0;
    this.dir = 0;
    this.xWiggle = 0;
    this.yWiggle = 0;
    this.scale = 0;
    this.type = 0;
    this.id = 0;
    this.owner = null;
    this.name = "";
    this.isItem = this.id != undefined;
    this.group = {};
    this.health = 100;
    this.layer = 0;
    this.blocker = 0;
    this.hideFromEnemy = 0;
    this.dmg = 0;
    this.zIndex = 0;
    this.turnSpeed = 0;
    this.req = 0;
    this.projectile = 0;
  }

  init(x, y, dir, scale, type, props = {}, owner = null) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.xWiggle = 0;
    this.yWiggle = 0;
    this.scale = scale;
    this.type = type;
    this.id = props.id;
    this.owner = owner;
    this.name = props.name;
    this.isItem = this.id != undefined;
    this.group = props.group;
    this.health = props.health;
    this.layer = 2;
    if (this.group != undefined) {
      this.layer = this.group.layer;
    } else if (this.type == 0) {
      this.layer = 3;
    } else if (this.type == 2) {
      this.layer = 0;
    } else if (this.type == 4) {
      this.layer = -1;
    }
    this.blocker = props.blocker;
    this.hideFromEnemy = props.hideFromEnemy;
    this.dmg = props.dmg;
    this.zIndex = props.zIndex || 0;
    this.turnSpeed = props.turnSpeed;
    this.req = props.req;
    this.projectile = props.projectile;
  }

  update(dt) {
    if (this.active) {
      if (this.xWiggle) {
        this.xWiggle *= Math.pow(0.99, dt);
      }
      if (this.yWiggle) {
        this.yWiggle *= Math.pow(0.99, dt);
      }
      if (this.turnSpeed) {
        this.dir += this.turnSpeed * dt;
      }
    }
  }
}

module.exports = GameObject;
