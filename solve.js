// solve.js
// Usage: node solve.js input.json
// Reads JSON file, decodes values according to base, uses first k points to compute constant term P(0).

const fs = require('fs');
const path = require('path');

// ------------------ Utilities for BigInt arithmetic ------------------

function parseBigIntInBase(str, base) {
  // parses a possibly large signed integer given as string in given base (2..36)
  // returns a BigInt
  if (typeof str !== 'string') throw new Error('value must be a string');
  str = str.trim().toLowerCase();
  if (str.length === 0) throw new Error('empty value string');

  let sign = 1n;
  if (str[0] === '+' || str[0] === '-') {
    if (str[0] === '-') sign = -1n;
    str = str.slice(1);
  }
  const b = BigInt(base);
  let acc = 0n;
  for (let ch of str) {
    let digit;
    if (ch >= '0' && ch <= '9') digit = ch.charCodeAt(0) - '0'.charCodeAt(0);
    else if (ch >= 'a' && ch <= 'z') digit = ch.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
    else throw new Error('invalid digit character: ' + ch);

    if (digit >= base) throw new Error(`digit ${ch} not valid for base ${base}`);
    acc = acc * b + BigInt(digit);
  }
  return sign * acc;
}

function bigintGcd(a, b) {
  // Euclidean gcd for BigInt, returns non-negative gcd
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

function rationalReduce(r) {
  // r: {num: BigInt, den: BigInt} ensure den > 0 and reduce by gcd
  if (r.den === 0n) throw new Error('zero denominator in rational');
  if (r.den < 0n) { r.den = -r.den; r.num = -r.num; }
  const g = bigintGcd(r.num < 0n ? -r.num : r.num, r.den);
  if (g > 1n) { r.num /= g; r.den /= g; }
  return r;
}

function rationalAdd(a, b) {
  // add rationals a + b
  const num = a.num * b.den + b.num * a.den;
  const den = a.den * b.den;
  return rationalReduce({ num, den });
}

// ------------------ Lagrange interpolation for P(0) ------------------
// For points (x_i, y_i), i=0..m, constant term c = P(0) = sum_i y_i * L_i(0)
// where L_i(0) = product_{j != i} (0 - x_j) / (x_i - x_j)
// We'll compute each term as an exact rational and sum them exactly.

function computeConstantTerm(points) {
  // points: array of {x: BigInt, y: BigInt}, length = k = m+1
  const k = points.length;
  // sum as rational
  let sum = { num: 0n, den: 1n };

  for (let i = 0; i < k; ++i) {
    let num = points[i].y;      // will multiply by product(-x_j)
    let den = 1n;              // will multiply by product(x_i - x_j)
    for (let j = 0; j < k; ++j) {
      if (j === i) continue;
      num *= -points[j].x;          // multiply numerator by (0 - x_j) = -x_j
      den *= (points[i].x - points[j].x);
    }
    // reduce term
    let term = rationalReduce({ num, den });
    sum = rationalAdd(sum, term);
  }
  return rationalReduce(sum);
}

// ------------------ Main program ------------------

function main() {
  if (process.argv.length < 3) {
    console.error('Usage: node solve.js input.json');
    process.exit(2);
  }
  const filename = process.argv[2];
  const raw = fs.readFileSync(filename, 'utf8');
  let json;
  try { json = JSON.parse(raw); }
  catch (e) { console.error('Error parsing json:', e.message); process.exit(3); }

  if (!json.keys || typeof json.keys.n === 'undefined' || typeof json.keys.k === 'undefined') {
    console.error('JSON must contain "keys": { "n":..., "k":... }');
    process.exit(4);
  }
  const n = Number(json.keys.n);
  const k = Number(json.keys.k);
  if (!(Number.isInteger(n) && Number.isInteger(k) && k >= 1 && k <= n)) {
    console.error('Invalid keys.n or keys.k');
    process.exit(5);
  }

  // Collect numeric keys (strings like "1","2",...) that correspond to points.
  // We'll sort keys numerically and take the FIRST k points.
  const entryKeys = Object.keys(json).filter(s => s !== 'keys').sort((a,b) => Number(a) - Number(b));
  if (entryKeys.length < k) {
    console.error('Not enough root entries in JSON compared to k');
    process.exit(6);
  }

  // Build points array
  const points = [];
  for (let idx = 0; idx < k; ++idx) {
    const key = entryKeys[idx];
    const item = json[key];
    if (!item || typeof item.base === 'undefined' || typeof item.value === 'undefined') {
      console.error(`Entry ${key} missing base/value`);
      process.exit(7);
    }
    const x = BigInt(Number(key));             // "x is simply given" -> use the entry key as x
    const base = Number(item.base);
    if (!Number.isInteger(base) || base < 2 || base > 36) {
      console.error(`Invalid base ${item.base} at entry ${key}. Supported 2..36.`);
      process.exit(8);
    }
    let y;
    try { y = parseBigIntInBase(item.value, base); }
    catch (e) { console.error(`Error parsing value at entry ${key}: ${e.message}`); process.exit(9); }
    points.push({ x, y });
  }

  // Compute constant term
  const c = computeConstantTerm(points);

  // Output result
  if (c.den === 1n) {
    console.log(`Constant term c = ${c.num.toString()}`);
  } else {
    console.log(`Constant term c = ${c.num.toString()} / ${c.den.toString()} (reduced fraction)`);
  }
}

main();
