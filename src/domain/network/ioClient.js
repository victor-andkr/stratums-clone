'use strict';

// WebSocket client for Stratums.io
// Based on the bundle-deobf.js structure

const msgpack = require('../../shared/utils/msgpack');

class IOClient {
  constructor(url) {
    this.url = url || window.socketURL;
    this.ws = null;
    this.connected = false;
    this.packetHandlers = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(this.url);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      console.log('WebSocket connected to', this.url);
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit('connect');
    };

    this.ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        const data = new Uint8Array(event.data);
        this.handleMessage(data);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.connected = false;
      this.emit('disconnect');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('reconnectFailed');
    }
  }

  send(packetType, data) {
    if (!this.connected || !this.ws) {
      console.warn('Cannot send packet: not connected');
      return;
    }

    try {
      const packet = [packetType, data];
      const encoded = msgpack.encode(packet);
      this.ws.send(encoded);
    } catch (error) {
      console.error('Error sending packet:', error);
    }
  }

  handleMessage(data) {
    try {
      const decoded = msgpack.decode(data);
      if (Array.isArray(decoded) && decoded.length >= 2) {
        const packetType = decoded[0];
        const packetData = decoded[1];
        this.handlePacket(packetType, packetData);
      }
    } catch (error) {
      console.error('Error decoding packet:', error);
    }
  }

  handlePacket(packetType, data) {
    const handler = this.packetHandlers[packetType];
    if (handler) {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in packet handler for', packetType, ':', error);
      }
    } else {
      console.warn('No handler for packet type:', packetType);
    }
  }

  on(packetType, handler) {
    this.packetHandlers[packetType] = handler;
  }

  off(packetType) {
    delete this.packetHandlers[packetType];
  }

  emit(event, data) {
    const handler = this.packetHandlers[event];
    if (handler) {
      handler(data);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }
}

// Create singleton instance
let ioClientInstance = null;

function getIOClient(url) {
  if (!ioClientInstance) {
    ioClientInstance = new IOClient(url);
  }
  return ioClientInstance;
}

module.exports = {
  IOClient,
  ioClient: getIOClient(),
  getIOClient
};
