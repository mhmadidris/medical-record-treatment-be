const functions = require("firebase-functions");
const cors = require("cors");
const express = require("express");
const bodyParser = require('body-parser');
const compression = require("compression");
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const fs = require('fs');

const firebaseRc = JSON.parse(fs.readFileSync('.firebaserc'));
const projectId = firebaseRc.projects.default;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: projectId,
});

// File Route Require
const treatmentRoute = require('./src/routes/treatment')(admin.firestore());

const app = express();
const port = 8080;

// Testing API
app.get('/api/', (req, res) => {
    res.send('Hello, World!');
});

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: true }));

// Call Route
app.use('/api/treatment', treatmentRoute);

app.listen(port, (error) => {
    if (error) {
        console.log('Error starting server:', error);
    } else {
        console.log(`Server is listening at http://localhost:${port}`);
    }
});
