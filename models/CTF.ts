import db from '../db';

export class CTF {
  private id: number;
  private name: string;
  private start?: Date;
  private end?: Date;
  private url?: string;

  constructor(id: number, name: string, start?: Date, end?: Date, url?: string) {
    this.id = id;
    this.name = name;
    this.start = start;
    this.end = end;
    this.url = url;
  }

  public static create(name: string, start?: Date, end?: Date, url?: string): Promise<CTF> {
    return new Promise((resolve, reject) => {
      db.prepare('INSERT INTO ctfs (name, start, end, url) VALUES (?, ?, ?, ?)')
        .run([name, start, end, url,], function(err) {
          if(err) return reject(err);
          db.prepare('SELECT * FROM ctfs WHERE id = ?')
            .get([this.lastID,], (err, row) => {
              if (err) return reject(err);
              resolve(new CTF(row.id, row.name, new Date(row.start), new Date(row.end), row.url));
            }).finalize();
        }).finalize();
    });
  }

  public update(): Promise<void> {
    return new Promise((resolve, reject) => {
      db.prepare('UPDATE ctfs SET name = ?, start = ?, end = ?, url = ? WHERE id = ?')
        .run([this.name,this.start,this.end,this.url,this.id], function(err) {
          if(err) return reject(err);
          if(!this.changes) return reject({status: 400, message: 'Invalid ID'})
          resolve();
        }).finalize();
    });
  }

  public delete(): Promise<void> {
    return new Promise((resolve, reject) => {
      db.prepare('DELETE FROM ctfs WHERE id = ?')
        .run([this.id], (err) => {
          if(err) return reject(err);
          resolve();
        }).finalize();
    });
  }

  public static delete(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      db.prepare('DELETE FROM ctfs WHERE id = ?')
        .run([id], function(err) {
          if(err) return reject(err);
          if(!this.changes) return reject({status: 400, message: 'Invalid ID'});
          resolve();
        }).finalize();
    });
  }

  public static get(id: number): Promise<CTF> {
    return new Promise((resolve, reject) => {
      db.prepare('SELECT * FROM ctfs WHERE id = ?')
        .get([id], (err, row) => {
          if(err) return reject(err);
          if(!row) return reject({status: 400, message: 'Invalid ID'});
          resolve(new CTF(row.id, row.name, new Date(row.start), new Date(row.end), row.url));
        })
    });
  }

  public static getAll(): Promise<CTF[]> {
    return new Promise((resolve, reject) => {
      db.prepare('SELECT * FROM ctfs')
        .all([], (err, rows) => {
          if(err) return reject(err);
          const ctfs: CTF[] = [];
          for(const row of rows) {
            ctfs.push(new CTF(row.id, row.name, new Date(row.start), new Date(row.end), row.url));
          }
          resolve(ctfs);
        })
    });
  }

};

export default CTF;