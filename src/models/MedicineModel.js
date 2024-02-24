class MedicineModel {
    constructor(id, image, title, stock, price) {
        this.id = id;
        this.image = image;
        this.title = title;
        this.stock = stock;
        this.price = price;
        this.created_at = new Date().toLocaleString("id-ID");
        this.updated_at = new Date().toLocaleString("id-ID");
    }
}

module.exports = MedicineModel;
