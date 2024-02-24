class MedicineModel {
    constructor(id, image, title, stock, price) {
        this.id = id;
        this.image = image;
        this.title = title;
        this.stock = stock;
        this.price = price;
    }
}

module.exports = MedicineModel;