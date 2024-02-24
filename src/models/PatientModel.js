class PatientModel {
    constructor(id, patientID, patientName, date, treatmentIds, medicineIds, cost) {
        this.id = id;
        this.patientID = patientID;
        this.patientName = patientName;
        this.date = date;
        this.treatmentIds = treatmentIds;
        this.medicineIds = medicineIds;
        this.cost = cost;
    }
}

module.exports = PatientModel;