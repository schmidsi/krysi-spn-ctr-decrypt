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

// inverts an object: the keys will be the values and vice versa
const invert = (obj) => Object.keys(obj).reduce((accumulator, key) => {
  accumulator[ obj[key] ] = key
  return accumulator
}, {})

const bitLog = (stringOrInt, description = '', blankLines = 0, chunkSize = 16) => {
  console.log(toPrettyBit(toBitString(stringOrInt, chunkSize)), description)

  for (let i = 0; i < blankLines; i++) console.log()
}

// Crypto functions
// ================

// aka K(k, i)
const roundKey = (key, i = 0, size = 16) => parseInt(toBitString(key, size).substr(4 * i, size), 2)
assert(roundKey(0b00111010100101001101011000111111) === 0b0011101010010100)
assert(roundKey(0b00111010100101001101011000111111, 1) === 0b1010100101001101)

// word substitution inclusive inverse and predefined sBox
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
  0xC: 0x5,
  0xD: 0x9,
  0xE: 0x0,
  0xF: 0x7
}) => splitChunks(bitString).map(chunk =>
  toBitString((inverse ? invert(sBox) : sBox)[parseBitString(chunk)])).join('')
assert(substitution('00000001') === '11100100')
assert(substitution('11100100', true) === '00000001')
assert(substitution('1111') === '0111')

const bitPermutation = (bitString, map = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15]) =>
  bitString.split('').reduce((accumulator, current, index) => {
    accumulator[map[index]] = current
    return accumulator
  }, [])
  .join('')
assert(bitPermutation('0100000000000000') === '0000100000000000')

const rounds = 4 // r
const n = 4
const m = 4
const s = 32 // 32bit

const key = parseBitString('0011 1010 1001 0100 1101 0110 0011 1111')

const cipherText = '00000100110100100000101110111000000000101000111110001110011111110110000001010001010000111010000000010011011001110010101110110000'

const testSlice = '0000010011010010'


const substitutionPermutationNetwork = (bitString, key, decrypt = false, rounds = 4) => {
  bitLog(bitString, 'starting spn')

  bitLog(roundKey(key, 0), '⨁ round key 0')
  let result = parseBitString(bitString) ^ roundKey(key, 0)
  bitLog(result, 'result of initial white step', 1)

  for (let i = 1; i < rounds; i++) {
    result = substitution(result)
    bitLog(result, 'substituted')
    result = bitPermutation(result)
    bitLog(result, 'bit permutated')
    bitLog(roundKey(key, i), `⨁ round key ${i}`)
    result = parseBitString(result) ^ roundKey(key, i)
    bitLog(result, `result of round ${i}`, 1)
  }

  result = substitution(result)
  bitLog(result, 'last substitution')
  bitLog(roundKey(key, rounds), `⨁ round key ${rounds}`)
  result = toBitString(parseBitString(result) ^ roundKey(key, rounds))
  console.log('---- ---- ---- ----')
  bitLog(result, 'result', 2)

  return result
}
assert(
  substitutionPermutationNetwork(
    substitutionPermutationNetwork(testSlice, key),
  key, true) === testSlice)

