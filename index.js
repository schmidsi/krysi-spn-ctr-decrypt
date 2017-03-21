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
const toBitString = (number, chunkSize = 4) => {
  assert('number' === typeof number, `called toBitString with a non number argument: ${number}, ${typeof number}`)
  return pad(number.toString(2), chunkSize)
}
assert(toBitString(0b01) === '0001')
assert(toBitString(0b10101) === '00010101')
assert(toBitString(15) === '1111')

// splits a string in an array with chunks of the same size
// - pads the string if necessary
const splitChunks = (string, chunkSize = 4) => pad(string).match(new RegExp('.{1,' + chunkSize + '}', 'g'))
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
  const string = 'number' === typeof stringOrInt
    ? toBitString(stringOrInt, chunkSize)
    : pad(stringOrInt, chunkSize)

  console.log(toPrettyBit(string, 4), description)

  for (let i = 0; i < blankLines; i++) console.log()
}

// Crypto functions
// ================

// word substitution inclusive inverse and predefined sBox
const substitution = (bitString, inverse = false, sBox = {
  0b0000: 0b1110, // 0x0: 0xE,
  0b0001: 0b0100, // 0x1: 0x4,
  0b0010: 0b1101, // 0x2: 0xD,
  0b0011: 0b0001, // 0x3: 0x1,
  0b0100: 0b0010, // 0x4: 0x2,
  0b0101: 0b1111, // 0x5: 0xF,
  0b0110: 0b1011, // 0x6: 0xB,
  0b0111: 0b1000, // 0x7: 0x8,
  0b1000: 0b0011, // 0x8: 0x3,
  0b1001: 0b1010, // 0x9: 0xA,
  0b1010: 0b0110, // 0xA: 0x6,
  0b1011: 0b1100, // 0xB: 0xC,
  0b1100: 0b0101, // 0xC: 0x5,
  0b1101: 0b1001, // 0xD: 0x9,
  0b1110: 0b0000, // 0xE: 0x0,
  0b1111: 0b0111 // 0xF: 0x7
}) => splitChunks(bitString).map(chunk => {
  const substitut = (inverse ? invert(sBox) : sBox)[parseBitString(chunk)]
  return toBitString(parseInt(substitut, 10))
}
).join('')
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

// aka K(k, i)
const roundKey = (key, i = 0, inverse = false, rounds, size = 16) => {
  const standard = (key, i, size) =>
    parseInt(toBitString(key, size).substr(4 * i, size), 2)

  if (inverse) {
    if (rounds === 0 || i === 0) {
      return standard(key, rounds - i, size)
    } else {
      let result = standard(key, rounds - i, size)
      let permutated = bitPermutation(toBitString(result, 16))
      return parseBitString(permutated)
    }
  } else {
    return standard(key, i, size)
  }
}
assert(roundKey(0b00111010100101001101011000111111) === 0b0011101010010100)
assert(roundKey(0b00111010100101001101011000111111, 1) === 0b1010100101001101)

const rounds = 4 // r
const n = 4
const m = 4
const s = 32 // 32bit

const key = parseBitString('0011 1010 1001 0100 1101 0110 0011 1111')

const cipherText = '00000100110100100000101110111000000000101000111110001110011111110110000001010001010000111010000000010011011001110010101110110000'

const testSlice = '0000010011010010'


const substitutionPermutationNetwork = (bitString, key, decrypt = false, rounds = 4) => {
  bitLog(bitString, `starting spn with decrypt: ${decrypt} `)

  bitLog(roundKey(key, 0, decrypt, rounds), '⨁ round key 0')
  let result = toBitString(parseBitString(bitString) ^ roundKey(key, 0, decrypt, rounds), 16)
  bitLog(result, 'result of initial white step', 1)

  for (let i = 1; i < rounds; i++) {
    result = substitution(result, decrypt)
    bitLog(result, 'substituted')
    result = bitPermutation(result)
    bitLog(result, 'bit permutated')
    bitLog(roundKey(key, i, decrypt, rounds), `⨁ round key ${i}`)
    result = toBitString(parseBitString(result) ^ roundKey(key, i, decrypt, rounds), 16)
    bitLog(result, `result of round ${i}`, 1)
  }

  result = substitution(result, decrypt)
  bitLog(result, 'last substitution')
  bitLog(roundKey(key, rounds, decrypt, rounds), `⨁ round key ${rounds}`)
  result = toBitString(parseBitString(result) ^ roundKey(key, rounds, decrypt, rounds), 16)
  console.log('---- ---- ---- ----')
  bitLog(result, 'result', 2)

  return result
}
assert(
  substitutionPermutationNetwork(
    '0001001010001111',
    0b00010001001010001000110000000000
  ) === '1010111010110100'
)
assert(
  substitutionPermutationNetwork(testSlice, key) !==
  substitutionPermutationNetwork(testSlice, key, true)
)
assert(
  substitutionPermutationNetwork(
    substitutionPermutationNetwork(testSlice, key),
  key, true) === testSlice
)
