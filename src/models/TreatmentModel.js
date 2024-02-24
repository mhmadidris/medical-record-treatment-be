class TreatmentModel {
    constructor(id, treatment, price) {
        this.id = id;
        this.treatment = treatment;
        this.price = price;
        this.created_at = new Date().toLocaleString("id-ID");
        this.updated_at = new Date().toLocaleString("id-ID");
    }
}

module.exports = TreatmentModel;