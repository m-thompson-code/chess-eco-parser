import * as fs from 'fs';

console.log("Running Chess ECO Parser\n");

const raw = fs.readFileSync('./scid.eco', 'utf-8');

export interface Opening {
    index: string;
    text: string;
    notation: string;
    arrayIndex: number;
}

// console.log(raw);
const raw_rows = raw.split('\n');
// const openings = [];

let skipCount = 0;
let starCount = 0;
// let oneCount = 0;
let spaceCount = 0;

const rows = [];

let _row = "";
for (const raw_row of raw_rows) {
    if (!raw_row || raw_row.charAt(0) === '#') {
        skipCount += 1;
        continue;
    }

    if (_row) {
        _row += " ";
    }

    _row += raw_row.trim();

    if (raw_row.charAt(0) === ' ') {
        spaceCount += 1;
    }

    if (raw_row.endsWith('*')) {
        starCount += 1;

        rows.push(_row + '\n');
        _row = "";
    }
}

const openings: Opening[] = [];

const notationMap: {
    [notation: string]: Opening[]
} = {};

const textMap: {
    [text: string]: Opening[]
} = {};

for (const row of rows) {
    const parts = row.split(`"`);

    const index = parts[0].trim();
    let text = parts[1].trim();
    let notation = parts[2].trim();

    // Skip Start position
    if (index === 'A00a') {
        continue;
    }

    // Fix error in notation "3.Nbd2" => "3.Nd2" (Pirc)// TODO double check this
    if (index === 'B07d') {
        text = text.replace("Nbd2", "Nd2");
        notation = notation.replace("Nbd2", "Nd2");
    }

    // Fix error in notation "Nbd7" => "Nbxd7" (French: Tarrasch, Open)
    if (index === 'C08l' || index === 'C08m') {
        text = text.replace("Nbd7", "Nbxd7");
        notation = notation.replace("Nbd7", "Nbxd7");
    }

    // Fix error in notation "12. Nd4" => "12.Nd4" (Bishop's Opening: Urusov Gambit, Forintos/Haag Variation)
    if (index === 'C24') {
        text = text.replace("12. Nd4", "12.Nd4");
        notation = notation.replace("12. Nd4", "12.Nd4");
    }

    // // 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Nbd7 5.e3 Bb4
    // // Fix error in notation "1.d4 d5 2.c4 e6 3.Nf3 Nbd7" => "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Nbd7"
    // if (index === 'D30g') {
    //     text = "QGD: 4.Bg5 Nbd7 (Westphalia)";
    //     notation = "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Nbd7";
    // }
    // Turns out this is a duplicate -> skip
    if (index === 'D30g') {
        continue;
    }

    // Fix error in notation "Bb4" => "Bb4+" (Semi-Slav: Meran, Sozin, Stahlberg Attack)
    if (index === 'D49g') {
        text = text.replace("Bb4", "Bb4+");
        notation = notation.replace("Bb4", "Bb4+");
    }

    // Fix error in notation "Qxd8+" => "Qxd8" (King's Indian: Saemisch, 5...O-O 6.Be3 c5 Queenswap)
    if (index === 'E81n') {
        text = text.replace("Qxd8+", "Qxd8");
        notation = notation.replace("Qxd8+", "Qxd8");
    }
    
    // Fix error in notation "Qxd8+" => "Qxd8" (King's Indian: Larsen, 6...e5, Queenswap)
    if (index === 'E90j') {
        text = text.replace("Qxd8+", "Qxd8");
        notation = notation.replace("Qxd8+", "Qxd8");
    }

    // Fix error in notation "Qxd8+" => "Qxd8" (King's Indian: 5.Nf3 O-O 6.h3 e5 Queenswap)
    if (index === 'E90o') {
        text = text.replace("Qxd8+", "Qxd8");
        notation = notation.replace("Qxd8+", "Qxd8");
    }

    // Fix error in notation "Re8" => "Re8+" (King's Indian: 5.Nf3 O-O 6.h3 c5 7.d5 e6 8.Bd3 exd5 9.exd5 Re8+)
    if (index === 'E90y') {
        text = text.replace("Re8", "Re8+");
        notation = notation.replace("Re8", "Re8+");
    }

    if (notation.endsWith(' *')) {
        notation = notation.substring(0, notation.length -2);
    }

    const opening = {
        index: index,
        text: text,
        notation: notation,
        arrayIndex: openings.length,
    };

    openings.push(opening);

    notationMap[notation] = notationMap[notation] || [];
    notationMap[notation].push(opening);

    textMap[text] = textMap[text] || [];
    textMap[text].push(opening);
}

for (const key of Object.keys(notationMap)) {
    if (notationMap[key].length > 1) {
        const message = "Duplication opening found with notation";
        console.error(message, notationMap[key][0].notation, notationMap[key]);
        throw {
            message: message
        };
    }
}

let count = 0;

for (const key of Object.keys(textMap)) {
    if (textMap[key].length > 1) {
        const message = "Duplication opening found with text";
        console.error(message, textMap[key][0].text, textMap[key]);
        // break;
        count += 1;
    }
}
console.log(count);

fs.mkdirSync('./output', { recursive: true });
fs.writeFileSync('./output/eco_openings_metadata.json', JSON.stringify(openings, null, 4), 'utf-8');


console.log(raw_rows.length, skipCount, raw_rows.length - skipCount);
console.log(rows.length, starCount, spaceCount, starCount + spaceCount);
console.log(rows.length, starCount);

console.log("\nEND Running Chess ECO Parser");
