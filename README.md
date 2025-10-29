🧮 Polynomial Constant Term Finder

This project solves a recruitment problem where you must find the constant term (c) of a polynomial whose roots (x, y) are given in a JSON file — with a twist:

Each x is given directly.

Each y is encoded in a different base, specified in the JSON.

You must decode these values and interpolate the polynomial to find its constant term.

This implementation is done entirely in Node.js (JavaScript) — no Python used.

🚀 Features

Reads JSON input from a file.

Decodes large numbers from arbitrary bases (2–36).

Performs exact Lagrange interpolation using BigInt for arbitrary precision.

Computes the exact constant term (P(0)) — not an approximation.

Handles large values and arbitrary-sized integers without overflow.

Outputs a simplified integer or reduced fraction.

📂 File Structure
.
├── solve.js         # Main solver script
├── index.json     # Example test case 1
└── README.md        # Documentation (this file)

📥 Input Format

The input JSON contains:

A keys object specifying:

n: total number of roots provided

k: number of roots used to find the polynomial (where degree = k - 1)

Root entries indexed by numbers ("1", "2", "3", …), each containing:

"base" → the base in which the value is encoded

"value" → the actual encoded value (as a string)

🧾 Example
{
  "keys": {
    "n": 4,
    "k": 3
  },
  "1": { "base": "10", "value": "4" },
  "2": { "base": "2", "value": "111" },
  "3": { "base": "10", "value": "12" },
  "6": { "base": "4", "value": "213" }
}


Here:

x-values are the keys (1, 2, 3, 6)

y-values are decoded from their bases

🧠 Logic Summary

The script uses Lagrange interpolation to compute the constant term 
𝑐
=
𝑃
(
0
)
c=P(0):

𝑃
(
0
)
=
∑
𝑖
=
0
𝑘
−
1
𝑦
𝑖
∏
𝑗
≠
𝑖
0
−
𝑥
𝑗
𝑥
𝑖
−
𝑥
𝑗
P(0)=
i=0
∑
k−1
	​

y
i
	​

j

=i
∏
	​

x
i
	​

−x
j
	​

0−x
j
	​

	​


All calculations are done exactly using BigInt and rational arithmetic — no floating-point operations.

🧩 Usage
1. Install Node.js

Ensure Node.js ≥ 14 is installed:

node -v

2. Run the Script
node solve.js <path-to-json>


Example:

node solve.js index.json

🧾 Sample Outputs
Test Case	Input File	Constant Term (c)
1	index.json	3
⚙️ Implementation Details

Language: JavaScript (Node.js)

Precision: Unlimited (BigInt arithmetic)

Interpolation: Exact rational Lagrange

Output: Simplified integer or reduced fraction
