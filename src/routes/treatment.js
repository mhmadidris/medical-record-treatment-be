const express = require('express');
const router = express.Router();
const { getTreatments, addTreatment, getTreatmentDetails, updateTreatment, deleteTreatment } = require('../controllers/treatmentController');

module.exports = function (db) {
    router.get('/', async (req, res) => {
        await getTreatments(db, req, res);
    });

    router.post('/', async (req, res) => {
        await addTreatment(db, req, res);
    });

    router.get('/detail', async (req, res) => {
        await getTreatmentDetails(db, req, res);
    });

    router.put('/update', async (req, res) => {
        await updateTreatment(db, req, res);
    });

    router.delete('/delete', async (req, res) => {
        await deleteTreatment(db, req, res);
    });

    return router;
};
