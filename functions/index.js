const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');

admin.initializeApp(functions.config().firebase);

const app = express();
const main = express();

// eslint-disable-next-line max-len
// add the path to receive request and set json as bodyParser to process the body
main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

// initialize the database and the collection
const db = admin.firestore();
const userCollection = 'users';

// define google cloud function name
export const webApi = functions.https.onRequest(main);

app.post('/users', (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      areaNumber,
      department,
      id,
      contactNumber,
    } = req.body;
    const user = {
      firstName,
      lastName,
      email,
      areaNumber,
      department,
      id,
      contactNumber,
    };
    const newDoc = db.collection(userCollection).add(user);
    console.log(newDoc);
    res.status(201).send(`Created a new user: ${newDoc.id}`);
  } catch (error) {
    res.status(400).send('failed to store body');
  }
});

app.get('/users', (req, res) => {
  try {
    const userQuerySnapshot = db.collection(userCollection).get();
    const users = userQuerySnapshot.reduce(
      (currentUsers, doc) => [
        ...currentUsers,
        {
          id: doc.id,
          data: doc.data(),
        },
      ],
      []
    );
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/users/:userId', (req, res) => {
  const userId = req.params.userId;
  db.collection(userCollection)
    .doc(userId)
    .get()
    .then((user) => {
      if (!user.exists) throw new Error('User not found');
      res.status(200).json({ id: user.id, data: user.data() });
    })
    .catch((error) => res.status(500).send(error));
});

app.delete('/users/:userId', (req, res) => {
  db.collection(userCollection)
    .doc(req.params.userId)
    .delete()
    .then(() => res.status(204).send('Documnet successfully deleted!'))
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.put('/users/:userId', (req, res) => {
  db.collection(userCollection)
    .doc(req.params.userId)
    .set(req.body, { merge: true })
    .then(() => res.json({ id: req.params.userId }))
    .catch((error) => res.status(500).send(error));
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
