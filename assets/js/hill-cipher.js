class HillCipher {
    constructor() {
        this.steps = [];
    }

    resetSteps() {
        this.steps = [];
    }

    getSteps() {
        return this.steps;
    }

    addStep(stepType, description, data = {}) {
        this.steps.push({
            stepType,
            description,
            ...data
        });
    }

    charToNum(char) {
        return char.toUpperCase().charCodeAt(0) - 65;
    }

    numToChar(num) {
        return String.fromCharCode((num % 26 + 26) % 26 + 65);
    }

    modInverse(a, m) {
        a = ((a % m) + m) % m;
        for (let x = 1; x < m; x++) {
            if ((a * x) % m === 1) {
                return x;
            }
        }
        return null;
    }

    gcd(a, b) {
        while (b !== 0) {
            let temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    determinant2x2(matrix) {
        const det = (matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]) % 26;
        return (det + 26) % 26;
    }

    determinant3x3(matrix) {
        const a = matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]);
        const b = matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]);
        const c = matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
        const det = (a - b + c) % 26;
        return (det + 26) % 26;
    }

    matrixInverse(matrix) {
        const size = matrix.length;
        let det, detInv;

        if (size === 2) {
            det = this.determinant2x2(matrix);
        } else if (size === 3) {
            det = this.determinant3x3(matrix);
        } else {
            return null;
        }

        this.addStep('determinant', `Calculando determinante da matriz ${size}x${size}`, {
            matrix: matrix,
            result: det
        });

        if (this.gcd(det, 26) !== 1) {
            this.addStep('error', 'Matriz não é invertível (determinante não é coprimo com 26)', {
                result: `det = ${det}, gcd(${det}, 26) = ${this.gcd(det, 26)}`
            });
            return null;
        }

        detInv = this.modInverse(det, 26);
        if (detInv === null) {
            this.addStep('error', 'Não foi possível encontrar o inverso modular do determinante', {
                result: `det = ${det}`
            });
            return null;
        }

        this.addStep('mod_inverse', `Calculando inverso modular do determinante`, {
            input: det,
            result: detInv
        });

        if (size === 2) {
            return this.inverse2x2(matrix, det, detInv);
        } else {
            return this.inverse3x3(matrix, det, detInv);
        }
    }

    inverse2x2(matrix, det, detInv) {
        const adjugate = [
            [matrix[1][1], -matrix[0][1]],
            [-matrix[1][0], matrix[0][0]]
        ];

        this.addStep('adjugate', 'Calculando matriz adjunta', {
            matrix: adjugate
        });

        const inverse = adjugate.map(row =>
            row.map(val => ((val * detInv) % 26 + 26) % 26)
        );

        this.addStep('inverse', 'Matriz inversa calculada', {
            matrix: inverse
        });

        return inverse;
    }

    inverse3x3(matrix, det, detInv) {
        const cofactors = [
            [
                matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1],
                -(matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]),
                matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]
            ],
            [
                -(matrix[0][1] * matrix[2][2] - matrix[0][2] * matrix[2][1]),
                matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0],
                -(matrix[0][0] * matrix[2][1] - matrix[0][1] * matrix[2][0])
            ],
            [
                matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1],
                -(matrix[0][0] * matrix[1][2] - matrix[0][2] * matrix[1][0]),
                matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]
            ]
        ];

        this.addStep('cofactors', 'Calculando matriz de cofatores', {
            matrix: cofactors
        });

        const adjugate = cofactors[0].map((_, i) =>
            cofactors.map(row => row[i])
        );

        this.addStep('adjugate', 'Calculando matriz adjunta (transposta dos cofatores)', {
            matrix: adjugate
        });

        const inverse = adjugate.map(row =>
            row.map(val => ((val * detInv) % 26 + 26) % 26)
        );

        this.addStep('inverse', 'Matriz inversa calculada', {
            matrix: inverse
        });

        return inverse;
    }

    matrixVectorMultiply(matrix, vector) {
        const result = matrix.map(row =>
            row.reduce((sum, val, i) => sum + val * vector[i], 0) % 26
        ).map(val => (val + 26) % 26);

        this.addStep('multiply', 'Multiplicação matriz × vetor (mod 26)', {
            matrix: matrix,
            vector: vector,
            result: result
        });

        return result;
    }

    validateMatrix(matrix) {
        if (!matrix || matrix.length === 0) {
            return { valid: false, message: 'Matriz vazia' };
        }

        const size = matrix.length;
        if (size !== 2 && size !== 3) {
            return { valid: false, message: 'Matriz deve ser 2x2 ou 3x3' };
        }

        for (let row of matrix) {
            if (row.length !== size) {
                return { valid: false, message: 'Matriz deve ser quadrada' };
            }
        }

        for (let row of matrix) {
            for (let val of row) {
                if (!Number.isInteger(val) || val < 0) {
                    return { valid: false, message: 'Todos os elementos devem ser inteiros não-negativos' };
                }
            }
        }

        let det;
        if (size === 2) {
            det = this.determinant2x2(matrix);
        } else {
            det = this.determinant3x3(matrix);
        }

        if (this.gcd(det, 26) !== 1) {
            return { 
                valid: false, 
                message: `Determinante (${det}) não é coprimo com 26. A matriz não é invertível.` 
            };
        }

        return { valid: true, message: 'Matriz válida para Hill Cipher' };
    }

    encrypt(text, matrix) {
        this.resetSteps();
        
        const validation = this.validateMatrix(matrix);
        if (!validation.valid) {
            this.addStep('error', 'Erro de validação da matriz', {
                result: validation.message
            });
            return { result: '', steps: this.getSteps() };
        }

        const cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
        this.addStep('clean', 'Texto limpo (apenas A-Z)', {
            input: text,
            result: cleanText
        });

        if (cleanText.length === 0) {
            this.addStep('error', 'Nenhum caractere válido encontrado', {});
            return { result: '', steps: this.getSteps() };
        }

        const blockSize = matrix.length;
        let paddedText = cleanText;
        while (paddedText.length % blockSize !== 0) {
            paddedText += 'X';
        }

        if (paddedText !== cleanText) {
            this.addStep('padding', `Preenchimento adicionado para completar blocos de ${blockSize}`, {
                input: cleanText,
                result: paddedText
            });
        }

        const numbers = paddedText.split('').map(char => this.charToNum(char));
        this.addStep('convert', 'Conversão letras → números (A=0, B=1, ..., Z=25)', {
            input: paddedText,
            vector: numbers
        });

        let encryptedNumbers = [];
        for (let i = 0; i < numbers.length; i += blockSize) {
            const block = numbers.slice(i, i + blockSize);
            this.addStep('block', `Processando bloco ${Math.floor(i/blockSize) + 1}`, {
                vector: block
            });
            
            const encryptedBlock = this.matrixVectorMultiply(matrix, block);
            encryptedNumbers = encryptedNumbers.concat(encryptedBlock);
        }

        const result = encryptedNumbers.map(num => this.numToChar(num)).join('');
        this.addStep('final', 'Conversão números → letras finais', {
            vector: encryptedNumbers,
            result: result
        });

        return { result, steps: this.getSteps() };
    }

    decrypt(text, matrix) {
        this.resetSteps();
        
        const validation = this.validateMatrix(matrix);
        if (!validation.valid) {
            this.addStep('error', 'Erro de validação da matriz', {
                result: validation.message
            });
            return { result: '', steps: this.getSteps() };
        }

        const inverseMatrix = this.matrixInverse(matrix);
        if (!inverseMatrix) {
            return { result: '', steps: this.getSteps() };
        }

        const cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
        this.addStep('clean', 'Texto limpo (apenas A-Z)', {
            input: text,
            result: cleanText
        });

        if (cleanText.length === 0) {
            this.addStep('error', 'Nenhum caractere válido encontrado', {});
            return { result: '', steps: this.getSteps() };
        }

        const numbers = cleanText.split('').map(char => this.charToNum(char));
        this.addStep('convert', 'Conversão letras → números (A=0, B=1, ..., Z=25)', {
            input: cleanText,
            vector: numbers
        });

        const blockSize = matrix.length;
        let decryptedNumbers = [];
        for (let i = 0; i < numbers.length; i += blockSize) {
            const block = numbers.slice(i, i + blockSize);
            this.addStep('block', `Descriptografando bloco ${Math.floor(i/blockSize) + 1}`, {
                vector: block
            });
            
            const decryptedBlock = this.matrixVectorMultiply(inverseMatrix, block);
            decryptedNumbers = decryptedNumbers.concat(decryptedBlock);
        }

        const result = decryptedNumbers.map(num => this.numToChar(num)).join('');
        this.addStep('final', 'Conversão números → letras finais', {
            vector: decryptedNumbers,
            result: result
        });

        return { result, steps: this.getSteps() };
    }
}