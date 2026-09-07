export default class Case {
    constructor(name, price, skins) {
        this.name = name;
        this.price = price;
        this.skins = skins;
    }

    getSkins() {
        return this.skins;
    }
}