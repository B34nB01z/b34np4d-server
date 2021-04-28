import db from '../db';

export default class Challenge {
  private id: number;
  private ctf: number;
  private name: string;
  private category: number;
  private points: number;
  private done: boolean;

  constructor(id: number, ctf: number, name: string, category: number, points: number, done: boolean) {
    this.id = id;
    this.name = name;
    this.ctf = ctf;
    this.category = category;
    this.points = points;
    this.done = done;
  }

  public static create(ctf: number, name: string, category: number, points: number, done: boolean): Promise<Challenge> {
    return new Promise((resolve, reject) => {
      db.prepare('INSERT INTO chals (ctf, name, category, points, done) VALUES (?)')
        .run([ctf, name, category, points, done], () => {
          db.prepare('SELECT * FROM chals WHERE ctf = ? AND name = ? ORDER BY id DESC')
            .get([ctf, name,], (err, row) => {
              if(err) return reject(err);
              resolve(new Challenge(row.id, row.ctf, row.name, row.category, row.points, row.done));
            }).finalize();
        }).finalize();
    })
  }

};