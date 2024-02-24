const MedicineModel = require('../models/MedicineModel');

async function getMedicines(db, req, res) {
    try {
        const totalCountSnapshot = await db.collection('medicines').get();
        const totalCount = totalCountSnapshot.size;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const medicinesSnapshot = await db.collection('medicines').limit(limit).offset(startIndex).get();
        const medicines = [];

        medicinesSnapshot.forEach(doc => {
            const data = doc.data();
            const medicine = new MedicineModel(doc.id, data.image, data.title, data.stock, data.price);
            medicines.push(medicine);
        });

        const response = {
            totalItems: totalCount,
            totalCount: medicines.length,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            medicines
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function uploadImageMedicine(db, req, res, bucket, upload) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const timestamp = Date.now();
        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `${timestamp}.${fileExtension}`;
        const file = bucket.file(fileName);
        await file.save(req.file.buffer, { contentType: req.file.mimetype });

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        res.status(201).json({ message: 'File uploaded successfully', fileUrl: publicUrl });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function createMedicine(db, req, res) {
    try {
        const { image, title, stock, price } = req.body;

        if (!image || !title || !stock || !price) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newMedicineRef = await db.collection('medicines').add({
            image,
            title,
            stock,
            price
        });

        res.status(201).json({ message: 'Medicine created successfully', id: newMedicineRef.id });
    } catch (error) {
        console.error('Error creating medicine:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function getMedicineDetail(db, req, res) {
    try {
        const { medicineId } = req.query;

        if (!medicineId) {
            return res.status(400).json({ message: 'Medicine ID is required in query parameters' });
        }

        const doc = await db.collection('medicines').doc(medicineId).get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        const data = doc.data();
        const medicine = new MedicineModel(doc.id, data.image, data.title, data.stock, parseFloat(data.price));

        res.json({ medicine });
    } catch (error) {
        console.error('Error fetching medicine details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function updateMedicine(db, req, res) {
    try {
        const { medicineId } = req.query;
        const { image, title, stock, price } = req.body;

        if (!medicineId) {
            return res.status(400).json({ message: 'Medicine ID is required' });
        }

        const medicineRef = db.collection('medicines').doc(medicineId);
        const doc = await medicineRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        await medicineRef.update({
            image: image,
            title: title,
            stock: stock,
            price: price
        });

        res.status(200).json({ message: 'Medicine updated successfully' });
    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function deleteImageMedicine(req, res, bucket) {
    try {
        const { imageUrl } = req.query;

        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        const fileName = extractFileNameFromImageUrl(imageUrl);

        const file = bucket.file(fileName);

        await file.delete();

        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).send('Internal Server Error');
    }
}

function extractFileNameFromImageUrl(imageUrl) {
    const parts = imageUrl.split('/');
    return parts[parts.length - 1];
}

module.exports = { getMedicines, uploadImageMedicine, createMedicine, getMedicineDetail, deleteImageMedicine, updateMedicine };
