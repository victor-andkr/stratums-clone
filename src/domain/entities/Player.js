'use strict';

// Player class extracted from Stratums.io bundle-deobf.js (class aK)

class Player {
  constructor(id, sid) {
    this.wood = 0;
    this.stone = 0;
    this.points = 0;
    this.food = 0;
    this.kills = 0;
    this.name = "";
    this.skin = null;
    this.tail = null;
    this.active = true;
    this.alive = true;
    this.lockMove = false;
    this.lockDir = false;
    this.minimapCounter = 0;
    this.chatCountdown = 0;
    this.shameCount = 0;
    this.shameTimer = 0;
    this.gathering = 0;
    this.autoGather = 0;
    this.animTime = 0;
    this.animSpeed = 0;
    this.mouseState = 0;
    this.buildIndex = -1;
    this.weaponIndex = 0;
    this.noMovTimer = 0;
    this.maxXP = 300;
    this.XP = 0;
    this.age = 1;
    this.kills = 0;
    this.upgrAge = 2;
    this.upgradePoints = 0;
    this.x = 0;
    this.y = 0;
    this.zIndex = 0;
    this.xVel = 0;
    this.yVel = 0;
    this.dir = 0;
    this.dirPlus = 0;
    this.targetAngle = 0;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.scale = 35;
    this.speed = 0.0016;
    this.items = [0, 3, 6, 10];
    this.weapons = [0];
    this.id = id;
    this.sid = sid;
    this.team = null;
    this.skinIndex = 0;
    this.tailIndex = 0;
    this.hitTime = 0;
    this.tails = {};
    this.skins = {};
    this.dt = 0;
    this.hidden = false;
    this.itemCounts = {};
    this.skinRot = 0;
    this.iconIndex = 0;
    this.skinColor = 0;
    this.animIndex = this.tmpRatio = 0;
  }

  setData(data) {
    this.id = data[0];
    this.sid = data[1];
    this.name = data[2];
    this.x = data[3];
    this.y = data[4];
    this.dir = data[5];
    this.health = data[6];
    this.maxHealth = data[7];
    this.scale = data[8];
    this.skinColor = data[9];
  }

  spawn() {
    this.active = true;
    this.alive = true;
    this.lockMove = false;
    this.lockDir = false;
    this.minimapCounter = 0;
    this.chatCountdown = 0;
    this.shameCount = 0;
    this.shameTimer = 0;
    this.gathering = 0;
    this.autoGather = 0;
    this.animTime = 0;
    this.animSpeed = 0;
    this.mouseState = 0;
    this.buildIndex = -1;
    this.weaponIndex = 0;
    this.noMovTimer = 0;
    this.maxXP = 300;
    this.XP = 0;
    this.age = 1;
    this.kills = 0;
    this.upgrAge = 2;
    this.upgradePoints = 0;
    this.x = 0;
    this.y = 0;
    this.zIndex = 0;
    this.xVel = 0;
    this.yVel = 0;
    this.dir = 0;
    this.dirPlus = 0;
    this.targetAngle = 0;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.scale = 35;
    this.speed = 0.0016;
    this.items = [0, 3, 6, 10];
    this.weapons = [0];
  }

  animate(dt) {
    if (this.animTime) {
      if ((this.animTime -= dt) <= 0) {
        this.animTime = 0;
        this.dirPlus = 0;
        this.tmpRatio = 0;
        this.animIndex = 0;
      } else {
        if (this.animIndex === 0) {
          this.tmpRatio += dt / (this.animSpeed * 0.25);
          this.dirPlus = this.lerpAngle(0, this.targetAngle, Math.min(1, this.tmpRatio));
          if (this.tmpRatio >= 1) {
            this.tmpRatio = 1;
            this.animIndex = 1;
          }
        } else {
          this.tmpRatio -= dt / (this.animSpeed * (1 - 0.25));
          this.dirPlus = this.lerpAngle(0, this.targetAngle, Math.max(0, this.tmpRatio));
        }
      }
    }
  }

  startAnim(forward, weaponSpeed) {
    this.animTime = this.animSpeed = weaponSpeed;
    this.targetAngle = forward ? -Math.PI / 2 : -Math.PI;
    this.tmpRatio = 0;
    this.animIndex = 0;
  }

  lerpAngle(start, end, amount) {
    return start + (end - start) * amount;
  }
}

module.exports = Player;
