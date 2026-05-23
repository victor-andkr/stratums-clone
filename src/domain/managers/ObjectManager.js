'use strict';

// ObjectManager for managing game objects
// Based on Stratums.io bundle structure

const GameObject = require('../entities/GameObject');

class ObjectManager {
  constructor() {
    this.objects = [];
    this.activeCount = 0;
  }

  add(sid, x, y, dir, scale, type, props, owner) {
    let obj = null;
    
    // Try to find inactive object with same sid
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].sid === sid) {
        obj = this.objects[i];
        break;
      }
    }

    // If not found, try to find inactive slot
    if (!obj) {
      for (let i = 0; i < this.objects.length; i++) {
        if (!this.objects[i].active) {
          obj = this.objects[i];
          break;
        }
      }
    }

    // Create new object if needed
    if (!obj) {
      obj = new GameObject(sid);
      this.objects.push(obj);
    }

    obj.init(x, y, dir, scale, type, props, owner);
    this.updateActiveCount();
    
    return obj;
  }

  disableBySid(sid) {
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].sid === sid) {
        this.disableObj(this.objects[i]);
        break;
      }
    }
  }

  disableObj(obj) {
    obj.active = false;
    this.updateActiveCount();
  }

  removeAllItems(ownerSid) {
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].active && this.objects[i].owner?.sid === ownerSid) {
        this.disableObj(this.objects[i]);
      }
    }
  }

  update(dt) {
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].active) {
        this.objects[i].update(dt);
      }
    }
  }

  updateActiveCount() {
    this.activeCount = 0;
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].active) {
        this.activeCount++;
      }
    }
  }

  getBySid(sid) {
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].sid === sid && this.objects[i].active) {
        return this.objects[i];
      }
    }
    return null;
  }

  getAllActive() {
    return this.objects.filter(obj => obj.active);
  }

  clear() {
    this.objects = [];
    this.activeCount = 0;
  }
}

module.exports = ObjectManager;
