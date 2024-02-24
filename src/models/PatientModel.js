class PatientModel {
    constructor(id, patientID, patientName, date, treatmentIds, medicineIds, cost) {
        this.id = id;
        this.patientID = patientID;
        this.patientName = patientName;
        this.date = date;
        this.treatmentIds = treatmentIds;
        this.medicineIds = medicineIds;
        this.cost = cost;
        this.created_at = new Date().toLocaleString("id-ID");
        this.updated_at = new Date().toLocaleString("id-ID");
    }
}

module.exports = PatientModel;