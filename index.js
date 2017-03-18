const r = 4;
const n = 4;
const m = 4;
const s = 32;

const sBox = {
    0x0: 0xE,
    0x1: 0x4,
    0x2: 0xD,
    0x3: 0x1,
    0x4: 0x2,
    0x5: 0xF,
    0x6: 0xB,
    0x7: 0x8,
    0x8: 0x3,
    0x9: 0xA,
    0xA: 0x6,
    0xB: 0xC,
    0xC: 0x6,
    0xD: 0x9,
    0xE: 0xF,
};

const bitPermutation = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];

const key = parseInt('0011 1010 1001 0100 1101 0110 0011 1111', 2);

const cipherText = 0b00000100110100100000101110111000000000101000111110001110011111110110000001010001010000111010000000010011011001110010101110110000;

console.log(key, cipherText);