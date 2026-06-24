import { DatabaseSync, type StatementSync } from 'node:sqlite';

class Database {
  private _db: DatabaseSync;

  constructor(path: string) {
    this._db = new DatabaseSync(path);
  }

  pragma(str: string): void {
    this._db.exec(`PRAGMA ${str}`);
  }

  exec(sql: string): void {
    this._db.exec(sql);
  }

  prepare(sql: string): StatementSync {
    return this._db.prepare(sql);
  }

  transaction<TArgs extends unknown[], TReturn>(fn: (...args: TArgs) => TReturn): (...args: TArgs) => TReturn {
    return (...args: TArgs): TReturn => {
      this._db.exec('BEGIN');
      try {
        const result = fn(...args);
        this._db.exec('COMMIT');
        return result;
      } catch (e) {
        this._db.exec('ROLLBACK');
        throw e;
      }
    };
  }

  close(): void {
    this._db.close();
  }
}

export { Database };
export default Database;
