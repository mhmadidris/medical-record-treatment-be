const PatientModel = require('../models/PatientModel');

async function getPatients(db, req, res) {
    try {
        const patientsSnapshot = await db.collection('patients').get();
        const patients = [];

        for (const doc of patientsSnapshot.docs) {
            const patientData = doc.data();
            const treatmentPromises = patientData.treatmentIds.map(async treatmentId => {
                const treatmentDoc = await db.collection('treatments').doc(treatmentId).get();
                return { id: treatmentId, ...treatmentDoc.data() };
            });
            const medicinePromises = patientData.medicineIds.map(async medicineId => {
                const medicineDoc = await db.collection('medicines').doc(medicineId).get();
                return { id: medicineId, ...medicineDoc.data() };
            });
            const treatments = await Promise.all(treatmentPromises);
            const medicines = await Promise.all(medicinePromises);

            patients.push({
                id: doc.id,
                patientID: patientData.patientID,
                patientName: patientData.patientName,
                date: patientData.date,
                cost: patientData.cost,
                treatments,
                medicines,
            });
        }

        res.status(200).json({ patients });
    } catch (error) {
        console.error('Error getting patients:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function createPatient(db, req, res) {
    try {
        const { patientID, patientName, date, treatmentIds, cost, medicineIds } = req.body;

        if (!patientID || !patientName || !date || !treatmentIds || !cost || !medicineIds) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const treatmentIdsArray = treatmentIds.split(',').map(id => id.trim());
        const medicineIdsArray = medicineIds.split(',').map(id => id.trim());

        const validationErrors = await validateIds(db, treatmentIdsArray, medicineIdsArray);

        if (validationErrors.length > 0) {
            return res.status(400).json({ message: validationErrors.join(' ') });
        }

        const newPatientRef = await db.collection('patients').add({
            patientID,
            patientName,
            date,
            treatmentIds: treatmentIdsArray,
            medicineIds: medicineIdsArray,
            cost,
        });

        res.status(201).json({ message: 'Patient created successfully', id: newPatientRef.id });
    } catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function validateIds(db, treatmentIdsArray, medicineIdsArray) {
    const errors = [];

    if (treatmentIdsArray.length === 0) {
        errors.push('Cannot save patient. No treatment IDs provided.');
    }

    if (medicineIdsArray.length === 0) {
        errors.push('Cannot save patient. No medicine IDs provided.');
    }

    const treatmentsSnapshot = await db.collection('treatments').get();
    const availableTreatmentIds = treatmentsSnapshot.docs.map(doc => doc.id);

    const medicinesSnapshot = await db.collection('medicines').get();
    const availableMedicineIds = medicinesSnapshot.docs.map(doc => doc.id);

    const invalidTreatmentIds = treatmentIdsArray.filter(id => !availableTreatmentIds.includes(id));
    if (invalidTreatmentIds.length > 0) {
        errors.push(`Treatment IDs ${invalidTreatmentIds.join(', ')} do not exist.`);
    }

    const invalidMedicineIds = medicineIdsArray.filter(id => !availableMedicineIds.includes(id));
    if (invalidMedicineIds.length > 0) {
        errors.push(`Medicine IDs ${invalidMedicineIds.join(', ')} do not exist.`);
    }

    return errors;
}

async function detailPatient(db, req, res) {
    try {
        const { patientId } = req.query;

        if (!patientId) {
            return res.status(400).json({ message: 'Patient ID is missing' });
        }

        const patientDoc = await db.collection('patients').doc(patientId).get();

        if (!patientDoc.exists) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const patientData = patientDoc.data();
        const treatmentPromises = patientData.treatmentIds.map(async treatmentId => {
            const treatmentDoc = await db.collection('treatments').doc(treatmentId).get();
            return { id: treatmentId, ...treatmentDoc.data() };
        });
        const medicinePromises = patientData.medicineIds.map(async medicineId => {
            const medicineDoc = await db.collection('medicines').doc(medicineId).get();
            return { id: medicineId, ...medicineDoc.data() };
        });
        const treatments = await Promise.all(treatmentPromises);
        const medicines = await Promise.all(medicinePromises);

        const detailedPatient = {
            id: patientDoc.id,
            patientID: patientData.patientID,
            patientName: patientData.patientName,
            date: patientData.date,
            cost: patientData.cost,
            treatments,
            medicines,
        };

        res.status(200).json({ patient: detailedPatient });
    } catch (error) {
        console.error('Error getting patient details:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function deletePatient(db, req, res) {
    try {
        const { patientId } = req.query;

        const patientRef = db.collection('patients').doc(patientId);
        const patientDoc = await patientRef.get();

        if (!patientDoc.exists) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        await patientRef.delete();

        res.status(200).json({ message: 'Patient deleted successfully' });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function updatePatient(db, req, res) {
    try {
        const { patientId } = req.query;
        const { patientID, patientName, date, treatmentIds, cost, medicineIds } = req.body;

        const patientRef = db.collection('patients').doc(patientId);
        const patientDoc = await patientRef.get();

        if (!patientDoc.exists) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        if (!patientID || !patientName || !date || !treatmentIds || !cost || !medicineIds) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const treatmentIdsArray = treatmentIds.split(',').map(id => id.trim());
        const medicineIdsArray = medicineIds.split(',').map(id => id.trim());

        const validationErrors = await validateIds(db, treatmentIdsArray, medicineIdsArray);

        if (validationErrors.length > 0) {
            return res.status(400).json({ message: validationErrors.join(' ') });
        }

        const updatedData = {
            patientName: patientName,
            date: date,
            treatmentIds: treatmentIdsArray,
            cost: cost,
            medicineIds: medicineIdsArray,
        };

        await patientRef.update(updatedData);

        res.status(200).json({ message: 'Patient updated successfully' });
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = { getPatients, createPatient, detailPatient, deletePatient, updatePatient };
