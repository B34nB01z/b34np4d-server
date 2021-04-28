import db from '../db';

export default class Category {
  private id: number;
  private name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  public static create(name: string): Promise<Category> {
    return new Promise((resolve, reject) => {
      db.prepare('INSERT INTO categories (name) VALUES (?)')
        .run([name], () => {
          db.prepare('SELECT * FROM categories WHERE name = ? ORDER BY id DESC')
            .get((err, row) => {
              if(err) return reject(err);
              resolve(new Category(row.id, row.name));
            }).finalize();
        }).finalize();
    })
  }

};