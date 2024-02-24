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

const locale = 'id-ID';
global.locale = locale;

// Initialize Firebase Storage
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
    projectId: projectId,
    credentials: serviceAccount
});
const bucket = storage.bucket(`${projectId}.appspot.com`);
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// File Route Require
const treatmentRoute = require('./src/routes/treatment')(admin.firestore());
const medicineRoute = require('./src/routes/medicine')(admin.firestore(), bucket, upload);
const patientRoute = require('./src/routes/patient')(admin.firestore());

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
app.use('/api/medicine', medicineRoute);
app.use('/api/patient', patientRoute);

app.listen(port, (error) => {
    if (error) {
        console.log('Error starting server:', error);
    } else {
        console.log(`Server is listening at http://localhost:${port}`);
    }
});
