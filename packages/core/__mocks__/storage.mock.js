var storage = {};

async function read(key) {
  return new Promise((resolve, reject) => resolve(storage[key]));
}

async function readMulti(keys) {
  return new Promise((resolve, reject) => {
    const result = [];
    keys.forEach((key) => {
      result.push([key, storage[key]]);
    });
    resolve(result);
  });
}

async function write(key, data) {
  return new Promise((resolve) => resolve((storage[key] = data)));
}
function remove(key) {
  delete storage[key];
}
function clear() {
  storage = {};
}
function getAllKeys() {
  return Object.keys(storage);
}

function encrypt(password, data) {
  return new Promise((resolve, reject) => {
    if (typeof data === "object") reject("data cannot be object.");
    resolve({
      iv: "some iv",
      cipher: data,
      salt: "i am some salt",
      length: data.length,
      key: password,
    });
  });
}

function decrypt(key, data) {
  return new Promise((resolve, reject) => {
    if (!key || key.password === data.key.password) resolve(data.cipher);
    else reject("Wrong password");
  });
}

async function deriveCryptoKey(name, data) {
  storage[name] = { key: data.password, salt: "salt" };
}

async function getCryptoKey(name) {
  return storage[name];
}

module.exports = {
  read,
  readMulti,
  write,
  remove,
  clear,
  encrypt,
  decrypt,
  deriveCryptoKey,
  getCryptoKey,
  getAllKeys,
};
