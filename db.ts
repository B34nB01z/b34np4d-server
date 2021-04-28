const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('bean.db');

db.serialize(() => {
  try {
    db.run(`
  CREATE TABLE ctfs (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  VARCHAR(64) UNIQUE,
    from  DATETIME,
    to    DATETIME,
    url   TEXT
  );
    `);

    db.run(`
  CREATE TABLE categories (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  VARCHAR(64) UNIQUE
  );
    `);

    db.run(`
  CREATE TABLE chals (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    ctf       INTEGER NOT NULL,
    name      VARCHAR(64) NOT NULL,
    category  INTEGER NOT NULL,
    points    INTEGER NOT NULL,
    done      BOOLEAN DEFAULT 0,
    FOREIGN KEY (ctf) REFERENCES ctfs (id),
    FOREIGN KEY (category) REFERENCES categories (id)
  );
    `);
  } catch (e) {}
});

export default db;