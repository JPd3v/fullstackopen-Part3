const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.body(req, res),
    ].join(" ");
  })
);
app.use(express.static("build"));
let phoneBook = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (req, res) => {
  return res.status(200).json(phoneBook);
});

app.post("/api/persons", (req, res) => {
  const { name, number } = req.body;
  const newPerson = {
    name,
    number,
    id: Math.floor(Math.random() * 999999999999999),
  };

  if (!name || !number) {
    return res.status(422).json({ error: "name or number cant be empty" });
  }

  const foundPerson = phoneBook.find(
    (person) => person.name.toLowerCase() === name.toLowerCase()
  );
  if (foundPerson) {
    return res.status(422).json({ error: "name must be unique" });
  }

  phoneBook.push(newPerson);
  return res.status(201).json(newPerson);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const foundPerson = phoneBook.find((person) => person.id === id);
  if (!foundPerson) {
    return res.status(404).json({ error: "person not found" });
  }

  return res.status(200).json(foundPerson);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  phoneBook = phoneBook.filter((person) => person.id !== id);

  return res.status(204).end();
});

app.get("/info", (req, res) => {
  const htmlResponse = `<p>Phonebook has info for ${
    phoneBook.length
  } people</p> <p>${new Date()}</p>`;
  return res.status(200).send(htmlResponse);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`server listening in ${PORT}`));
