import Case from "./Case";
import dataSkins from "./DataSkins";

class DataCases {
    constructor() {
        this.cases = [
            new Case(
                "Кейс 1",
                100,
                [
                    dataSkins.get(0),
                    dataSkins.get(1),
                    dataSkins.get(2)
                ]
            ),

            new Case(
                "Кейс 2",
                250,
                [
                    dataSkins.get(1),
                    dataSkins.get(2),
                    dataSkins.get(3)
                ]
            )
        ];
    }

    get(index) {
        return this.cases[index];
    }

    getAll() {
        return this.cases;
    }
}

export default new DataCases();