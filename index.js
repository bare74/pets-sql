const morgan = require("morgan");
const express = require("express");
const sqlite3 = require("sqlite3");

const bodyParser = require("body-parser");
const port = process.env.PORT || 8080;
const app = express();

const db = new sqlite3.Database(__dirname + "/pet.database.sqlite");

app.use(morgan("dev"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile("index.html", {
    root: __dirname,
  });
});

const CREATE_PETNAME =
  "CREATE TABLE if not exists petname (petID INTEGER PRIMARY KEY AUTOINCREMENT, petname TEXT, age TEXT, owner_name TEXT, species TEXT, active TEXT);";
const DROP_PETNAME = "DROP TABLE if exists petname;";

app.get("/create_table", (req, res) => {
  db.run(CREATE_PETNAME);
  res.send("Table created");
});

app.get("/drop", (req, res) => {
  db.run(DROP_PETNAME);
  res.send("Table dropped");
});

app.get("/reset", (req, res) => {
  db.run(DROP_PETNAME, () => {
    console.log("Table dropped ...");
    db.run(CREATE_PETNAME, () => {
      console.log("...  and re-created");

      db.run(
        "INSERT INTO petname (petname, age, owner_name, species, active) VALUES ('Buddy',  '2', 'Paul Hansson', 'dog', 'true');"
      );
      db.run(
        "INSERT INTO petname (petname, age, owner_name, species, active) VALUES ('Milo',  '8', 'Jason Smith', 'cat', 'true');"
      );
      db.run(
        "INSERT INTO petname (petname, age, owner_name, species, active) VALUES ('Max',  '4', 'Mel Raven', 'bird', 'true');"
      );
    });
  });

  res.send("Table reset (dropped and re-created)");
});

app.get("/read", (req, res) => {
  let data = [];
  db.serialize(() => {
    db.each(
      "SELECT * FROM petname WHERE active='true';",
      (err, row) => {
        data.push(row);
        if (err) return console.log(err.message);
      },
      () => {
        res.send(data);
      }
    );
  });
});

app.get("/read/:petID", (req, res) => {
  let data = [];
  db.serialize(() => {
    db.each(
      `SELECT * FROM petname WHERE petID = ${req.params.petID}`,
      (err, row) => {
        data.push(row);
        if (err) return console.log(err.message);
      },
      () => {
        res.send(data);
      }
    );
  });
});

app.post("/create", (req, res) => {
  let petname = req.body.petname;
  let age = req.body.age;
  let owner_name = req.body.owner_name;
  let species = req.body.species;
  let active = "true";

  db.run(
    "INSERT INTO petname (petname, age, owner_name, species, active) VALUES ('" +
      petname +
      "',  '" +
      age +
      "',  '" +
      owner_name +
      "',  '" +
      species +
      "',  '" +
      active +
      "');"
  );
  res.send("Kjæledyret ditt er registrert");
});

app.get("/update", (req, res) => {
  res.sendFile("update.html", {
    root: __dirname,
  });
});

app.post("/update", (req, res) => {
  let petID = req.body.petID;
  let petname = req.body.petname;

  const sql = `UPDATE petname SET petname = ? WHERE petID =? `;

  db.run(sql, [petname, petID], function (err) {
    if (err) return console.log(err.message);
  });
  res.send("Ditt kjæledyr er oppdatert");
});

app.get("/delete", (req, res) => {
  res.sendFile("delete.html", {
    root: __dirname,
  });
});

app.post("/delete", (req, res) => {
  let petID = req.body.petID;

  const sql = `UPDATE petname SET active='false' WHERE petID = ${petID}`;
  db.run(sql);

  res.send("Ditt kjæledyr er slettet");
});

app.listen(port, () => console.log("Server is running on port:", port));
