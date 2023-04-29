const mongoose = require("mongoose");

const peopleScheema = mongoose.Schema({
  name: String,
  number: String,
});

const People = mongoose.model("people", peopleScheema);
const MONGO_DB_PASSWORD = process.argv[2];
const MONGO_DB_URL = `mongodb+srv://julian:${MONGO_DB_PASSWORD}@cluster0.gqdgrcu.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(MONGO_DB_URL);

const nameParameter = process.argv[3];
const numberParameter = process.argv[4];

if (nameParameter && numberParameter) {
  const newPerson = new People({
    name: nameParameter,
    number: numberParameter,
  });

  newPerson.save().then(() => {
    mongoose.connection.close();
    console.log(
      `added ${newPerson.name} number ${newPerson.number} to phonebook`
    );
  });
  return;
}

if (MONGO_DB_PASSWORD) {
  People.find({}).then((response) => {
    mongoose.connection.close();

    console.log("phonebook:");
    response.forEach((element) =>
      console.log(`${element.name} ${element.number}`)
    );
  });
  return;
}
