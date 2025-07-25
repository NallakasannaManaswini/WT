const db = require('./db');

db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, rows) => {
  if (err) {
    console.error("Error querying tables:", err.message);
  } else {
    console.log("Tables found in bank.db:");
    rows.forEach(row => console.log( row.name));
  }
  db.close();
});
