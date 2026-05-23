'use strict';

// AI class extracted from Stratums.io bundle-deobf.js (class aN)

class AI {
  constructor(sid) {
    this.sid = sid;
    this.isAI = true;
    this.nameIndex = 0;
    this.timerCount = 0;
    this.tmpRatio = 0;
    this.targetAngle = 0;
    this.animTime = this.animSpeed = 0;
    this.targetAngle = 0;
    this.tmpRatio = 0;
    this.animIndex = 0;
    this.spawnCounter = 0;
    this.lockMove = false;
    this.x = -1;
    this.y = -1;
    this.startX = null;
    this.startY = null;
    this.xVel = 0;
    this.yVel = 0;
    this.zIndex = 0;
    this.dir = 0;
    this.dirPlus = 0;
    this.index = 0;
    this.src = "";
    this.name = "";
    this.speed = NaN;
    this.turnSpeed = NaN;
    this.scale = 0;
    this.health = this.maxHealth = 100;
    this.dmg = 0;
    this.spriteMlt = 0;
    this.nameScale = 0;
    this.active = false;
    this.alive = false;
  }

  init(x, y, dir, index, aiType) {
    this.x = x;
    this.y = y;
    this.xVel = 0;
    this.yVel = 0;
    this.zIndex = 0;
    this.dir = dir;
    this.dirPlus = 0;
    this.index = index;
    this.src = aiType.src;
    if (aiType.name) {
      this.name = aiType.name;
    }
    this.speed = aiType.speed;
    this.turnSpeed = aiType.turnSpeed;
    this.scale = aiType.scale;
    this.maxHealth = aiType.health;
    this.health = this.maxHealth;
    this.dmg = aiType.dmg;
    this.spriteMlt = aiType.spriteMlt;
    this.nameScale = aiType.nameScale;
    this.active = true;
    this.alive = true;
  }

  animate(dt) {
    if (this.animTime) {
      this.animTime -= dt;
      if (this.animTime <= 0) {
        this.animTime = 0;
        this.dirPlus = 0;
        this.tmpRatio = 0;
        this.animIndex = 0;
      } else if (this.animIndex == 0) {
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

  startAnim() {
    this.animTime = this.animSpeed = 600;
    this.targetAngle = Math.PI * 0.8;
    this.tmpRatio = 0;
    this.animIndex = 0;
  }

  lerpAngle(start, end, amount) {
    return start + (end - start) * amount;
  }
}

module.exports = AI;
