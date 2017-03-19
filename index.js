const assert = require('assert')

// (Bit) helper functions
// ====================

// pads a string with 0s in front according to the specified chunkSize
const pad = (string, chunkSize = 4, char = '0') => {
  while (string.length % chunkSize !== 0) string = char + string
  return string
}
assert(pad('01') === '0001')
assert(pad('10101') === '00010101')

// creates a bit string with the speicified chunk size
// a bitstring is a string consisting of the charachters '0' and '1'
const toBitString = (number, chunkSize = 4) => pad(number.toString(2), chunkSize)
assert(toBitString(0b01) === '0001')
assert(toBitString(0b10101) === '00010101')

// splits a string in an array with chunks of the same size
// - pads the string if necessary
const splitChunks = (string, chunkSize = 4) => toBitString(string).match(new RegExp('.{1,' + chunkSize + '}', 'g'))
assert.deepEqual(splitChunks('10101'), ['0001', '0101'])

// format a number into readable 4 char chunks
// mainly for display purposes
const toPrettyBit = (number, chunkSize = 4) => splitChunks(number, chunkSize).join(' ')
assert(toPrettyBit(0b10101), '0001 0101')

// parses a string, also with spaces in between, into a number
const parseBitString = (prettyBit) => parseInt(prettyBit.replace(/\s+/g, ''), 2)
assert(parseBitString('0001 0101') === 0b10101)

// inverts a object: the keys will be the values and vice versa
const invert = (obj) => Object.keys(obj).reduce((accumulator, key) => {
  accumulator[ obj[key] ] = key
  return accumulator
}, {})

// Crypto functions
// ================

// aka K(k, i)
const roundKey = (key, i = 0, size = 16) => parseInt(toBitString(key, size).substr(4 * i, size), 2)
assert(roundKey(0b00111010100101001101011000111111) === 0b0011101010010100)
assert(roundKey(0b00111010100101001101011000111111, 1) === 0b1010100101001101)

//
const substitution = (bitString, inverse = false, sBox = {
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
  0xE: 0xF
}) => splitChunks(bitString).map(chunk =>
  toBitString((inverse ? invert(sBox) : sBox)[parseBitString(chunk)])).join('')
assert(substitution('00000001') === '11100100')

const rounds = 4 // r
const n = 4
const m = 4
const s = 32 // 32bit



const bitPermutation = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15]

const key = parseBitString('0011 1010 1001 0100 1101 0110 0011 1111')

const cipherText = '00000100110100100000101110111000000000101000111110001110011111110110000001010001010000111010000000010011011001110010101110110000'

const testSlice = '0010101110110000'

console.log(testSlice, splitChunks(testSlice))

const spn = (text, key, rounds = 4, doEncryption = true) => {
  let result = text ^ roundKey(key, n * m, 0)

  for (let i = 1; i < rounds; i++) {

  }
}
