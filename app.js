// --- LÓGICA DE NAVEGACIÓN ENTRE PESTAÑAS ---
function switchTab(tab) {
    const secCifrado = document.getElementById('section-cifrado');
    const secAtaque = document.getElementById('section-ataque');
    const tabCifrado = document.getElementById('tab-cifrado');
    const tabAtaque = document.getElementById('tab-ataque');

    if (tab === 'cifrado') {
        secCifrado.classList.remove('hidden');
        secAtaque.classList.add('hidden');
        tabCifrado.className = "px-4 py-2 rounded-lg font-medium transition-all bg-blue-600 text-white shadow";
        tabAtaque.className = "px-4 py-2 rounded-lg font-medium transition-all text-slate-400 hover:text-white";
    } else {
        secAtaque.classList.remove('hidden');
        secCifrado.classList.add('hidden');
        tabAtaque.className = "px-4 py-2 rounded-lg font-medium transition-all bg-amber-600 text-white shadow";
        tabCifrado.className = "px-4 py-2 rounded-lg font-medium transition-all text-slate-400 hover:text-white";
    }
}

// --- NAVEGACIÓN ENTRE SUBMODOS DE CRIPTOANÁLISIS ---
function switchAttackMode(mode) {
    const modeConocido = document.getElementById('attack-mode-conocido');
    const modeInversa = document.getElementById('attack-mode-inversa');
    const btnConocido = document.getElementById('btn-mode-conocido');
    const btnInversa = document.getElementById('btn-mode-inversa');
    const resDiv = document.getElementById('attack-result');
    resDiv.classList.add('hidden');

    if (mode === 'conocido') {
        modeConocido.classList.remove('hidden');
        modeInversa.classList.add('hidden');
        btnConocido.className = "px-3 py-1.5 rounded-lg font-medium transition-all bg-amber-600 text-white shadow";
        btnInversa.className = "px-3 py-1.5 rounded-lg font-medium transition-all text-slate-400 hover:text-white";
    } else {
        modeInversa.classList.remove('hidden');
        modeConocido.classList.add('hidden');
        btnInversa.className = "px-3 py-1.5 rounded-lg font-medium transition-all bg-emerald-600 text-white shadow";
        btnConocido.className = "px-3 py-1.5 rounded-lg font-medium transition-all text-slate-400 hover:text-white";
    }
}

// --- UTILIDADES MATEMÁTICAS MÓDULO 26 ---
function mod(n, m) {
    return ((n % m) + m) % m;
}

function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

function modInverse(a, m) {
    a = mod(a, m);
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) return x;
    }
    return null;
}

function charToNum(c) {
    return c.toUpperCase().charCodeAt(0) - 65;
}
function numToChar(n) {
    return String.fromCharCode(mod(n, 26) + 65);
}

// --- GESTIÓN DE MATRICES EN UI ---
let currentSize = 2;

function changeMatrixSize() {
    currentSize = parseInt(document.getElementById('matrix-size').value);
    renderInverseMatrixInputs();
    let textVal = document.getElementById('input-text').value.toUpperCase().trim();
    if (textVal === "ENVIGADO") {
        if (currentSize === 2) {
            renderMatrixInputs([3, 3, 2, 5]);
        } else {
            renderMatrixInputs([6, 24, 1, 13, 16, 10, 20, 17, 15]);
        }
    } else {
        generateRandomValidMatrix();
    }
    processHillCipher();
}

function renderMatrixInputs(defaultValues = null) {
    const container = document.getElementById('matrix-container');
    container.innerHTML = '';
    
    const grid = document.createElement('div');
    grid.className = `grid gap-2 grid-cols-${currentSize}`;
    
    let defaults = defaultValues;
    if (!defaults) {
        if (currentSize === 2) defaults = [3, 3, 2, 5];
        else defaults = [6, 24, 1, 13, 16, 10, 20, 17, 15];
    }

    let idx = 0;
    for (let i = 0; i < currentSize; i++) {
        for (let j = 0; j < currentSize; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'matrix-input';
            input.value = defaults[idx++];
            input.dataset.row = i;
            input.dataset.col = j;
            input.oninput = processHillCipher;
            grid.appendChild(input);
        }
    }
    container.appendChild(grid);
}

function renderInverseMatrixInputs() {
    const container = document.getElementById('inverse-matrix-container');
    if (!container) return;
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = `grid gap-2 grid-cols-${currentSize}`;
    for (let row = 0; row < currentSize; row++) {
        for (let col = 0; col < currentSize; col++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'inv-matrix-input w-12 h-12 bg-slate-950 border border-slate-700 text-center text-emerald-300 font-bold rounded-lg font-mono text-sm focus:outline-none focus:border-emerald-500';
            input.value = row === col ? 1 : 0;
            input.dataset.row = row;
            input.dataset.col = col;
            grid.appendChild(input);
        }
    }
    container.appendChild(grid);
}

function getMatrixValues() {
    const inputs = document.querySelectorAll('.matrix-input');
    let matrix = [];
    for (let i = 0; i < currentSize; i++) {
        matrix.push([]);
        for (let j = 0; j < currentSize; j++) matrix[i].push(0);
    }
    inputs.forEach(input => {
        let r = parseInt(input.dataset.row);
        let c = parseInt(input.dataset.col);
        matrix[r][c] = parseInt(input.value) || 0;
    });
    return matrix;
}

function determinant(M) {
    let n = M.length;
    if (n === 1) return M[0][0];
    if (n === 2) return M[0][0] * M[1][1] - M[0][1] * M[1][0];
    let det = 0;
    for (let c = 0; c < n; c++) {
        let subM = M.slice(1).map(row => row.filter((_, colIdx) => colIdx !== c));
        det += Math.pow(-1, c) * M[0][c] * determinant(subM);
    }
    return det;
}

function isInvertibleMatrixModulo26(M) {
    return gcd(mod(determinant(M), 26), 26) === 1;
}

function getCofactorMatrix(M) {
    let n = M.length;
    let C = [];
    for (let i = 0; i < n; i++) {
        C.push([]);
        for (let j = 0; j < n; j++) {
            let subM = M.filter((_, rowIdx) => rowIdx !== i).map(row => row.filter((_, colIdx) => colIdx !== j));
            C[i][j] = Math.pow(-1, i + j) * determinant(subM);
        }
    }
    return C;
}

function transpose(M) {
    let n = M.length;
    let T = [];
    for (let i = 0; i < n; i++) {
        T.push([]);
        for (let j = 0; j < n; j++) T[i][j] = M[j][i];
    }
    return T;
}

// --- CÁLCULO Y DESGLOSE EXPLICATIVO DETALLADO PASO A PASO (Soporta 2x2 y 3x3) ---
function computeInverseMatrixDetailed(K) {
    let n = K.length;
    let det = determinant(K);
    let detMod = mod(det, 26);
    let invDet = modInverse(detMod, 26);

    let cofactor = getCofactorMatrix(K);
    let adj = transpose(cofactor);

    if (invDet === null) {
        return {
            success: false,
            matrix: null,
            html: `<div class="p-3 text-red-400 text-xs">El determinante es ${det} (${detMod} mod 26) y no es coprimo con 26. No posee inversa modular.</div>`
        };
    }

    let adjHtml = `<div class="inline-grid gap-1 grid-cols-${n} bg-slate-950 p-2.5 rounded-lg border border-slate-800 my-2">`;
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            adjHtml += `<div class="w-9 h-9 flex items-center justify-center bg-slate-900 text-blue-300 rounded font-bold text-xs">${adj[r][c]}</div>`;
        }
    }
    adjHtml += `</div>`;

    let invK = [];
    let scalarStepsHtml = `<div class="space-y-2 mt-2 text-[11px] text-slate-300 font-mono">`;
    
    for (let i = 0; i < n; i++) {
        invK.push([]);
        for (let j = 0; j < n; j++) {
            let adjVal = adj[i][j];
            let rawProd = adjVal * invDet;
            let finalVal = mod(rawProd, 26);
            invK[i][j] = finalVal;
            
            let explanation = "";
            if (rawProd < 0) {
                let ciclos = Math.ceil(Math.abs(rawProd) / 26);
                let numSumado = ciclos * 26;
                explanation = ` (Como es negativo, sumamos múltiplos de 26: ${rawProd} + ${numSumado} = <strong>${finalVal}</strong>)`;
            } else if (rawProd >= 26) {
                explanation = ` (Reduciendo por ciclos de 26: ${rawProd} - ${Math.floor(rawProd/26)*26} = <strong>${finalVal}</strong>)`;
            } else {
                explanation = ` (Ya está en el rango de 0 a 25)`;
            }

            scalarStepsHtml += `<div class="bg-slate-900/60 p-2 rounded border border-slate-800/60">• Posición (${i+1},${j+1}): (${adjVal} × ${invDet}) =${rawProd} ➔ mod 26 ➔ <strong class="text-emerald-400">${finalVal}</strong>${explanation}</div>`;
        }
    }
    scalarStepsHtml += `</div>`;

    let invHtml = `<div class="inline-grid gap-1 grid-cols-${n} bg-slate-950 p-2.5 rounded-lg border border-emerald-500/30 my-2">`;
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            invHtml += `<div class="w-9 h-9 flex items-center justify-center bg-slate-900 text-emerald-300 rounded font-bold text-xs">${invK[r][c]}</div>`;
        }
    }
    invHtml += `</div>`;

    let detExplanation = "";
    if (Math.abs(det) > 26) {
        let q = Math.floor(det / 26);
        let residuo = mod(det, 26);
        detExplanation = ` Como es un número grande, dividimos entre 26: ${det} = 26 × (${q}) + (${residuo}), por lo tanto el residuo positivo equivalente es <strong>${detMod}</strong>.`;
    } else if (det < 0) {
        detExplanation = ` Al ser negativo, le sumamos múltiplos de 26 hasta obtener un residuo positivo en Z26: <strong>${detMod}</strong>.`;
    } else {
        detExplanation = ` Ya se encuentra en el rango modular válido.`;
    }

    let detailedHtml = `
        <div class="space-y-3 text-xs font-mono bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            
            <div class="border-b border-slate-800 pb-2.5 space-y-1">
                <span class="text-blue-400 font-bold block">Paso 1: Cálculo del Determinante y Reducción Módulo 26</span>
                <p class="text-slate-300 text-[11px]">
                    Se calcula el determinante tradicional de la matriz clave K: <strong class="text-white">Determinante = ${det}</strong>.<br>
                    Reducción modular: <code class="text-amber-300">${det} mod 26 = <strong>${detMod}</strong></code>.${detExplanation}
                </p>
            </div>

            <div class="border-b border-slate-800 pb-2.5 space-y-1">
                <span class="text-blue-400 font-bold block">Paso 2: Inverso Multiplicativo Modular del Determinante</span>
                <p class="text-slate-300 text-[11px]">
                    Buscamos un número x tal que <code class="text-amber-300">(${detMod} × x) mod 26 = 1</code>.<br>
                    El valor hallado es <strong class="text-emerald-400">${invDet}</strong> (ya que ${detMod} ×${invDet} = ${detMod * invDet}, y${detMod * invDet} mod 26 = 1).
                </p>
            </div>

            <div class="border-b border-slate-800 pb-2.5 space-y-1">
                <span class="text-blue-400 font-bold block">Paso 3: Construcción de la Matriz Adjunta (Cofactores Transpuesta)</span>
                <p class="text-slate-300 text-[11px]">
                    Se obtienen cofactores con signos alternados y se transpone para formar la Matriz Adjunta:
                </p>
                <div class="flex justify-center">${adjHtml}</div>
            </div>

            <div class="space-y-1">
                <span class="text-blue-400 font-bold block">Paso 4: Multiplicación Escalar (Matriz Inversa = Adjunta × ${invDet} mod 26)</span>
                <p class="text-slate-300 text-[11px]">
                    Multiplicamos el escalar (${invDet}) por cada componente de la adjunta y aplicamos mod 26 detalladamente:
                </p>
                ${scalarStepsHtml}
                <p class="text-slate-300 text-[11px] pt-1">Matriz Inversa Definitiva (K⁻¹):</p>
                <div class="flex justify-center">${invHtml}</div>
            </div>

        </div>
    `;

    return {
        success: true,
        matrix: invK,
        html: detailedHtml
    };
}

function multiplyMatrixVector(M, V) {
    let n = M.length;
    let res = [];
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) sum += M[i][j] * V[j];
        res.push(sum);
    }
    return res;
}

// --- GENERADOR ALEATORIO ESTRICTO (gcd = 1) ---
function generateRandomValidMatrix() {
    let size = currentSize;
    let K = [];
    let isValid = false;
    
    while (!isValid) {
        K = [];
        for (let i = 0; i < size; i++) {
            let row = [];
            for (let j = 0; j < size; j++) {
                row.push(Math.floor(Math.random() * 25) + 1);
            }
            K.push(row);
        }
        if (isInvertibleMatrixModulo26(K)) {
            isValid = true;
        }
    }
    
    let flatValues = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            flatValues.push(K[i][j]);
        }
    }
    renderMatrixInputs(flatValues);
}

// --- MANEJADOR INTELIGENTE DE ENTRADA ---
let lastProcessedText = "";

function handleTextInput() {
    let textVal = document.getElementById('input-text').value.toUpperCase().trim();
    
    if (textVal === "ENVIGADO") {
        if (currentSize === 2) {
            renderMatrixInputs([3, 3, 2, 5]);
        } else {
            renderMatrixInputs([6, 24, 1, 13, 16, 10, 20, 17, 15]);
        }
    } else if (textVal !== lastProcessedText && textVal.length > 0) {
        generateRandomValidMatrix();
    }
    
    lastProcessedText = textVal;
    processHillCipher();
}

// --- NÚCLEO DE PROCESAMIENTO ---
function processHillCipher() {
    const K = getMatrixValues();
    const det = determinant(K);
    const detMod = mod(det, 26);
    const statusDiv = document.getElementById('matrix-status');
    const isInv = isInvertibleMatrixModulo26(K);

    if (!isInv) {
        statusDiv.className = "mt-4 p-3 rounded-xl border bg-red-950/30 border-red-500/30 text-red-400 flex items-center gap-2 text-xs";
        statusDiv.innerHTML = `<i data-lucide="alert-triangle" class="w-4 h-4 shrink-0"></i> <span><strong>Clave no válida:</strong> Determinante = ${det} (${detMod} mod 26). El MCD con 26 es diferente de 1. No tiene inversa modular.</span>`;
        document.getElementById('cipher-output').innerText = "ERROR (No Invertible)";
        document.getElementById('decipher-output').innerText = "ERROR (No Invertible)";
        document.getElementById('steps-table-body').innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-400">Matriz no invertible módulo 26.</td></tr>`;
        document.getElementById('ai-explanation-container').innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Corrige la matriz clave.</p>`;
        document.getElementById('inverse-preview').innerHTML = `<span class="text-red-400">No existe inversa (el determinante no es coprimo con 26).</span>`;
        lucide.createIcons();
        return;
    }

    statusDiv.className = "mt-4 p-3 rounded-xl border bg-emerald-950/30 border-emerald-500/30 text-emerald-400 flex items-center gap-2 text-xs";
    statusDiv.innerHTML = `<i data-lucide="check-circle-2" class="w-4 h-4 shrink-0"></i> <span><strong>Clave Válida:</strong> Determinante = ${det} (${detMod} mod 26), MCD = 1. Matriz lista para cifrar.</span>`;

    const invResult = computeInverseMatrixDetailed(K);
    document.getElementById('inverse-preview').innerHTML = invResult.html;
    const invK = invResult.matrix;

    let rawText = document.getElementById('input-text').value.toUpperCase().replace(/[^A-Z]/g, '');
    if (!rawText) {
        document.getElementById('cipher-output').innerText = "-";
        document.getElementById('decipher-output').innerText = "-";
        document.getElementById('vector-preview').innerText = "-";
        document.getElementById('steps-table-body').innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500">Ingresa texto (A-Z).</td></tr>`;
        document.getElementById('ai-explanation-container').innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Esperando texto...</p>`;
        lucide.createIcons();
        return;
    }

    while (rawText.length % currentSize !== 0) rawText += 'X';

    let vectors = [];
    for (let i = 0; i < rawText.length; i += currentSize) {
        let v = [];
        for (let j = 0; j < currentSize; j++) v.push(charToNum(rawText[i + j]));
        vectors.push(v);
    }

    document.getElementById('vector-preview').innerText = vectors.map(v => `(${v.join(',')})`).join(' ');

    let cipherText = "";
    let tableHtml = "";
    let explanationHtml = "";

    vectors.forEach((v, blockIdx) => {
        let blockLetters = v.map(n => numToChar(n)).join('');
        let mult = multiplyMatrixVector(K, v);
        let modRes = mult.map(n => mod(n, 26));
        let cipherLetters = modRes.map(n => numToChar(n)).join('');
        cipherText += cipherLetters;

        tableHtml += `
            <tr class="hover:bg-slate-800/40">
                <td class="p-3 font-semibold text-blue-400">${blockLetters}</td>
                <td class="p-3">(${v.join(', ')})</td>
                <td class="p-3">(${mult.join(', ')})</td>
                <td class="p-3 text-amber-300">(${modRes.join(', ')})</td>
                <td class="p-3 font-semibold text-emerald-400">${cipherLetters}</td>
            </tr>
        `;

        let rowsDetailHtml = "";
        for (let i = 0; i < currentSize; i++) {
            let rowEquation = K[i].map((val, j) => `(${val} ×${v[j]})`).join(' + ');
            let rawSum = mult[i];
            let modVal = modRes[i];
            let targetChar = numToChar(modVal);

            let modExplanation = "";
            if (rawSum >= 26) {
                let ciclos = Math.floor(rawSum / 26);
                modExplanation = `Reducción: el resultado ${rawSum} excede 26, restamos ${ciclos} ciclo(s) de 26 ➔${rawSum} - ${ciclos * 26} = <strong>${modVal}</strong>`;
            } else {
                modExplanation = `Ya está en el rango válido de 0 a 25`;
            }

            rowsDetailHtml += `
                <div class="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 text-xs font-mono space-y-1">
                    <div class="flex justify-between items-center text-slate-300">
                        <span>Fila ${i+1}:${rowEquation} = <strong class="text-white">${rawSum}</strong></span>
                        <span class="text-amber-300">${rawSum} mod 26 ➔ <strong class="text-emerald-400">${modVal}</strong> (${targetChar})</span>
                    </div>
                    <div class="text-[10px] text-slate-400 pl-2 border-l-2 border-blue-500/40">
                        Explicación: ${modExplanation}
                    </div>
                </div>
            `;
        }

        let matrixTableHtml = `<div class="inline-grid gap-1 grid-cols-${currentSize} bg-slate-950 p-2 rounded-lg border border-blue-500/30">`;
        for (let r = 0; r < currentSize; r++) {
            for (let c = 0; c < currentSize; c++) {
                matrixTableHtml += `<div class="w-8 h-8 flex items-center justify-center bg-slate-900 text-blue-300 rounded font-bold text-xs">${K[r][c]}</div>`;
            }
        }
        matrixTableHtml += `</div>`;

        let vectorTableHtml = `<div class="inline-grid gap-1 grid-cols-1 bg-slate-950 p-2 rounded-lg border border-purple-500/30">`;
        v.forEach(val => {
            vectorTableHtml += `<div class="w-8 h-8 flex items-center justify-center bg-slate-900 text-purple-300 rounded font-bold text-xs">${val}</div>`;
        });
        vectorTableHtml += `</div>`;

        let translationSteps = v.map((val, idx) => `<strong>${blockLetters[idx]}</strong> =${val}`).join(', ');

        explanationHtml += `
            <div class="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-semibold text-blue-400 border-b border-slate-800 pb-2 gap-1">
                    <span>Bloque #${blockIdx + 1}: Letras <span class="text-white font-bold">"${blockLetters}"</span></span>
                    <span class="text-slate-400 text-[11px]">Traducción Z26: (${translationSteps})</span>
                </div>
                
                <div class="flex flex-col md:flex-row items-center justify-center gap-4 py-2 bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
                    <div class="text-center">
                        <span class="text-[10px] text-slate-400 block mb-1">Matriz Clave (K)</span>
                        ${matrixTableHtml}
                    </div>
                    <span class="text-slate-500 font-bold text-lg">×</span>
                    <div class="text-center">
                        <span class="text-[10px] text-slate-400 block mb-1">Vector Plano (p)</span>
                        ${vectorTableHtml}
                    </div>
                    <span class="text-slate-500 font-bold text-lg">=</span>
                    <div class="w-full md:w-auto flex-1 space-y-2">
                        <span class="text-[10px] text-slate-400 block mb-1">Cálculo Fila por Fila (K · p) y Módulo 26 Detallado:</span>
                        ${rowsDetailHtml}
                    </div>
                </div>

                <div class="text-xs text-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800 gap-2">
                    <span>Vector Cifrado: <strong class="text-amber-300">[${mult.join(', ')}] mod 26 = [${modRes.join(', ')}]</strong></span>
                    <span class="text-emerald-400 font-bold uppercase tracking-wider text-sm">Letras Finales: ${cipherLetters}</span>
                </div>
            </div>
        `;
    });

    document.getElementById('cipher-output').innerText = cipherText;
    document.getElementById('steps-table-body').innerHTML = tableHtml;
    document.getElementById('ai-explanation-container').innerHTML = explanationHtml;

    let decipherText = "";
    vectors.forEach(v => {
        let mult = multiplyMatrixVector(K, v);
        let modRes = mult.map(n => mod(n, 26));
        let origVector = multiplyMatrixVector(invK, modRes).map(n => mod(n, 26));
        decipherText += origVector.map(n => numToChar(n)).join('');
    });

    document.getElementById('decipher-output').innerText = decipherText;
    lucide.createIcons();
}

// Cargar Ejemplo Fijo
function loadExample() {
    let size = parseInt(document.getElementById('matrix-size').value);
    if (size === 2) {
        renderMatrixInputs([3, 3, 2, 5]);
    } else {
        renderMatrixInputs([6, 24, 1, 13, 16, 10, 20, 17, 15]);
    }
    document.getElementById('input-text').value = "ENVIGADO";
    lastProcessedText = "ENVIGADO";
    processHillCipher();
}

// --- CRIPTOANÁLISIS PASO A PASO (TEXTO PLANO CONOCIDO) ---
function runCryptanalysisLegacy() {
    if (currentSize !== 2) {
        alert("El criptoanálisis interactivo está configurado para matrices de orden 2x2.");
        return;
    }

    let knownPlain = document.getElementById('known-plain').value.toUpperCase().replace(/[^A-Z]/g, '');
    let knownCipher = document.getElementById('known-cipher').value.toUpperCase().replace(/[^A-Z]/g, '');
    let fullCipher = document.getElementById('full-intercepted-cipher').value.toUpperCase().replace(/[^A-Z]/g, '');

    if (knownPlain.length < 4 || knownCipher.length !== knownPlain.length || knownPlain.length % 2 !== 0) {
        alert("Ingresa al menos 4 letras en bloques completos de 2, y asegúrate de que el texto cifrado tenga la misma longitud.");
        return;
    }

    const resDiv = document.getElementById('attack-result');
    resDiv.classList.remove('hidden');
    document.getElementById('attack-result-title').innerText = "Desglose del Criptoanálisis (Cálculo de K = C · P⁻¹)";
    const stepsContainer = document.getElementById('attack-steps-container');

    const findInvertibleBlockPair = (text) => {
        for (let first = 0; first < text.length; first += 2) {
            for (let second = first + 2; second < text.length; second += 2) {
                let candidateP = [
                    [charToNum(text[first]), charToNum(text[second])],
                    [charToNum(text[first + 1]), charToNum(text[second + 1])]
                ];
                if (isInvertibleMatrixModulo26(candidateP)) {
                    return { first, second, P: candidateP };
                }
            }
        }
        return null;
    };

    let selectedBlocks = findInvertibleBlockPair(knownPlain);
    let usedCurrentMessage = false;
    if (!selectedBlocks) {
        let currentPlain = document.getElementById('input-text').value.toUpperCase().replace(/[^A-Z]/g, '');
        let currentCipher = document.getElementById('cipher-output').innerText.replace(/[^A-Z]/g, '');
        while (currentPlain.length % 2 !== 0) currentPlain += 'X';

        if (currentPlain.startsWith(knownPlain) && currentCipher.startsWith(knownCipher) &&
            fullCipher === currentCipher && currentPlain.length === currentCipher.length) {
            knownPlain = currentPlain;
            knownCipher = currentCipher;
            selectedBlocks = findInvertibleBlockPair(knownPlain);
            usedCurrentMessage = Boolean(selectedBlocks);
        }
    }

    if (!selectedBlocks) {
        stepsContainer.innerHTML = `<div class="p-4 bg-amber-950/60 text-amber-200 rounded border border-amber-700 text-xs"><strong>El cifrado funciona correctamente.</strong> Estos datos todavía no permiten determinar una clave única: hacen falta más bloques de texto plano y su cifrado correspondiente, o dos bloques cuya matriz tenga determinante coprimo con 26. Los valores individuales no tienen que ser impares.</div>`;
        return;
    }

    let plainBlocks = [selectedBlocks.first, selectedBlocks.second];
    let plain = plainBlocks.map(index => knownPlain.slice(index, index + 2)).join('');
    let cipher = plainBlocks.map(index => knownCipher.slice(index, index + 2)).join('');
    let [p1_val, p3_val] = [charToNum(plain[0]), charToNum(plain[2])];
    let [p2_val, p4_val] = [charToNum(plain[1]), charToNum(plain[3])];
    let [c1_val, c3_val] = [charToNum(cipher[0]), charToNum(cipher[2])];
    let [c2_val, c4_val] = [charToNum(cipher[1]), charToNum(cipher[3])];
    let P = selectedBlocks.P;
    let C = [
        [c1_val, c3_val],
        [c2_val, c4_val]
    ];

    let pHtml = `<div class="inline-grid gap-1 grid-cols-2 bg-slate-950 p-2 rounded border border-blue-500/30 text-blue-300 font-mono text-center">
        <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${P[0][0]}</div>
        <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${P[0][1]}</div>
        <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${P[1][0]}</div>
        <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${P[1][1]}</div>
    </div>`;

    let cHtml = `<div class="inline-grid gap-1 grid-cols-2 bg-slate-950 p-2 rounded border border-amber-500/30 text-amber-300 font-mono text-center">
        <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${C[0][0]}</div>
        <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${C[0][1]}</div>
        <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${C[1][0]}</div>
        <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${C[1][1]}</div>
    </div>`;

    let stepsHtml = `
        <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
            <span class="text-blue-400 font-bold block text-sm">Paso 1: Construcción detallada de las Matrices de Texto Plano (P) y Cifrado (C)</span>
            <p class="text-slate-300 text-xs leading-relaxed">
                ${usedCurrentMessage ? `Los primeros bloques proporcionados no bastaban para invertir P, por lo que se usó el texto de entrada completo (${knownPlain}) y su cifrado visible (${knownCipher}), que coinciden con los prefijos indicados.` : `Convertimos las letras conocidas del texto plano (<strong class="text-white">${plain}</strong>) y del texto cifrado (<strong class="text-amber-300">${cipher}</strong>) a valores numéricos usando la tabla Z26 y los organizamos en columnas vectoriales de orden 2x2:`}<br>
                • <strong>Matriz Plano (P):</strong> Bloque 1 (<code class="text-blue-300">${plain[0]}=${p1_val}, ${plain[1]}=${p2_val}</code>) forma la <strong>Columna 1</strong>. Bloque 2 (<code class="text-blue-300">${plain[2]}=${p3_val}, ${plain[3]}=${p4_val}</code>) forma la <strong>Columna 2</strong>.<br>
                • <strong>Matriz Cifrado (C):</strong> Bloque 1 (<code class="text-amber-300">${cipher[0]}=${c1_val}, ${cipher[1]}=${c2_val}</code>) forma la <strong>Columna 1</strong>. Bloque 2 (<code class="text-amber-300">${cipher[2]}=${c3_val}, ${cipher[3]}=${c4_val}</code>) forma la <strong>Columna 2</strong>.
            </p>
            <div class="flex flex-wrap items-center justify-around gap-4 pt-2 text-xs">
                <div><span>Matriz Plano (P):</span><div class="mt-1">${pHtml}</div></div>
                <div><span>Matriz Cifrado (C):</span><div class="mt-1">${cHtml}</div></div>
            </div>
        </div>
    `;

    let detP = determinant(P);
    let detPMod = mod(detP, 26);
    let invDetP = modInverse(detPMod, 26);

    if (invDetP === null || !isInvertibleMatrixModulo26(P)) {
        stepsHtml += `<div class="p-3 bg-amber-950/60 text-amber-200 rounded border border-amber-700 text-xs">Los bloques seleccionados no permiten invertir P módulo 26. El cifrado de Hill sí es válido; para recuperar la clave se requiere otro par de bloques conocido.</div>`;
        stepsContainer.innerHTML = stepsHtml;
        return;
    }

    let cofactorP = getCofactorMatrix(P);
    let adjP = transpose(cofactorP);

    let adjPHtml = `<div class="inline-grid gap-1 grid-cols-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 my-2">`;
    for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
            adjPHtml += `<div class="w-9 h-9 flex items-center justify-center bg-slate-900 text-blue-300 rounded font-bold text-xs">${adjP[r][c]}</div>`;
        }
    }
    adjPHtml += `</div>`;

    let invP = [];
    let scalarStepsP = `<div class="space-y-2 mt-2 text-[11px] text-slate-300 font-mono">`;
    for (let i = 0; i < 2; i++) {
        invP.push([]);
        for (let j = 0; j < 2; j++) {
            let adjVal = adjP[i][j];
            let rawProd = adjVal * invDetP;
            let finalVal = mod(rawProd, 26);
            invP[i][j] = finalVal;

            let explanation = "";
            if (rawProd < 0) {
                let ciclos = Math.ceil(Math.abs(rawProd) / 26);
                explanation = ` (Como es negativo, sumamos múltiplos de 26: ${rawProd} + ${ciclos * 26} = <strong>${finalVal}</strong>)`;
            } else if (rawProd >= 26) {
                explanation = ` (Reduciendo por ciclos de 26: ${rawProd} - ${Math.floor(rawProd/26)*26} = <strong>${finalVal}</strong>)`;
            } else {
                explanation = ` (Ya está en el rango de 0 a 25)`;
            }

            scalarStepsP += `<div class="bg-slate-900/60 p-2 rounded border border-slate-800/60">• Posición (${i+1},${j+1}): (${adjVal} × ${invDetP}) =${rawProd} ➔ mod 26 ➔ <strong class="text-emerald-400">${finalVal}</strong>${explanation}</div>`;
        }
    }
    scalarStepsP += `</div>`;

    let invPHtml = `<div class="inline-grid gap-1 grid-cols-2 bg-slate-950 p-2.5 rounded-lg border border-emerald-500/30 my-2">`;
    for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
            invPHtml += `<div class="w-9 h-9 flex items-center justify-center bg-slate-900 text-emerald-300 rounded font-bold text-xs">${invP[r][c]}</div>`;
        }
    }
    invPHtml += `</div>`;

    let detPExplanation = "";
    if (Math.abs(detP) > 26) {
        let q = Math.floor(detP / 26);
        let residuo = mod(detP, 26);
        detPExplanation = ` Como es un número grande, dividimos entre 26: ${detP} = 26 × (${q}) + (${residuo}), residuo positivo equivalente es <strong>${detPMod}</strong>.`;
    } else if (detP < 0) {
        detPExplanation = ` Al ser negativo, le sumamos múltiplos de 26 hasta obtener un residuo positivo en Z26: <strong>${detPMod}</strong>.`;
    } else {
        detPExplanation = ` Ya se encuentra en el rango modular válido.`;
    }

    stepsHtml += `
        <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <span class="text-blue-400 font-bold block text-sm">Paso 2: Cálculo Detallado de la Matriz Inversa del Texto Plano (P⁻¹ mod 26)</span>
            <div class="border-b border-slate-800 pb-2 space-y-1">
                <span class="text-blue-300 font-bold block">• Determinante y Reducción Módulo 26:</span>
                <p class="text-slate-300 text-[11px]"><code>(${P[0][0]} × ${P[1][1]}) - (${P[0][1]} × ${P[1][0]}) =${detP}</code>. Reducción: <code class="text-amber-300">${detP} mod 26 = <strong>${detPMod}</strong></code>.${detPExplanation}</p>
            </div>
            <div class="border-b border-slate-800 pb-2 space-y-1">
                <span class="text-blue-300 font-bold block">• Inverso Multiplicativo Modular:</span>
                <p class="text-slate-300 text-[11px]">Valor hallado: <strong class="text-emerald-400">${invDetP}</strong> (ya que ${detPMod} ×${invDetP} ≡ 1 mod 26).</p>
            </div>
            <div class="border-b border-slate-800 pb-2 space-y-1">
                <span class="text-blue-300 font-bold block">• Matriz Adjunta de P:</span>
                <div class="flex justify-center">${adjPHtml}</div>
            </div>
            <div class="space-y-1">
                <span class="text-blue-300 font-bold block">• Multiplicación Escalar:</span>
                ${scalarStepsP}
                <p class="text-slate-300 text-[11px] pt-1">Matriz Inversa Definitiva (P⁻¹):</p>
                <div class="flex justify-center">${invPHtml}</div>
            </div>
        </div>
    `;

    let K_recovered = [
        [
            mod(C[0][0] * invP[0][0] + C[0][1] * invP[1][0], 26),
            mod(C[0][0] * invP[0][1] + C[0][1] * invP[1][1], 26)
        ],
        [
            mod(C[1][0] * invP[0][0] + C[1][1] * invP[1][0], 26),
            mod(C[1][0] * invP[0][1] + C[1][1] * invP[1][1], 26)
        ]
    ];

    let knownPairsMatch = true;
    for (let i = 0; i < knownPlain.length; i += 2) {
        let plainVector = [charToNum(knownPlain[i]), charToNum(knownPlain[i + 1])];
        let expectedCipherVector = [charToNum(knownCipher[i]), charToNum(knownCipher[i + 1])];
        let calculatedCipherVector = multiplyMatrixVector(K_recovered, plainVector).map(value => mod(value, 26));
        if (calculatedCipherVector[0] !== expectedCipherVector[0] || calculatedCipherVector[1] !== expectedCipherVector[1]) {
            knownPairsMatch = false;
            break;
        }
    }

    if (!knownPairsMatch) {
        stepsContainer.innerHTML = `<div class="p-4 bg-amber-950/60 text-amber-200 rounded border border-amber-700 text-xs">Los pares de texto plano y cifrado no corresponden todos a la misma clave Hill. Verifica que ambos textos estén alineados y que el cifrado sea correcto.</div>`;
        return;
    }

    let detK = determinant(K_recovered);
    let detKMod = mod(detK, 26);
    let invDetK = modInverse(detKMod, 26);

    let matrixHtml = `<div class="inline-grid gap-1 grid-cols-2 bg-slate-950 p-2.5 rounded border border-amber-500/30 text-amber-300 font-mono text-center">
        <div class="w-9 h-9 flex items-center justify-center bg-slate-900 rounded font-bold text-sm">${K_recovered[0][0]}</div>
        <div class="w-9 h-9 flex items-center justify-center bg-slate-900 rounded font-bold text-sm">${K_recovered[0][1]}</div>
        <div class="w-9 h-9 flex items-center justify-center bg-slate-900 rounded font-bold text-sm">${K_recovered[1][0]}</div>
        <div class="w-9 h-9 flex items-center justify-center bg-slate-900 rounded font-bold text-sm">${K_recovered[1][1]}</div>
    </div>`;

    let multStepsHtml = `<div class="space-y-2 mt-2 text-[11px] text-slate-300 font-mono">`;
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            let term1 = C[i][0] * invP[0][j];
            let term2 = C[i][1] * invP[1][j];
            let rawSum = term1 + term2;
            let finalVal = K_recovered[i][j];
            let explanation = rawSum >= 26 ? ` (Reduciendo: ${rawSum} - ${Math.floor(rawSum/26)*26} = <strong>${finalVal}</strong>)` : ``;
            multStepsHtml += `<div class="bg-slate-900/60 p-2 rounded border border-slate-800/60">• Posición (${i+1},${j+1}): (${C[i][0]} × ${invP[0][j]}) + (${C[i][1]} × ${invP[1][j]}) =${term1} + ${term2} =${rawSum} ➔ mod 26 ➔ <strong class="text-amber-300">${finalVal}</strong>${explanation}</div>`;
        }
    }
    multStepsHtml += `</div>`;

    stepsHtml += `
        <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <span class="text-blue-400 font-bold block text-sm">Paso 3: Despeje Matricial Detallado de la Clave Secreta (K = C · P⁻¹ mod 26)</span>
            <div class="flex flex-wrap items-center justify-center gap-2 py-1">
                <div><span>C:</span>${cHtml}</div><span class="text-slate-400 font-bold">×</span>
                <div><span>P⁻¹:</span>${invPHtml}</div><span class="text-slate-400 font-bold">=</span>
                <div><span>K:</span>${matrixHtml}</div>
            </div>
            <div class="pt-2"><span class="text-blue-300 font-bold block mb-1">• Desglose de cálculo celda por celda:</span>${multStepsHtml}</div>
            <p class="text-center ${invDetK !== null ? 'text-emerald-400' : 'text-amber-200'} text-xs font-bold pt-2">${invDetK !== null ? 'Matriz clave recuperada y válida para el cifrado Hill.' : `Matriz recuperada, pero no es una clave Hill válida: det = ${detK}, det mod 26 = ${detKMod}; no tiene inversa módulo 26.`}</p>
        </div>
    `;

    if (fullCipher.length >= 2 && invDetK !== null) {
        while (fullCipher.length % 2 !== 0) fullCipher += 'X';
        let adjK = [
            [K_recovered[1][1], -K_recovered[0][1]],
            [-K_recovered[1][0], K_recovered[0][0]]
        ];
        let invK = [
            [mod(invDetK * adjK[0][0], 26), mod(invDetK * adjK[0][1], 26)],
            [mod(invDetK * adjK[1][0], 26), mod(invDetK * adjK[1][1], 26)]
        ];

            let invK_matrixHtml = `<div class="inline-grid gap-1 grid-cols-2 bg-slate-950 p-2 rounded border border-emerald-500/30 text-emerald-300 font-mono text-center">
                <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${invK[0][0]}</div>
                <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${invK[0][1]}</div>
                <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${invK[1][0]}</div>
                <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${invK[1][1]}</div>
            </div>`;

            let decryptedMessage = "";
            let blocksDetailHtml = "";

            for (let i = 0; i < fullCipher.length; i += 2) {
                let c1_char = fullCipher[i];
                let c2_char = fullCipher[i+1];
                let c1_val = charToNum(c1_char);
                let c2_val = charToNum(c2_char);

                let term1_1 = invK[0][0] * c1_val;
                let term1_2 = invK[0][1] * c2_val;
                let rawSum1 = term1_1 + term1_2;
                let p1_val = mod(rawSum1, 26);

                let term2_1 = invK[1][0] * c1_val;
                let term2_2 = invK[1][1] * c2_val;
                let rawSum2 = term2_1 + term2_2;
                let p2_val = mod(rawSum2, 26);

                let char1 = numToChar(p1_val);
                let char2 = numToChar(p2_val);
                decryptedMessage += char1 + char2;

                let vecHtml = `<div class="inline-grid gap-1 grid-cols-1 bg-slate-950 p-1.5 rounded border border-amber-500/30 text-amber-300 font-mono text-center">
                    <div class="w-7 h-7 flex items-center justify-center bg-slate-900 rounded text-xs">${c1_val}</div>
                    <div class="w-7 h-7 flex items-center justify-center bg-slate-900 rounded text-xs">${c2_val}</div>
                </div>`;

                blocksDetailHtml += `
                    <div class="bg-slate-950/90 p-3 rounded-lg border border-slate-800 space-y-2">
                        <div class="flex justify-between items-center text-blue-400 font-bold border-b border-slate-800 pb-1">
                            <span>Bloque #${(i/2)+1}: Cifrado "<span class="text-amber-300">${c1_char}${c2_char}</span>" ➔ Vector [${c1_val},${c2_val}]ᵀ</span>
                            <span class="text-emerald-400 uppercase">Resultado: ${char1}${char2}</span>
                        </div>
                        <div class="flex flex-wrap items-center justify-center gap-2 py-1">
                            <div><span class="text-[10px] text-slate-400 block mb-0.5">K⁻¹</span>${invK_matrixHtml}</div>
                            <span class="text-slate-500 font-bold">×</span>
                            <div><span class="text-[10px] text-slate-400 block mb-0.5">Vector c</span>${vecHtml}</div>
                            <span class="text-slate-500 font-bold">=</span>
                            <div class="text-xs text-slate-300 space-y-1 font-mono">
                                <div>Fila 1: (${invK[0][0]} × ${c1_val}) + (${invK[0][1]} × ${c2_val}) =${term1_1} + ${term1_2} =${rawSum1} mod 26 ➔ <strong class="text-emerald-400">${p1_val}</strong> (${char1})</div>
                                <div>Fila 2: (${invK[1][0]} × ${c1_val}) + (${invK[1][1]} × ${c2_val}) =${term2_1} + ${term2_2} =${rawSum2} mod 26 ➔ <strong class="text-emerald-400">${p2_val}</strong> (${char2})</div>
                            </div>
                        </div>
                    </div>
                `;
            }

        stepsHtml += `
            <div class="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30 space-y-3 font-mono text-xs">
                <span class="text-emerald-400 font-bold block text-sm">Paso 4: Descifrado Detallado Bloque por Bloque (p = K⁻¹ · c mod 26)</span>
                <div class="space-y-2">${blocksDetailHtml}</div>
                <p class="font-mono text-white text-base font-bold tracking-widest bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center uppercase mt-2">
                    MENSAJE ORIGINAL REVELADO: ${decryptedMessage}
                </p>
            </div>
        `;
    } else if (fullCipher.length >= 2) {
        stepsHtml += `<div class="p-3 bg-amber-950/60 text-amber-200 rounded border border-amber-700 text-xs">No se puede descifrar el mensaje interceptado porque la clave recuperada no tiene inversa módulo 26.</div>`;
    }

    stepsContainer.innerHTML = stepsHtml;
    lucide.createIcons();
}

function renderAttackMatrix(matrix, color = "blue") {
    const size = matrix.length;
    const colorClass = color === "amber" ? "text-amber-300 border-amber-500/30" :
        color === "emerald" ? "text-emerald-300 border-emerald-500/30" :
        "text-blue-300 border-blue-500/30";
    return `<div class="inline-grid gap-1 grid-cols-${size} bg-slate-950 p-2 rounded border ${colorClass} font-mono text-center">${
        matrix.flat().map(value => `<div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${value}</div>`).join('')
    }</div>`;
}

function invertMatrixModulo26(matrix) {
    const determinantValue = determinant(matrix);
    const inverseDeterminant = modInverse(mod(determinantValue, 26), 26);
    if (inverseDeterminant === null) return null;
    const adjugate = transpose(getCofactorMatrix(matrix));
    return adjugate.map(row => row.map(value => mod(value * inverseDeterminant, 26)));
}

function multiplyMatricesModulo26(left, right) {
    const size = left.length;
    return Array.from({ length: size }, (_, row) =>
        Array.from({ length: size }, (_, column) =>
            mod(left[row].reduce((sum, value, index) => sum + value * right[index][column], 0), 26)
        )
    );
}

function encryptTextWithMatrix(text, matrix) {
    const size = matrix.length;
    const paddedText = text.padEnd(text.length + mod(-text.length, size), 'X');
    let encrypted = '';
    for (let offset = 0; offset < paddedText.length; offset += size) {
        const vector = Array.from(paddedText.slice(offset, offset + size), charToNum);
        encrypted += multiplyMatrixVector(matrix, vector).map(value => numToChar(value)).join('');
    }
    return encrypted;
}

function findInvertibleBlockSet(text, size) {
    const blocks = [];
    for (let offset = 0; offset + size <= text.length; offset += size) {
        blocks.push(Array.from(text.slice(offset, offset + size), charToNum));
    }
    if (blocks.length < size) return null;

    const selected = [];
    let result = null;
    const choose = (start) => {
        if (selected.length === size) {
            const matrix = Array.from({ length: size }, (_, row) =>
                selected.map(blockIndex => blocks[blockIndex][row])
            );
            if (isInvertibleMatrixModulo26(matrix)) result = { indexes: [...selected], matrix };
            return result !== null;
        }
        for (let index = start; index <= blocks.length - (size - selected.length); index++) {
            selected.push(index);
            if (choose(index + 1)) return true;
            selected.pop();
        }
        return false;
    };
    choose(0);
    return result;
}

function runCryptanalysis() {
    const size = currentSize;
    const enteredPlain = document.getElementById('known-plain').value.toUpperCase().replace(/[^A-Z]/g, '');
    let knownPlain = enteredPlain.padEnd(enteredPlain.length + mod(-enteredPlain.length, size), 'X');
    let knownCipher = document.getElementById('known-cipher').value.toUpperCase().replace(/[^A-Z]/g, '');
    let fullCipher = document.getElementById('full-intercepted-cipher').value.toUpperCase().replace(/[^A-Z]/g, '');
    const currentPlain = document.getElementById('input-text').value.toUpperCase().replace(/[^A-Z]/g, '');
    const displayedCipher = document.getElementById('cipher-output').innerText.replace(/[^A-Z]/g, '');
    const resDiv = document.getElementById('attack-result');
    const stepsContainer = document.getElementById('attack-steps-container');
    resDiv.classList.remove('hidden');

    if (knownPlain.length < size || knownCipher.length !== knownPlain.length) {
        alert(`Ingresa texto plano y cifrado con igual longitud y en bloques completos de ${size} letras.`);
        return;
    }

    document.getElementById('attack-result-title').innerText =
        `Desglose del Criptoanálisis ${size}x${size} (K = C · P⁻¹ mod 26)`;

    let selected = findInvertibleBlockSet(knownPlain, size);
    let generatedPadding = false;
    if (!selected && (!fullCipher || fullCipher === displayedCipher) &&
        currentPlain.startsWith(enteredPlain) && displayedCipher.startsWith(knownCipher) &&
        knownCipher === encryptTextWithMatrix(knownPlain, getMatrixValues())) {
        const activeKey = getMatrixValues();
        if (!isInvertibleMatrixModulo26(activeKey)) {
            stepsContainer.innerHTML = `<div class="p-4 bg-amber-950/60 text-amber-200 rounded border border-amber-700 text-xs">La matriz clave activa no es invertible módulo 26. Corrígela antes de usar el modo de criptoanálisis.</div>`;
            return;
        }

        const requiredLength = size * size;
        knownPlain = currentPlain.padEnd(Math.max(requiredLength, currentPlain.length + mod(-currentPlain.length, size)), 'X');
        if (knownPlain.length % size !== 0) {
            knownPlain = knownPlain.padEnd(knownPlain.length + mod(-knownPlain.length, size), 'X');
        }
        knownCipher = encryptTextWithMatrix(knownPlain, activeKey);
        selected = findInvertibleBlockSet(knownPlain, size);

        if (!selected) {
            const independentBlocks = Array.from({ length: size }, (_, row) =>
                Array.from({ length: size }, (_, column) => row === column ? 'B' : 'A').join('')
            );
            knownPlain += independentBlocks.join('');
            knownCipher = encryptTextWithMatrix(knownPlain, activeKey);
            selected = findInvertibleBlockSet(knownPlain, size);
        }
        generatedPadding = Boolean(selected);
    }
    if (!selected) {
        stepsContainer.innerHTML = `<div class="p-4 bg-amber-950/60 text-amber-200 rounded border border-amber-700 text-xs">No se pudo formar una matriz de texto plano P invertible con los bloques conocidos. Esto no significa que la clave de cifrado sea incorrecta: proporciona más pares alineados de texto plano y cifrado, o un texto completo conocido. Para Hill, P debe tener determinante coprimo con 26.</div>`;
        return;
    }

    const selectedPlainBlocks = selected.indexes.map(index =>
        knownPlain.slice(index * size, (index + 1) * size)
    );
    const selectedCipherBlocks = selected.indexes.map(index =>
        knownCipher.slice(index * size, (index + 1) * size)
    );
    const P = selected.matrix;
    const C = Array.from({ length: size }, (_, row) =>
        selected.indexes.map(index => charToNum(knownCipher[index * size + row]))
    );
    const detP = determinant(P);
    const detPMod = mod(detP, 26);
    const invDetP = modInverse(detPMod, 26);
    const cofactorP = getCofactorMatrix(P);
    const adjP = transpose(cofactorP);
    const invP = invertMatrixModulo26(P);
    const cofactorSteps = P.map((row, i) => row.map((_, j) => {
        const minor = P.filter((_, rowIndex) => rowIndex !== i)
            .map(matrixRow => matrixRow.filter((_, colIndex) => colIndex !== j));
        const minorDet = determinant(minor);
        const sign = (i + j) % 2 === 0 ? 1 : -1;
        return `<div>C<sub>${i + 1}${j + 1}</sub> = (${sign}) × det(minor ${i + 1},${j + 1}) = ${sign} × ${minorDet} = ${cofactorP[i][j]}</div>`;
    }).join('')).join('');

    let K = multiplyMatricesModulo26(C, invP);
    const allPairsMatch = Array.from({ length: knownPlain.length / size }, (_, blockIndex) => {
        const plainVector = Array.from(knownPlain.slice(blockIndex * size, (blockIndex + 1) * size), charToNum);
        const expected = Array.from(knownCipher.slice(blockIndex * size, (blockIndex + 1) * size), charToNum);
        const actual = multiplyMatrixVector(K, plainVector).map(value => mod(value, 26));
        return actual.every((value, index) => value === expected[index]);
    }).every(Boolean);

    if (!allPairsMatch) {
        stepsContainer.innerHTML = `<div class="p-4 bg-amber-950/60 text-amber-200 rounded border border-amber-700 text-xs">Los pares de texto plano y texto cifrado no corresponden todos a la misma clave ${size}x${size}. Revisa que estén alineados, tengan igual longitud y hayan sido cifrados con la matriz seleccionada.</div>`;
        return;
    }

    const matrixHtml = (matrix, color) => renderAttackMatrix(matrix, color);
    const scalarSteps = adjP.map((row, i) => row.map((value, j) =>
        `<div class="bg-slate-900/60 p-2 rounded border border-slate-800/60">• Posición (${i + 1},${j + 1}): (${value} × ${invDetP}) = ${value * invDetP} mod 26 = <strong class="text-emerald-400">${invP[i][j]}</strong></div>`
    ).join('')).join('');
    const keySteps = K.map((row, i) => row.map((value, j) => {
        const products = C[i].map((entry, index) => `(${entry} × ${invP[index][j]})`);
        const raw = C[i].reduce((sum, entry, index) => sum + entry * invP[index][j], 0);
        return `<div>K<sub>${i + 1}${j + 1}</sub> = ${products.join(' + ')} = ${raw} ≡ <strong class="text-amber-300">${value}</strong> (mod 26)</div>`;
    }).join('')).join('');
    const detK = determinant(K);
    const detKMod = mod(detK, 26);
    const invDetK = modInverse(detKMod, 26);

    let html = `
        <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <span class="text-blue-400 font-bold block text-sm">Paso 1: Conversión de bloques y construcción de P y C</span>
            <p class="text-slate-300 text-xs">${generatedPadding ? `Para completar la demostración se añadió X hasta alcanzar ${size * size} letras. Como los bloques repetidos XXX pueden dejar P sin inversa, también se añadieron bloques de prueba independientes cifrados con la clave activa. Estos bloques adicionales permiten mostrar la recuperación y no forman parte del mensaje original.` : ''} Cada bloque tiene ${size} letras, convertidas a valores Z26 (A=0,…,Z=25). Se usan los bloques ${selected.indexes.map(index => index + 1).join(', ')} para formar columnas:</p>
            <div class="flex flex-wrap justify-around gap-4 text-xs">
                <div><span>Matriz de texto plano P:</span><div class="mt-1">${matrixHtml(P, 'blue')}</div><p class="text-slate-400 mt-1">${selectedPlainBlocks.join(' | ')}</p></div>
                <div><span>Matriz de texto cifrado C:</span><div class="mt-1">${matrixHtml(C, 'amber')}</div><p class="text-slate-400 mt-1">${selectedCipherBlocks.join(' | ')}</p></div>
            </div>
        </div>
        <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <span class="text-blue-400 font-bold block text-sm">Paso 2: Inversa de P módulo 26</span>
            <p class="text-slate-300">det(P) = ${detP}; det(P) mod 26 = ${detPMod}. Como MCD(${detPMod},26)=1, el inverso del determinante es ${invDetP}, pues ${detPMod} × ${invDetP} ≡ 1 (mod 26).</p>
            <div class="flex flex-wrap justify-around gap-4 text-xs">
                <div><span>Matriz de cofactores:</span><div class="mt-1">${matrixHtml(cofactorP, 'blue')}</div><details class="mt-2"><summary class="cursor-pointer text-blue-300">Ver cálculo de los menores y cofactores</summary><div class="space-y-1 mt-2">${cofactorSteps}</div></details></div>
                <div><span>Adjunta adj(P) = cofactoresᵀ:</span><div class="mt-1">${matrixHtml(adjP, 'blue')}</div></div>
                <div><span>Inversa P⁻¹ = ${invDetP} · adj(P) mod 26:</span><div class="mt-1">${matrixHtml(invP, 'emerald')}</div></div>
            </div>
            <details class="text-slate-300"><summary class="cursor-pointer text-blue-300">Ver cálculo escalar de cada elemento de P⁻¹</summary><div class="space-y-1 mt-2">${scalarSteps}</div></details>
        </div>
        <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <span class="text-blue-400 font-bold block text-sm">Paso 3: Recuperación de la clave K = C · P⁻¹ mod 26</span>
            <div class="flex flex-wrap justify-around items-center gap-4">
                <div>C = ${matrixHtml(C, 'amber')}</div><span>×</span>
                <div>P⁻¹ = ${matrixHtml(invP, 'emerald')}</div><span>=</span>
                <div>K = ${matrixHtml(K, 'amber')}</div>
            </div>
            <details><summary class="cursor-pointer text-blue-300">Ver producto fila por columna</summary><div class="space-y-1 mt-2 text-slate-300">${keySteps}</div></details>
            <p class="${invDetK !== null ? 'text-emerald-400' : 'text-amber-200'}">det(K)=${detK}; det(K) mod 26=${detKMod}. ${invDetK !== null ? 'La clave recuperada es invertible módulo 26.' : 'Los pares suministrados definen una transformación que no es una clave Hill invertible.'}</p>
        </div>`;

    if (invDetK !== null && fullCipher.length > 0) {
        fullCipher = fullCipher.padEnd(fullCipher.length + mod(-fullCipher.length, size), 'X');
        const invK = invertMatrixModulo26(K);
        let decrypted = '';
        const blockDetails = [];
        for (let offset = 0; offset < fullCipher.length; offset += size) {
            const cipherBlock = fullCipher.slice(offset, offset + size);
            const cipherVector = Array.from(cipherBlock, charToNum);
            const plainVector = multiplyMatrixVector(invK, cipherVector).map(value => mod(value, 26));
            const plainBlock = plainVector.map(numToChar).join('');
            decrypted += plainBlock;
            const products = invK.map(row => {
                const raw = row.reduce((sum, value, index) => sum + value * cipherVector[index], 0);
                return `<div>${row.map((value, index) => `(${value} × ${cipherVector[index]})`).join(' + ')} = ${raw} ≡ ${mod(raw, 26)} (mod 26)</div>`;
            }).join('');
            blockDetails.push(`<div class="bg-slate-950/90 p-3 rounded-lg border border-slate-800 space-y-2">
                <strong>Bloque ${offset / size + 1}: ${cipherBlock} → ${plainBlock}</strong>
                <div class="flex flex-wrap justify-around gap-3">${matrixHtml(invK, 'emerald')} <span>× [${cipherVector.join(', ')}]ᵀ</span> → [${plainVector.join(', ')}]ᵀ</div>
                <div class="text-slate-300">${products}</div>
            </div>`);
        }
        html += `<div class="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30 space-y-3">
            <span class="text-emerald-400 font-bold block text-sm">Paso 4: Descifrado p = K⁻¹ · c mod 26</span>
            <p>Matriz inversa de K: ${matrixHtml(invK, 'emerald')}</p>
            <div class="space-y-2">${blockDetails.join('')}</div>
            <p class="font-bold text-white text-center bg-slate-950 p-3 rounded">MENSAJE DESCIFRADO: ${decrypted}</p>
        </div>`;
    }

    stepsContainer.innerHTML = html;
    lucide.createIcons();
}

function runDecipherWithKnownInverse() {
    const size = currentSize;
    const inputs = Array.from(document.querySelectorAll('.inv-matrix-input'));
    if (inputs.length !== size * size) {
        alert(`La matriz inversa debe tener ${size}x${size} valores.`);
        return;
    }
    const invK = Array.from({ length: size }, () => Array(size).fill(0));
    inputs.forEach(input => {
        invK[Number(input.dataset.row)][Number(input.dataset.col)] = Number.parseInt(input.value, 10) || 0;
    });
    if (!isInvertibleMatrixModulo26(invK)) {
        alert("La matriz ingresada no es invertible módulo 26. Su determinante debe ser coprimo con 26.");
        return;
    }

    let fullCipher = document.getElementById('custom-full-cipher').value.toUpperCase().replace(/[^A-Z]/g, '');
    if (!fullCipher) {
        alert("Por favor ingresa un mensaje cifrado válido para descifrar.");
        return;
    }
    fullCipher = fullCipher.padEnd(fullCipher.length + mod(-fullCipher.length, size), 'X');

    const resDiv = document.getElementById('attack-result');
    resDiv.classList.remove('hidden');
    document.getElementById('attack-result-title').innerText =
        `Descifrado directo con matriz inversa ${size}x${size}`;
    const stepsContainer = document.getElementById('attack-steps-container');
    const blockDetails = [];
    let decrypted = '';

    for (let offset = 0; offset < fullCipher.length; offset += size) {
        const cipherBlock = fullCipher.slice(offset, offset + size);
        const cipherVector = Array.from(cipherBlock, charToNum);
        const plainVector = multiplyMatrixVector(invK, cipherVector).map(value => mod(value, 26));
        const plainBlock = plainVector.map(numToChar).join('');
        decrypted += plainBlock;
        const rowCalculations = invK.map(row => {
            const terms = row.map((value, index) => `(${value} × ${cipherVector[index]})`);
            const raw = row.reduce((sum, value, index) => sum + value * cipherVector[index], 0);
            return `<div>${terms.join(' + ')} = ${raw} ≡ ${mod(raw, 26)} (mod 26)</div>`;
        }).join('');
        blockDetails.push(`<div class="bg-slate-950/90 p-3 rounded-lg border border-slate-800 space-y-2">
            <strong>Bloque ${offset / size + 1}: ${cipherBlock} → ${plainBlock}</strong>
            <div class="flex flex-wrap justify-around gap-3">${renderAttackMatrix(invK, 'emerald')} <span>× [${cipherVector.join(', ')}]ᵀ → [${plainVector.join(', ')}]ᵀ</span></div>
            <div class="text-slate-300">${rowCalculations}</div>
        </div>`);
    }

    stepsContainer.innerHTML = `
        <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <span class="text-emerald-400 font-bold block text-sm">Paso 1: Matriz inversa K⁻¹ ingresada</span>
            <p class="text-slate-300">Se descifra en bloques de ${size} letras. Determinante = ${determinant(invK)} (mod 26 = ${mod(determinant(invK), 26)}); la matriz es invertible.</p>
            <div class="flex justify-center">${renderAttackMatrix(invK, 'emerald')}</div>
        </div>
        <div class="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30 space-y-3">
            <span class="text-emerald-400 font-bold block text-sm">Paso 2: Multiplicación p = K⁻¹ · c mod 26, bloque por bloque</span>
            <div class="space-y-2">${blockDetails.join('')}</div>
            <p class="font-bold text-white text-center bg-slate-950 p-3 rounded">MENSAJE DESCIFRADO: ${decrypted}</p>
        </div>`;
    lucide.createIcons();
}

// --- MODO 2: DESCIFRADO TENIENDO DIRECTAMENTE LA MATRIZ INVERSA (K⁻¹) ---
function runDecipherWithKnownInverseLegacy() {
    const inputs = document.querySelectorAll('.inv-matrix-input');
    let invK = [
        [parseInt(inputs[0].value) || 0, parseInt(inputs[1].value) || 0],
        [parseInt(inputs[2].value) || 0, parseInt(inputs[3].value) || 0]
    ];

    if (!isInvertibleMatrixModulo26(invK)) {
        alert("La matriz ingresada no es invertible módulo 26. Ingresa una matriz cuyo determinante sea coprimo con 26.");
        return;
    }

    let fullCipher = document.getElementById('custom-full-cipher').value.toUpperCase().replace(/[^A-Z]/g, '');

    if (!fullCipher || fullCipher.length < 2) {
        alert("Por favor ingresa un mensaje cifrado válido para descifrar.");
        return;
    }

    while (fullCipher.length % 2 !== 0) fullCipher += 'X';

    const resDiv = document.getElementById('attack-result');
    resDiv.classList.remove('hidden');
    document.getElementById('attack-result-title').innerText = "Desglose de Descifrado Directo con Matriz Inversa (K⁻¹)";
    const stepsContainer = document.getElementById('attack-steps-container');

    let invK_matrixHtml = `<div class="inline-grid gap-1 grid-cols-2 bg-slate-950 p-2 rounded border border-emerald-500/30 text-emerald-300 font-mono text-center">
        <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${invK[0][0]}</div>
        <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${invK[0][1]}</div>
        <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${invK[1][0]}</div>
        <div class="w-8 h-8 flex items-center justify-center bg-slate-900 rounded">${invK[1][1]}</div>
    </div>`;

    let stepsHtml = `
        <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
            <span class="text-emerald-400 font-bold block text-sm">Paso 1: Configuración de la Matriz Inversa (K⁻¹) Conocida</span>
            <p class="text-slate-300 text-xs leading-relaxed">
                Has digitado directamente la matriz inversa clave (<strong class="text-emerald-400">K⁻¹</strong>) y el mensaje cifrado interceptado (<code class="text-amber-300">${fullCipher}</code>). A continuación se muestra la matriz ingresada:
            </p>
            <div class="flex justify-center pt-2">${invK_matrixHtml}</div>
        </div>
    `;

    let decryptedMessage = "";
    let blocksDetailHtml = "";

    for (let i = 0; i < fullCipher.length; i += 2) {
        let c1_char = fullCipher[i];
        let c2_char = fullCipher[i+1];
        let c1_val = charToNum(c1_char);
        let c2_val = charToNum(c2_char);

        let term1_1 = invK[0][0] * c1_val;
        let term1_2 = invK[0][1] * c2_val;
        let rawSum1 = term1_1 + term1_2;
        let p1_val = mod(rawSum1, 26);

        let term2_1 = invK[1][0] * c1_val;
        let term2_2 = invK[1][1] * c2_val;
        let rawSum2 = term2_1 + term2_2;
        let p2_val = mod(rawSum2, 26);

        let char1 = numToChar(p1_val);
        let char2 = numToChar(p2_val);
        decryptedMessage += char1 + char2;

        let vecHtml = `<div class="inline-grid gap-1 grid-cols-1 bg-slate-950 p-1.5 rounded border border-amber-500/30 text-amber-300 font-mono text-center">
            <div class="w-7 h-7 flex items-center justify-center bg-slate-900 rounded text-xs">${c1_val}</div>
            <div class="w-7 h-7 flex items-center justify-center bg-slate-900 rounded text-xs">${c2_val}</div>
        </div>`;

        let exp1 = rawSum1 >= 26 ? ` (Reduciendo: ${rawSum1} - ${Math.floor(rawSum1/26)*26} = <strong>${p1_val}</strong>)` : ``;
        let exp2 = rawSum2 >= 26 ? ` (Reduciendo: ${rawSum2} - ${Math.floor(rawSum2/26)*26} = <strong>${p2_val}</strong>)` : ``;

        blocksDetailHtml += `
            <div class="bg-slate-950/90 p-3 rounded-lg border border-slate-800 space-y-2">
                <div class="flex justify-between items-center text-blue-400 font-bold border-b border-slate-800 pb-1">
                    <span>Bloque #${(i/2)+1}: Cifrado "<span class="text-amber-300">${c1_char}${c2_char}</span>" ➔ Vector [${c1_val}, ${c2_val}]ᵀ</span>
                    <span class="text-emerald-400 uppercase">Resultado: ${char1}${char2}</span>
                </div>
                <div class="flex flex-wrap items-center justify-center gap-2 py-1">
                    <div><span class="text-[10px] text-slate-400 block mb-0.5">K⁻¹</span>${invK_matrixHtml}</div>
                    <span class="text-slate-500 font-bold">×</span>
                    <div><span class="text-[10px] text-slate-400 block mb-0.5">Vector c</span>${vecHtml}</div>
                    <span class="text-slate-500 font-bold">=</span>
                    <div class="text-xs text-slate-300 space-y-1 font-mono">
                        <div>Fila 1: (${invK[0][0]} × ${c1_val}) + (${invK[0][1]} × ${c2_val}) = ${term1_1} + ${term1_2} = ${rawSum1} mod 26 ➔ <strong class="text-emerald-400">${p1_val}</strong> (${char1})${exp1}</div>
                        <div>Fila 2: (${invK[1][0]} × ${c1_val}) + (${invK[1][1]} × ${c2_val}) = ${term2_1} + ${term2_2} = ${rawSum2} mod 26 ➔ <strong class="text-emerald-400">${p2_val}</strong> (${char2})${exp2}</div>
                    </div>
                </div>
            </div>
        `;
    }

    stepsHtml += `
        <div class="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30 space-y-3 font-mono text-xs">
            <span class="text-emerald-400 font-bold block text-sm">Paso 2: Descifrado Detallado Bloque por Bloque (p = K⁻¹ · c mod 26)</span>
            <div class="space-y-2">${blocksDetailHtml}</div>
            <p class="font-mono text-white text-base font-bold tracking-widest bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center uppercase mt-2">
                MENSAJE ORIGINAL REVELADO: ${decryptedMessage}
            </p>
        </div>
    `;

    stepsContainer.innerHTML = stepsHtml;
    lucide.createIcons();
}

// Vinculación de eventos al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('input-text').addEventListener('input', handleTextInput);
    renderInverseMatrixInputs();
    renderMatrixInputs([3, 3, 2, 5]);
    document.getElementById('input-text').value = "ENVIGADO";
    lastProcessedText = "ENVIGADO";
    processHillCipher();
});