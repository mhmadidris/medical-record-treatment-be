const express = require('express');
const router = express.Router();
const { getPatients, createPatient, detailPatient, deletePatient, updatePatient } = require('../controllers/patientController');

module.exports = function (db, bucket, upload) {
    router.get('/', async (req, res) => {
        await getPatients(db, req, res);
    });

    router.get('/detail', async (req, res) => {
        await detailPatient(db, req, res);
    });

    router.post('/', async (req, res) => {
        await createPatient(db, req, res);
    });

    router.put('/update', async (req, res) => {
        await updatePatient(db, req, res);
    });

    router.delete('/delete', async (req, res) => {
        await deletePatient(db, req, res);
    });

    return router;
};
