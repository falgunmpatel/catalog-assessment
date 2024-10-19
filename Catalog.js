const fs = require("fs");

// 1. Function to convert a value from any base to decimal
function convertToDecimal(base, value) {
  return parseInt(value, base);
}

// 2. Function to find inverse of a matrix using Gaussian elimination
function inverseMatrix(A) {
  const n = A.length;
  const I = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  // Creating identity matrix
  for (let i = 0; i < n; i++) {
    I[i][i] = 1;
  }

  // Performing Gaussian elimination
  for (let i = 0; i < n; i++) {
    let pivot = A[i][i];
    if (pivot === 0)
      throw new Error("Matrix is singular and cannot be inverted.");

    // Normalize the pivot row
    for (let j = 0; j < n; j++) {
      A[i][j] /= pivot;
      I[i][j] /= pivot;
    }

    // Eliminate the other rows
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        let factor = A[k][i];
        for (let j = 0; j < n; j++) {
          A[k][j] -= factor * A[i][j];
          I[k][j] -= factor * I[i][j];
        }
      }
    }
  }

  return I;
}

// 3. Function to multiply matrix (A inverse) with vector b
function multiplyMatrixVector(Ainv, b) {
  const n = Ainv.length;
  const result = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[i] += Ainv[i][j] * b[j];
    }
  }
  return result;
}

// 4. Main function to solve the polynomial
function solvePolynomial(jsonFilePath) {
  const data = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
  const n = data.keys.n;
  const k = data.keys.k;

  // Step 1: Parse and decode the roots
  const points = [];
  for (let i = 1; i <= n; i++) {
    if (data[i]) {
      const x = i;
      const y = convertToDecimal(parseInt(data[i].base), data[i].value);
      points.push([x, y]);
    }
  }

  // Step 2: Form matrix A and vector b
  const A = [];
  const b = [];
  for (let i = 0; i < k; i++) {
    const [x, y] = points[i];
    const row = [];
    for (let j = k - 1; j >= 0; j--) {
      row.push(Math.pow(x, j));
    }
    A.push(row);
    b.push(y);
  }

  // Step 3: Invert matrix A
  const Ainv = inverseMatrix(A);

  // Step 4: Multiply Ainv with b to find coefficients
  const coefficients = multiplyMatrixVector(Ainv, b);

  // The constant term c is the last coefficient
  const c = coefficients[k - 1];
  console.log(`The constant term c is: ${Math.round(c)}`);
}

// Example usage
solvePolynomial("./points.json");
