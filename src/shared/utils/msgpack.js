'use strict';

// Msgpack serialization/deserialization extracted from Stratums.io bundle-deobf.js (a3)

const Math_abs = Math.abs;
const Math_floor = Math.floor;
const MAX_UINT32 = 4294967296;
const Array_isArray = Array.isArray;

const bufferState = {
  length: 0,
  floatBuffer: null,
  floatView: undefined
};

function resetBuffer() {
  bufferState.length = 0;
  bufferState.floatBuffer = null;
  return bufferState.floatView = undefined;
}

const typeHandlers = new Map([
  ["undefined", (val, buffer) => writeByte(192, buffer)],
  ["boolean", (val, buffer) => writeByte(val ? 195 : 194, buffer)],
  ["number", (val, buffer) => {
    if (isFinite(val) && Math_floor(val) === val) {
      if (val >= 0 && val <= 127) {
        writeByte(val, buffer);
      } else if (val < 0 && val >= -32) {
        writeByte(val, buffer);
      } else if (val > 0 && val <= 255) {
        writeBytes([204, val], buffer);
      } else if (val >= -128 && val <= 127) {
        writeBytes([208, val], buffer);
      } else if (val > 0 && val <= 65535) {
        writeBytes([205, val >>> 8, val], buffer);
      } else if (val >= -32768 && val <= 32767) {
        writeBytes([209, val >>> 8, val], buffer);
      } else if (val > 0 && val <= 4294967295) {
        writeBytes([206, val >>> 24, val >>> 16, val >>> 8, val], buffer);
      } else if (val >= -2147483648 && val <= 2147483647) {
        writeBytes([210, val >>> 24, val >>> 16, val >>> 8, val], buffer);
      } else if (val > 0 && val <= 18446744073709552000) {
        let high = val / MAX_UINT32;
        let low = val % MAX_UINT32;
        writeBytes([211, high >>> 24, high >>> 16, high >>> 8, high, low >>> 24, low >>> 16, low >>> 8, low], buffer);
      } else if (val >= -9223372036854776000 && val <= 9223372036854776000) {
        writeByte(211, buffer);
        let high, low;
        if (val >= 0) {
          high = val / MAX_UINT32;
          low = val % MAX_UINT32;
        } else {
          val++;
          high = Math_abs(val) / MAX_UINT32;
          low = Math_abs(val) % MAX_UINT32;
          high = ~high;
          low = ~low;
        }
        writeBytes([high >>> 24, high >>> 16, high >>> 8, high, low >>> 24, low >>> 16, low >>> 8, low], buffer);
      } else if (val < 0) {
        writeBytes([211, 128, 0, 0, 0, 0, 0, 0, 0], buffer);
      } else {
        writeBytes([207, 255, 255, 255, 255, 255, 255, 255, 255], buffer);
      }
    } else {
      if (!bufferState.floatView) {
        bufferState.floatBuffer = new ArrayBuffer(8);
        bufferState.floatView = new DataView(bufferState.floatBuffer);
      }
      bufferState.floatView.setFloat64(0, val);
      writeByte(203, buffer);
      writeBytes(new Uint8Array(bufferState.floatBuffer), buffer);
    }
  }],
  ["string", (val, buffer) => {
    let utf8 = stringToUtf8(val);
    let len = utf8.length;
    if (len <= 31) {
      writeByte(160 + len, buffer);
    } else if (len <= 255) {
      writeBytes([217, len], buffer);
    } else if (len <= 65535) {
      writeBytes([218, len >>> 8, len], buffer);
    } else {
      writeBytes([219, len >>> 24, len >>> 16, len >>> 8, len], buffer);
    }
    writeBytes(utf8, buffer);
  }],
  ["object", (val, buffer) => {
    if (val === null) {
      writeByte(192, buffer);
    } else if (Array_isArray(val)) {
      encodeArray(val, buffer);
    } else if (val instanceof Uint8Array || val instanceof Uint8ClampedArray) {
      let len = val.length;
      if (len <= 15) {
        writeBytes([196, len], buffer);
      } else if (len <= 65535) {
        writeBytes([197, len >>> 8, len], buffer);
      } else {
        writeBytes([198, len >>> 24, len >>> 16, len >>> 8, len], buffer);
      }
      writeBytes(val, buffer);
    } else if (val instanceof Int8Array || val instanceof Int16Array || val instanceof Uint16Array || val instanceof Int32Array || val instanceof Uint32Array || val instanceof Float32Array || val instanceof Float64Array) {
      encodeArray(val, buffer);
    } else {
      let count = 0;
      for (let key in val) {
        count++;
      }
      if (count <= 15) {
        writeByte(128 + count, buffer);
      } else if (count <= 65535) {
        writeBytes([222, count >>> 8, count], buffer);
      } else {
        writeBytes([223, count >>> 24, count >>> 16, count >>> 8, count], buffer);
      }
      for (let key in val) {
        encodeValue(key, buffer);
        encodeValue(val[key], buffer);
      }
    }
  }]
]);

function encodeValue(val, buffer) {
  typeHandlers.get(typeof val)(val, buffer);
}

function encodeArray(arr, buffer) {
  let len = arr.length;
  if (len <= 15) {
    writeByte(144 + len, buffer);
  } else if (len <= 65535) {
    writeBytes([220, len >>> 8, len], buffer);
  } else {
    writeBytes([221, len >>> 24, len >>> 16, len >>> 8, len], buffer);
  }
  for (let i = 0; i < len; ++i) {
    encodeValue(arr[i], buffer);
  }
}

function writeByte(byte, buffer) {
  if (buffer.length < bufferState.length + 1) {
    let newLen = buffer.length * 2;
    while (newLen < bufferState.length + 1) {
      newLen *= 2;
    }
    let newBuffer = new Uint8Array(newLen);
    newBuffer.set(buffer);
    buffer = newBuffer;
  }
  buffer[bufferState.length] = byte;
  bufferState.length++;
}

function writeBytes(bytes, buffer) {
  if (buffer.length < bufferState.length + bytes.length) {
    let newLen = buffer.length * 2;
    while (newLen < bufferState.length + bytes.length) {
      newLen *= 2;
    }
    let newBuffer = new Uint8Array(newLen);
    newBuffer.set(buffer);
    buffer = newBuffer;
  }
  buffer.set(bytes, bufferState.length);
  bufferState.length += bytes.length;
}

function encode(val) {
  resetBuffer();
  let buffer = new Uint8Array(128);
  encodeValue(val, buffer);
  return buffer.subarray(0, bufferState.length);
}

// Decoding
const decodeState = {
  pos: 0,
  arr: []
};

function resetDecode() {
  decodeState.pos = 0;
  return decodeState.arr = [];
}

const byteHandlers = new Map([
  [192, () => null],
  [193, () => { throw new Error("Invalid byte code 0xc1 found."); }],
  [194, () => false],
  [195, () => true],
  [196, len => readUint(-1, 1, len)],
  [197, len => readUint(-1, 2, len)],
  [198, len => readUint(-1, 4, len)],
  [199, len => readFloat(-1, 1, len)],
  [200, len => readFloat(-1, 2, len)],
  [201, len => readFloat(-1, 4, len)],
  [202, len => readInt(4, len)],
  [203, len => readInt(1, len)],
  [204, len => readInt(2, len)],
  [205, len => readInt(4, len)],
  [206, len => readInt(8, len)],
  [207, len => readInt(16, len)],
  [208, len => readUint(1, 0, len)],
  [209, len => readUint(2, 0, len)],
  [210, len => readUint(4, 0, len)],
  [211, len => readUint(8, 0, len)],
  [212, len => readUint(1, 16, 0, len)],
  [213, len => readUint(2, 16, 0, len)],
  [214, len => readUint(4, 16, 0, len)],
  [215, len => readUint(8, 16, 0, len)],
  [216, len => readUint(16, 16, 0, len)],
  [217, len => readBin(-1, 1, len)],
  [218, len => readBin(-1, 2, len)],
  [219, len => readBin(-1, 4, len)],
  [220, len => readArray(-1, 2, len)],
  [221, len => readArray(-1, 4, len)],
  [222, len => readMap(-1, 2, len)],
  [223, len => readMap(-1, 4, len)]
]);

function decodeValue(buffer) {
  const byte = buffer[decodeState.pos++];
  if (byte >= 0 && byte <= 127) {
    return byte;
  }
  if (byte >= 128 && byte <= 143) {
    return readMap(byte - 128, -1, buffer);
  }
  if (byte >= 144 && byte <= 159) {
    return readArray(byte - 144, -1, buffer);
  }
  if (byte >= 160 && byte <= 191) {
    return readBin(byte - 160, -1, buffer);
  }
  if (byte >= 224 && byte <= 255) {
    return byte - 256;
  }
  return byteHandlers.get(byte)(buffer);
}

function readUint(bytes, isSigned, buffer) {
  let value = 0;
  let first = true;
  while (bytes-- > 0) {
    if (first) {
      let byte = buffer[decodeState.pos++];
      value += byte & 127;
      if (byte & 128) {
        value -= 128;
      }
      first = false;
    } else {
      value *= 256;
      value += buffer[decodeState.pos++];
    }
  }
  return value;
}

function readInt(bytes, buffer) {
  let value = 0;
  while (bytes-- > 0) {
    value *= 256;
    value += buffer[decodeState.pos++];
  }
  return value;
}

function readFloat(bytes, buffer) {
  let view = new DataView(buffer.buffer, decodeState.pos, bytes);
  decodeState.pos += bytes;
  if (bytes === 4) {
    return view.getFloat32(0, false);
  }
  if (bytes === 8) {
    return view.getFloat64(0, false);
  }
}

function readBin(bytes, isSigned, buffer) {
  if (bytes < 0) {
    bytes = readInt(2, buffer);
  }
  let view = buffer.subarray(decodeState.pos, decodeState.pos + bytes);
  decodeState.pos += bytes;
  return utf8ToString(view, decodeState.pos - bytes, bytes);
}

function readMap(count, isSigned, buffer) {
  if (count < 0) {
    count = readInt(isSigned, buffer);
  }
  let obj = {};
  while (count-- > 0) {
    let key = decodeValue(buffer);
    obj[key] = decodeValue(buffer);
  }
  return obj;
}

function readArray(count, isSigned, buffer) {
  if (count < 0) {
    count = readInt(isSigned, buffer);
  }
  let arr = [];
  while (count-- > 0) {
    arr.push(decodeValue(buffer));
  }
  return arr;
}

function decode(buffer) {
  if (typeof buffer !== "object" || typeof buffer.length === "undefined") {
    throw new Error("Invalid argument type: Expected a byte array (Array or Uint8Array) to deserialize.");
  }
  if (!buffer.length) {
    throw new Error("Invalid argument: The byte array to deserialize is empty.");
  }
  resetDecode();
  return decodeValue(buffer);
}

function stringToUtf8(str) {
  let ascii = true;
  let len = str.length;
  for (let i = 0; i < len; ++i) {
    if (str.charCodeAt(i) > 127) {
      ascii = false;
      break;
    }
  }
  let pos = 0;
  let bytes = new Uint8Array(str.length * (ascii ? 1 : 4));
  for (let i = 0; i !== len; ++i) {
    let c = str.charCodeAt(i);
    if (c < 128) {
      bytes[pos++] = c;
      continue;
    }
    if (c < 2048) {
      bytes[pos++] = c >> 6 | 192;
    } else {
      if (c > 55295 && c < 56320) {
        if (++i >= len) {
          throw new Error("UTF-8 encode: incomplete surrogate pair");
        }
        let c2 = str.charCodeAt(i);
        if (c2 < 56320 || c2 > 57343) {
          throw new Error("UTF-8 encode: second surrogate character 0x" + c2.toString(16) + " at index " + i + " out of range");
        }
        c = 65536 + ((c & 1023) << 10) + (c2 & 1023);
        bytes[pos++] = c >> 18 | 240;
        bytes[pos++] = c >> 12 & 63 | 128;
      } else {
        bytes[pos++] = c >> 12 | 224;
      }
      bytes[pos++] = c >> 6 & 63 | 128;
    }
    bytes[pos++] = c & 63 | 128;
  }
  if (ascii) {
    return bytes;
  } else {
    return bytes.subarray(0, pos);
  }
}

function utf8ToString(buffer, offset, length) {
  let pos = offset;
  let str = "";
  offset += length;
  while (pos < offset) {
    let byte = buffer[pos++];
    if (byte > 127) {
      if (byte > 191 && byte < 224) {
        if (pos >= offset) {
          throw new Error("UTF-8 decode: incomplete 2-byte sequence");
        }
        byte = (byte & 31) << 6 | buffer[pos++] & 63;
      } else if (byte > 223 && byte < 240) {
        if (pos + 1 >= offset) {
          throw new Error("UTF-8 decode: incomplete 3-byte sequence");
        }
        byte = (byte & 15) << 12 | (buffer[pos++] & 63) << 6 | buffer[pos++] & 63;
      } else if (byte > 239 && byte < 248) {
        if (pos + 2 >= offset) {
          throw new Error("UTF-8 decode: incomplete 4-byte sequence");
        }
        byte = (byte & 7) << 18 | (buffer[pos++] & 63) << 12 | (buffer[pos++] & 63) << 6 | buffer[pos++] & 63;
      } else {
        throw new Error("UTF-8 decode: unknown multibyte start 0x" + byte.toString(16) + " at index " + (pos - 1));
      }
    }
    if (byte <= 65535) {
      str += String.fromCharCode(byte);
    } else if (byte <= 1114111) {
      byte -= 65536;
      str += String.fromCharCode(byte >> 10 | 55296);
      str += String.fromCharCode(byte & 1023 | 56320);
    } else {
      throw new Error("UTF-8 decode: code point 0x" + byte.toString(16) + " exceeds UTF-16 reach");
    }
  }
  return str;
}

module.exports = {
  encode,
  decode
};
