const express = require('express');
const router = express.Router();
const { getMedicines, uploadImageMedicine, createMedicine, getMedicineDetail } = require('../controllers/medicineController');

module.exports = function (db, bucket, upload) {
    router.get('/', async (req, res) => {
        await getMedicines(db, req, res);
    });

    router.post('/', async (req, res) => {
        await createMedicine(db, req, res);
    });

    router.get('/detail', async (req, res) => {
        await getMedicineDetail(db, req, res);
    });

    router.post('/upload', upload.single('image'), async (req, res) => {
        await uploadImageMedicine(db, req, res, bucket);
    });

    return router;
};