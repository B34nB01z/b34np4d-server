import db from '../db';

export default class CTF {
  private id: number;
  private name: string;
  private from?: Date;
  private to?: Date;
  private url?: string;

  constructor(id: number, name: string, from?: Date, to?: Date, url?: string) {
    this.id = id;
    this.name = name;
    this.from = from;
    this.to = to;
    this.url = url;
  }

  public static create(name: string, from?: Date, to?: Date, url?: string): Promise<CTF> {
    return new Promise((resolve, reject) => {
      db.prepare('INSERT INTO ctfs (name, from, to, url) VALUES (?, ?, ?, ?)')
        .run([name, from, to, url,], () => {
          db.prepare('SELECT * FROM ctfs WHERE name = ? ORDER BY id DESC')
            .get([name,], (err, row) => {
              if (err) return reject(err);
              resolve(new CTF(row.id, row.name, row.from, row.to, row.url));
            }).finalize();
        }).finalize();
    });
  }
};