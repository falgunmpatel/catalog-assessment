// Function to convert base values to decimal
function convertToDecimal(base, value) {
  const baseValue = parseInt(base, 10);
  return parseInt(value, baseValue);
}

// Function to generate combinations of k from n
function getCombinations(arr, k) {
  const result = [];
  const combine = (start, combo) => {
    if (combo.length === k) {
      result.push(combo);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combine(i + 1, combo.concat(arr[i]));
    }
  };
  combine(0, []);
  return result;
}

// Function to invert a matrix using Gaussian elimination
function invertMatrix(matrix) {
  const n = matrix.length;
  const augmentedMatrix = matrix.map((row, i) => {
    const newRow = [...row, ...Array(n).fill(0)];
    newRow[i + n] = 1; // Identity matrix
    return newRow;
  });

  // Gaussian elimination
  for (let i = 0; i < n; i++) {
    let maxEl = Math.abs(augmentedMatrix[i][i]);
    let maxRow = i;

    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmentedMatrix[k][i]) > maxEl) {
        maxEl = Math.abs(augmentedMatrix[k][i]);
        maxRow = k;
      }
    }

    // Swap maximum row with current row (pivot)
    const temp = augmentedMatrix[maxRow];
    augmentedMatrix[maxRow] = augmentedMatrix[i];
    augmentedMatrix[i] = temp;

    // Make all rows below this one 0 in current column
    for (let k = i + 1; k < n; k++) {
      const c = -augmentedMatrix[k][i] / augmentedMatrix[i][i];
      for (let j = i; j < 2 * n; j++) {
        if (i === j) {
          augmentedMatrix[k][j] = 0;
        } else {
          augmentedMatrix[k][j] += c * augmentedMatrix[i][j];
        }
      }
    }
  }

  const inverse = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = 0; j < n; j++) {
      inverse[i][j] = augmentedMatrix[i][j + n] / augmentedMatrix[i][i];
      for (let k = i - 1; k >= 0; k--) {
        augmentedMatrix[k][j + n] -= augmentedMatrix[k][i] * inverse[i][j];
      }
    }
  }

  return inverse;
}

// Function to multiply matrix and vector
function multiplyMatrixVector(matrix, vector) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  if (cols !== vector.length) {
    throw new Error("Matrix columns must match vector size.");
  }

  const result = Array(rows).fill(0);

  for (let i = 0; i < rows; i++) {
    result[i] = 0;
    for (let j = 0; j < cols; j++) {
      result[i] += matrix[i][j] * vector[j];
    }
  }

  return result;
}

// Main function to deduce polynomial coefficients
function deducePolynomialCoefficients(jsonInput) {
  const input = JSON.parse(jsonInput);
  const n = input.keys.n;
  const k = input.keys.k;

  const points = [];

  // Decode x and y values
  for (let i = 1; i <= n; i++) {
    const base = input[i].base;
    const value = input[i].value;
    const decimalValue = convertToDecimal(base, value);

    points.push({ x: i, y: decimalValue }); // Collecting points
  }

  // Generate all combinations of k points from n points
  const combinations = getCombinations(points, k);
  const validSolutions = [];

  // Evaluate each combination
  combinations.forEach((combo) => {
    // Create matrix A and vector b
    const matrixA = combo.map((point) => {
      return Array.from({ length: k }, (_, j) => Math.pow(point.x, k - 1 - j));
    });

    const vectorB = combo.map((point) => point.y);

    // Invert matrix A
    const inverseMatrix = invertMatrix(matrixA);

    // Multiply inverse(A) and b to get the coefficients
    const coefficients = multiplyMatrixVector(inverseMatrix, vectorB);

    // Check for validity (all coefficients must be positive integers)
    const isValid = coefficients.every(
      (coef) => Number.isInteger(coef) && coef > 0
    );

    if (isValid) {
      validSolutions.push(coefficients);
    }
  });

  // Output valid solutions
  console.log("Valid Solutions (Coefficients including constant term c):");
  validSolutions.forEach((solution) => {
    console.log(solution.map((val) => val.toFixed(2)).join(", "));
  });
}

// Example JSON Input
const jsonInput = `{
  "keys": {
    "n": 10,
    "k": 7
  },
  "1": {
    "base": "6",
    "value": "13444211440455345511"
  },
  "2": {
    "base": "15",
    "value": "aed7015a346d63"
  },
  "3": {
    "base": "15",
    "value": "6aeeb69631c227c"
  },
  "4": {
    "base": "16",
    "value": "e1b5e05623d881f"
  },
  "5": {
    "base": "8",
    "value": "316034514573652620673"
  },
  "6": {
    "base": "3",
    "value": "2122212201122002221120200210011020220200"
  },
  "7": {
    "base": "3",
    "value": "20120221122211000100210021102001201112121"
  },
  "8": {
    "base": "6",
    "value": "20220554335330240002224253"
  },
  "9": {
    "base": "12",
    "value": "45153788322a1255483"
  },
  "10": {
    "base": "7",
    "value": "1101613130313526312514143"
  }
}`;

// Run the function with the example JSON input
deducePolynomialCoefficients(jsonInput);
