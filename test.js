const test = "1.Nf3 d5 2.g3 c5 3.Bg2 Nc6 4.O-O e6 5.d3 Bd6 6.Nbd2 Nge7 7.e4 O-O 8.Re1";

// const testSplit = test.split(/([1-9]|0)+\.\s/);
const notationSplits = test.split('.');

console.log(notationSplits);

const moves = [];

for (let i = 1; i < notationSplits.length; i += 1) {
    const testSplit = notationSplits[i].split(' ');

    moves.push({
        white: testSplit[0],
        black: testSplit[1],
    });
}

console.log(moves);