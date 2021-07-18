import NodeCache from 'node-cache';
const defaultCacheTTL = 60 * 60 * 24; // 24 hrs

class Cache {
  cache: any;
  constructor(ttlSeconds = defaultCacheTTL) {
    this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false });
  }

  getOrSet(key: string, storeFunction: () => Promise<any>) {
    const value = this.cache.get(key);
    if (value) {
      return Promise.resolve(value);
    }

    return storeFunction().then((result) => {
      this.cache.set(key, result);
      return result;
    });
  }

  get(key: string) {
    const value = this.cache.get(key);
    return Promise.resolve(value || null);
  }

  del(keys: string[]) {
    this.cache.del(keys);
  }

  delStartWith(startStr: string = '') {
    if (!startStr) {
      return;
    }

    const keys = this.cache.keys();
    for (const key of keys) {
      if (key.indexOf(startStr) === 0) {
        this.del(key);
      }
    }
  }

  getAllKeys() {
    return this.cache.keys()
  }

  flush() {
    this.cache.flushAll();
  }
}


export default new Cache();