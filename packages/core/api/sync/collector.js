import { CURRENT_DATABASE_VERSION } from "../../common";

class Collector {
  /**
   *
   * @param {Database} db
   */
  constructor(db) {
    this._db = db;
  }

  async collect(lastSyncedTimestamp, isForceSync) {
    await this._db.notes.init();

    this._lastSyncedTimestamp = lastSyncedTimestamp;
    this.key = await this._db.user.getEncryptionKey();
    return {
      // notes: this._collect(await this._db.notes.encrypted()),
      // notebooks: this._collect(await this._db.notebooks.encrypted()),
      // content: this._collect(await this._db.content.encrypted()),
      notes: await this._encrypt(
        this._collect(this._db.notes.raw, isForceSync)
      ),
      notebooks: await this._encrypt(
        this._collect(this._db.notebooks.raw, isForceSync)
      ),
      content: await this._encrypt(
        this._collect(await this._db.content.all(), isForceSync)
      ),
      attachments: await this._encrypt(
        this._collect(this._db.attachments.syncable, isForceSync)
      ),
      settings: await this._encrypt(
        this._collect([this._db.settings.raw], isForceSync)
      ),
      vaultKey: await this._serialize(await this._db.vault._getKey()),
    };
  }

  _serialize(item) {
    if (!item) return null;
    return this._db.storage.encrypt(this.key, JSON.stringify(item));
  }

  _encrypt(array) {
    if (!array.length) return [];
    return Promise.all(array.map(this._map, this));
  }

  /**
   *
   * @param {Array} array
   * @returns {Array}
   */
  _collect(array, isForceSync) {
    if (!array.length) return [];
    return array.reduce((prev, item) => {
      if (!item) return prev;
      const isSyncable = !item.synced || isForceSync;
      const isUnsynced =
        item.dateModified > this._lastSyncedTimestamp || isForceSync;

      if (item.localOnly) {
        prev.push({ id: item.id, deleted: true, dateModified: Date.now() });
      } else if ((isUnsynced && isSyncable) || item.migrated) {
        prev.push(item);
      }

      return prev;
    }, []);
  }

  // _map(item) {
  //   return {
  //     id: item.id,
  //     v: CURRENT_DATABASE_VERSION,
  //     iv: item.iv,
  //     cipher: item.cipher,
  //     length: item.length,
  //     alg: item.alg,
  //     dateModified: item.dateModified,
  //   };
  // }

  async _map(item) {
    // in case of resolved content
    delete item.resolved;
    // turn the migrated flag off so we don't keep syncing this item repeated
    delete item.migrated;
    delete item.synced;

    return {
      id: item.id,
      v: CURRENT_DATABASE_VERSION,
      ...(await this._serialize(item)),
    };
  }

  filter(data, predicate) {
    const arrays = ["notes", "notebooks", "content", "attachments", "settings"];
    const newData = {};
    for (let array of arrays) {
      if (!data[array]) continue;
      newData[array] = data[array].filter(predicate);
    }
    return newData;
  }
}
export default Collector;
