require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Persons = require("./models/Persons");

const app = express();
app.use(express.json());
app.use(cors());

morgan.token("body", function (req, _res) {
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

app.get("/api/persons", (_req, res, next) => {
  Persons.find({})
    .then((response) => res.status(200).json(response))
    .catch((error) => {
      next(error);
    });
});

app.post("/api/persons", (req, res, next) => {
  const { name, number } = req.body;
  const newPerson = new Persons({
    name,
    number,
  });

  if (!name || !number) {
    return res.status(422).json({ error: "name or number cant be empty" });
  }

  newPerson
    .save()
    .then((person) => {
      return res.status(200).json(person);
    })
    .catch((error) => {
      return next(error);
    });
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Persons.findById(id)
    .then((response) => {
      if (!response) {
        return res.status(404).json({ error: "person not found" });
      }
      return res.status(200).json(response);
    })
    .catch((error) => {
      next(error);
    });
});

app.put("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  const { name, number } = req.body;

  const updatedPerson = {
    name,
    number,
  };

  Persons.findByIdAndUpdate(id, updatedPerson, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((person) => res.status(200).json(person))
    .catch((error) => {
      next(error);
    });
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;

  Persons.findByIdAndDelete(id)
    .then(() => res.status(204).end())
    .catch((error) => {
      next(error);
    });
});

app.get("/info", (_req, res, next) => {
  Persons.countDocuments({})
    .then((PersonsCount) => {
      const htmlResponse = `<p>Phonebook has info for ${PersonsCount} people</p> <p>${new Date()}</p>`;
      return res.status(200).send(htmlResponse);
    })
    .catch((error) => {
      next(error);
    });
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`server listening in ${PORT}`));
