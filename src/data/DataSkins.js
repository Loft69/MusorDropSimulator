import Skin from "./Skin";

class DataSkins {
    constructor() {
        this.skins = [
            new Skin(
                "AK-47 | Redline",
                "Запрещённое",
                "./images/skins/ak47-redline.png"
            ),

            new Skin(
                "AWP | Asiimov",
                "Засекреченное",
                "./images/skins/awp-asiimov.png"
            ),

            new Skin(
                "Glock-18 | Vogue",
                "Запрещённое",
                "./images/skins/glock-vogue.png"
            ),

            new Skin(
                "M4A1-S | Printstream",
                "Тайное",
                "./images/skins/m4a1s-printstream.png"
            )
        ];
    }

    get(index) {
        return this.skins[index];
    }

    getAll() {
        return this.skins;
    }
}

export default new DataSkins();