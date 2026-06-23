import { DatabaseSync } from 'node:sqlite';

class Database {
  constructor(path) {
    this._db = new DatabaseSync(path);
  }

  pragma(str) {
    this._db.exec(`PRAGMA ${str}`);
  }

  exec(sql) {
    this._db.exec(sql);
  }

  prepare(sql) {
    return this._db.prepare(sql);
  }

  transaction(fn) {
    const self = this;
    return (...args) => {
      self._db.exec('BEGIN');
      try {
        fn(...args);
        self._db.exec('COMMIT');
      } catch (e) {
        self._db.exec('ROLLBACK');
        throw e;
      }
    };
  }

  close() {
    this._db.close();
  }
}

export { Database };
export default Database;
