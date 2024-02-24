const TreatmentModel = require('../models/TreatmentModel');

async function getTreatments(db, req, res) {
    try {
        const totalCountSnapshot = await db.collection('treatments').get();
        const totalCount = totalCountSnapshot.size;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const treatmentsSnapshot = await db.collection('treatments').limit(limit).offset(startIndex).get();
        const treatments = [];

        treatmentsSnapshot.forEach(doc => {
            const data = doc.data();
            const treatment = new TreatmentModel(doc.id, data.treatment, data.price);
            treatments.push(treatment);
        });

        const response = {
            totalItems: totalCount,
            totalCount: treatments.length,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            treatments
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching treatments:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function addTreatment(db, req, res) {
    try {
        const { treatment, price } = req.body;

        if (!treatment || !price) {
            return res.status(400).json({ message: 'Treatment and price are required.' });
        }

        const newTreatment = new TreatmentModel(null, treatment, price);

        const docRef = await db.collection('treatments').add({
            treatment: newTreatment.treatment,
            price: newTreatment.price
        });

        newTreatment.id = docRef.id;

        res.status(201).json({ message: 'Treatment added successfully', treatment: newTreatment });
    } catch (error) {
        console.error('Error adding treatment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function getTreatmentDetails(db, req, res) {
    try {
        const { treatmentId } = req.query;

        if (!treatmentId) {
            return res.status(400).json({ message: 'Treatment ID is required in query parameters' });
        }

        const doc = await db.collection('treatments').doc(treatmentId).get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Treatment not found' });
        }

        const data = doc.data();
        const treatment = new TreatmentModel(doc.id, data.treatment, parseFloat(data.price));

        res.json({ treatment });
    } catch (error) {
        console.error('Error fetching treatment details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function updateTreatment(db, req, res) {
    try {
        const { treatmentId } = req.query;
        const { treatment, price } = req.body;

        if (!treatmentId) {
            return res.status(400).json({ message: 'Treatment ID is required in query parameters' });
        }

        if (!treatment || !price) {
            return res.status(400).json({ message: 'Treatment and price are required.' });
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) {
            return res.status(400).json({ message: 'Invalid price format. Price must be a valid number.' });
        }

        const treatmentRef = db.collection('treatments').doc(treatmentId);
        const treatmentSnapshot = await treatmentRef.get();

        if (!treatmentSnapshot.exists) {
            return res.status(404).json({ message: 'Treatment not found' });
        }

        await treatmentRef.update({
            treatment,
            price: parsedPrice
        });

        res.json({ message: 'Treatment updated successfully' });
    } catch (error) {
        console.error('Error updating treatment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function deleteTreatment(db, req, res) {
    try {
        const { treatmentId } = req.query;

        if (!treatmentId) {
            return res.status(400).json({ message: 'Treatment ID is required in query parameters' });
        }

        const treatmentRef = db.collection('treatments').doc(treatmentId);
        const treatmentSnapshot = await treatmentRef.get();

        if (!treatmentSnapshot.exists) {
            return res.status(404).json({ message: 'Treatment not found' });
        }

        await treatmentRef.delete();

        res.json({ message: 'Treatment deleted successfully' });
    } catch (error) {
        console.error('Error deleting treatment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { getTreatments, addTreatment, getTreatmentDetails, updateTreatment, deleteTreatment };
