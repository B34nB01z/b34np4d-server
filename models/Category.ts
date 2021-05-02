import db from '../db';

export class Category {
  private id: number;
  private name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  public static create(name: string): Promise<Category> {
    return new Promise((resolve, reject) => {
      db.prepare('INSERT INTO categories (name) VALUES (?)')
        .run([name,], function(err) {
          if(err) return reject(err);
          db.prepare('SELECT * FROM categories WHERE id = ?')
            .get([this.lastID,], (err, row) => {
              if(err) return reject(err);
              resolve(new Category(row.id, row.name));
            }).finalize();
        }).finalize();
    })
  }

  public update(): Promise<void> {
    return new Promise((resolve, reject) => {
      db.prepare('UPDATE categories SET name = ? WHERE id = ?')
        .run([this.name, this.id], (err) => {
          if(err) return reject(err);
          resolve();
        }).finalize();
    });
  }

  public static get(id: number): Promise<Category> {
    return new Promise((resolve, reject) => {
      db.prepare('SELECT * FROM categories WHERE id = ?')
        .get([id], (err, row) => {
          if(err) return reject(err);
            resolve(new Category(row.id, row.name));
        })
    });
  }

  public static getAll(ctfId: number): Promise<Category[]> {
    return new Promise((resolve, reject) => {
      db.prepare(`SELECT DISTINCT categories.id as id, categories.name as name FROM categories 
                           INNER JOIN chals ON categories.id=chals.category 
                           INNER JOIN ctfs ON chals.ctf=ctfs.id`)
        .all([], (err, rows) => {
          if(err) return reject(err);
          const cats: Category[] = [];
          for(const row of rows) {
            cats.push(new Category(row.id, row.name));
          }
          resolve(cats);
        })
    });
  }

};

export default Category;