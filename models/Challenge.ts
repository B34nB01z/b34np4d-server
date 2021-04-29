import db from '../db';

export class Challenge {
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
        .run([ctf, name, category, points, done], function(err) {
          if(err) return reject(err);
          db.prepare('SELECT * FROM chals WHERE id = ?')
            .get([this.lastID], (err, row) => {
              if(err) return reject(err);
              resolve(new Challenge(row.id, row.ctf, row.name, row.category, row.points, row.done));
            }).finalize();
        }).finalize();
    })
  }

  public update(): Promise<void> {
    return new Promise((resolve, reject) => {
      db.prepare('UPDATE chals SET name = ?, category = ?, points = ?, done = ? WHERE id = ?')
        .run([this.name,this.category,this.points,this.done,this.id], (err) => {
          if(err) return reject(err);
          resolve();
        }).finalize();
    });
  }

  public static get(id: number): Promise<Challenge> {
    return new Promise((resolve, reject) => {
      db.prepare('SELECT * FROM chals WHERE id = ?')
        .get([id], (err, row) => {
          if(err) return reject(err);
          resolve(new Challenge(row.id, row.ctf, row.name, row.category, row.points, row.done));
        })
    });
  }

  public static getAll(): Promise<Challenge[]> {
    return new Promise((resolve, reject) => {
      db.prepare('SELECT * FROM chals')
        .all([], (err, rows) => {
          if(err) return reject(err);
          const chals: Challenge[] = [];
          for(const row of rows) {
            chals.push(new Challenge(row.id, row.ctf, row.name, row.category, row.points, row.done));
          }
          resolve(chals);
        })
    });
  }

};

export default Challenge;