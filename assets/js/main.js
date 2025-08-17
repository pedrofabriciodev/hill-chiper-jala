class HillCipherApp {
    constructor() {
        this.matrixSize = 2;
        this.matrix = [[0, 0], [0, 0]];
        this.hillCipher = new HillCipher();
        this.currentMode = 'encrypt';
        
        this.initializeElements();
        this.bindEvents();
        this.generateMatrix();
        this.validateMatrix();
    }

    initializeElements() {
        this.matrixSizeSelect = document.getElementById('matrix-size');
        this.matrixContainer = document.getElementById('matrix-container');
        this.fillExampleBtn = document.getElementById('fill-example');
        this.validationBadge = document.getElementById('validation-badge');
        this.validationMessage = document.getElementById('validation-message');
        this.inputText = document.getElementById('input-text');
        this.outputText = document.getElementById('output-text');
        this.processBtn = document.getElementById('process-btn');
        this.swapBtn = document.getElementById('swap-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.stepsSection = document.getElementById('steps-section');
        this.stepsContainer = document.getElementById('steps-container');
        this.modeRadios = document.querySelectorAll('input[name="mode"]');
    }

    bindEvents() {
        this.matrixSizeSelect.addEventListener('change', (e) => {
            this.handleMatrixSizeChange(parseInt(e.target.value));
        });

        this.fillExampleBtn.addEventListener('click', () => {
            this.fillExample();
        });

        this.processBtn.addEventListener('click', () => {
            this.processText();
        });

        this.swapBtn.addEventListener('click', () => {
            this.swapTexts();
        });

        this.clearBtn.addEventListener('click', () => {
            this.clearAll();
        });

        this.modeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentMode = e.target.value;
            });
        });
    }

    handleMatrixSizeChange(newSize) {
        this.matrixSize = newSize;
        this.matrix = Array(newSize).fill().map(() => Array(newSize).fill(0));
        this.generateMatrix();
        this.validateMatrix();
    }

    generateMatrix() {
        this.matrixContainer.innerHTML = '';
        this.matrixContainer.className = `matrix-container matrix-${this.matrixSize}x${this.matrixSize}`;

        for (let i = 0; i < this.matrixSize; i++) {
            for (let j = 0; j < this.matrixSize; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '0';
                input.max = '25';
                input.className = 'matrix-input';
                input.value = this.matrix[i][j] || 0;
                input.placeholder = '0';
                
                input.addEventListener('input', (e) => {
                    this.handleMatrixChange(i, j, e.target.value);
                });

                this.matrixContainer.appendChild(input);
            }
        }
    }

    handleMatrixChange(row, col, value) {
        const num = parseInt(value) || 0;
        this.matrix[row][col] = num;
        this.validateMatrix();
    }

    validateMatrix() {
        const validation = this.hillCipher.validateMatrix(this.matrix);
        
        this.validationBadge.textContent = validation.valid ? '✓ Válida' : '✗ Inválida';
        this.validationBadge.className = validation.valid ? 'badge valid' : 'badge invalid';
        this.validationMessage.textContent = validation.message;
    }

    fillExample() {
        if (this.matrixSize === 2) {
            this.matrix = [[3, 2], [5, 7]];
        } else {
            this.matrix = [[6, 24, 1], [13, 16, 10], [20, 17, 15]];
        }
        this.generateMatrix();
        this.validateMatrix();
    }

    processText() {
        const text = this.inputText.value.trim();
        if (!text) {
            alert('Por favor, digite algum texto para processar.');
            return;
        }

        const validation = this.hillCipher.validateMatrix(this.matrix);
        if (!validation.valid) {
            alert('A matriz não é válida: ' + validation.message);
            return;
        }

        let result;
        if (this.currentMode === 'encrypt') {
            result = this.hillCipher.encrypt(text, this.matrix);
        } else {
            result = this.hillCipher.decrypt(text, this.matrix);
        }

        this.outputText.value = result.result;
        this.displaySteps(result.steps);
    }

    swapTexts() {
        const temp = this.inputText.value;
        this.inputText.value = this.outputText.value;
        this.outputText.value = temp;
        
        this.currentMode = this.currentMode === 'encrypt' ? 'decrypt' : 'encrypt';
        this.modeRadios.forEach(radio => {
            radio.checked = radio.value === this.currentMode;
        });
    }

    clearAll() {
        this.inputText.value = '';
        this.outputText.value = '';
        this.stepsSection.style.display = 'none';
        this.stepsContainer.innerHTML = '';
    }

    displaySteps(steps) {
        if (steps.length === 0) {
            this.stepsSection.style.display = 'none';
            return;
        }

        this.stepsSection.style.display = 'block';
        this.stepsContainer.innerHTML = '';

        steps.forEach((step, index) => {
            const stepElement = this.createStepElement(step, index + 1);
            this.stepsContainer.appendChild(stepElement);
        });
    }

    createStepElement(step, index) {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item';

        const header = document.createElement('div');
        header.className = 'step-header';

        const icon = document.createElement('span');
        icon.className = 'step-icon';
        icon.textContent = this.getStepIcon(step.stepType);

        const description = document.createElement('span');
        description.className = 'step-description';
        description.textContent = `${index}. ${step.description}`;

        const badge = document.createElement('span');
        badge.className = `step-badge ${this.getStepColor(step.stepType)}`;
        badge.textContent = step.stepType;

        header.appendChild(icon);
        header.appendChild(description);
        header.appendChild(badge);

        const content = document.createElement('div');
        content.className = 'step-content';

        if (step.input !== undefined) {
            const inputDiv = document.createElement('div');
            inputDiv.className = 'step-data';
            inputDiv.innerHTML = `<strong>Entrada:</strong> ${step.input}`;
            content.appendChild(inputDiv);
        }

        if (step.matrix) {
            const matrixDiv = document.createElement('div');
            matrixDiv.className = 'step-data';
            matrixDiv.innerHTML = `<strong>Matriz:</strong>`;
            matrixDiv.appendChild(this.renderMatrix(step.matrix));
            content.appendChild(matrixDiv);
        }

        if (step.vector) {
            const vectorDiv = document.createElement('div');
            vectorDiv.className = 'step-data';
            vectorDiv.innerHTML = `<strong>Vetor:</strong>`;
            vectorDiv.appendChild(this.renderVector(step.vector));
            content.appendChild(vectorDiv);
        }

        if (step.result !== undefined) {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'step-data';
            if (Array.isArray(step.result)) {
                resultDiv.innerHTML = `<strong>Resultado:</strong>`;
                resultDiv.appendChild(this.renderVector(step.result));
            } else {
                resultDiv.innerHTML = `<strong>Resultado:</strong> ${step.result}`;
            }
            content.appendChild(resultDiv);
        }

        stepDiv.appendChild(header);
        stepDiv.appendChild(content);

        return stepDiv;
    }

    renderMatrix(matrix) {
        const matrixDiv = document.createElement('div');
        matrixDiv.className = 'matrix-display';

        matrix.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'matrix-row';
            
            row.forEach(cell => {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'matrix-cell';
                cellDiv.textContent = cell;
                rowDiv.appendChild(cellDiv);
            });
            
            matrixDiv.appendChild(rowDiv);
        });

        return matrixDiv;
    }

    renderVector(vector) {
        const vectorDiv = document.createElement('div');
        vectorDiv.className = 'vector-display';

        vector.forEach(cell => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'vector-cell';
            cellDiv.textContent = cell;
            vectorDiv.appendChild(cellDiv);
        });

        return vectorDiv;
    }

    getStepIcon(stepType) {
        const icons = {
            'clean': '🧹',
            'convert': '🔢',
            'padding': '📏',
            'block': '📦',
            'multiply': '✖️',
            'determinant': '📐',
            'mod_inverse': '🔄',
            'inverse': '↩️',
            'adjugate': '🔀',
            'cofactors': '⚙️',
            'final': '✨',
            'error': '❌'
        };
        return icons[stepType] || '📝';
    }

    getStepColor(stepType) {
        const colors = {
            'clean': 'badge',
            'convert': 'badge',
            'padding': 'badge',
            'block': 'badge',
            'multiply': 'badge',
            'determinant': 'badge',
            'mod_inverse': 'badge',
            'inverse': 'badge',
            'adjugate': 'badge',
            'cofactors': 'badge',
            'final': 'badge valid',
            'error': 'badge invalid'
        };
        return colors[stepType] || 'badge';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HillCipherApp();
});