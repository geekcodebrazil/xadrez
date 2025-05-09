// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
    try {
        // === CONFIGURAÇÃO INICIAL E VARIÁVEIS GLOBAIS ===

        const initialBoard = [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        ];

        let board = initialBoard.map(row => [...row]);
        const pieces = {
            'P': '♙', 'p': '♟', 'R': '♖', 'r': '♜', 'N': '♘', 'n': '♞',
            'B': '♗', 'b': '♝', 'Q': '♕', 'q': '♛', 'K': '♔', 'k': '♚'
        };

        let selectedPieceInfo = null;
        let currentPlayer = 'white';
        let gameEnded = false;

        const difficultyDepths = { easy: 1, medium: 3, hard: 4 };
        let currentSearchDepth = difficultyDepths.medium;

        // --- Referências aos Elementos do DOM ---
        const chessboard = document.getElementById('chessboard');
        const status = document.getElementById('status');
        const resetButton = document.getElementById('reset-button');
        const errorDiv = document.getElementById('error');
        const difficultyButtons = document.querySelectorAll('.difficulty-button');

        // Validação inicial
        if (!chessboard || !status || !resetButton || !errorDiv) {
            throw new Error('Elementos essenciais do DOM não encontrados.');
        }
        if (!difficultyButtons.length) {
             console.warn('AVISO: Botões de dificuldade (.difficulty-button) não encontrados.');
         }

        // === FUNÇÕES DE UI E INTERAÇÃO ===

        function createBoard() {
            chessboard.innerHTML = '';
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const square = document.createElement('div');
                    square.classList.add('square', (row + col) % 2 === 0 ? 'light' : 'dark');
                    square.dataset.row = row;
                    square.dataset.col = col;
                    const pieceType = board[row][col];
                    if (pieceType) {
                        const pieceElement = document.createElement('span');
                        pieceElement.classList.add('piece');
                        pieceElement.textContent = pieces[pieceType];
                        square.appendChild(pieceElement);
                    }
                    square.addEventListener('click', handleSquareClick);
                    chessboard.appendChild(square);
                }
            }
            clearHighlightsAndSelection();
        }

        function handleSquareClick(e) {
            if (gameEnded || currentPlayer !== 'white') return;
            const clickedSquare = e.currentTarget;
            const row = parseInt(clickedSquare.dataset.row);
            const col = parseInt(clickedSquare.dataset.col);
            const pieceOnSquare = board[row][col];

            if (selectedPieceInfo) {
                if (isValidMove(selectedPieceInfo.row, selectedPieceInfo.col, row, col, selectedPieceInfo.piece)) {
                    board[row][col] = selectedPieceInfo.piece;
                    board[selectedPieceInfo.row][selectedPieceInfo.col] = '';
                    console.log(`Mov Jogador: ${selectedPieceInfo.piece}(${selectedPieceInfo.row},${selectedPieceInfo.col})->(${row},${col})`);
                    selectedPieceInfo = null;
                    currentPlayer = 'black';
                    createBoard();
                    updateStatus();
                    if (!gameEnded) setTimeout(makeAIMove, 300);
                } else {
                    clearHighlightsAndSelection();
                    selectedPieceInfo = null;
                    if (pieceOnSquare && pieceOnSquare.toUpperCase() === pieceOnSquare) {
                        selectPiece(row, col, pieceOnSquare);
                    }
                }
            } else {
                if (pieceOnSquare && pieceOnSquare.toUpperCase() === pieceOnSquare) {
                    selectPiece(row, col, pieceOnSquare);
                }
            }
        }

        function selectPiece(row, col, pieceType) {
            clearHighlightsAndSelection();
            selectedPieceInfo = { row, col, piece: pieceType };
            const squareElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (squareElement) squareElement.classList.add('selected');
            highlightValidMoves(row, col, pieceType);
            console.log(`Selecionado: ${pieceType} em (${row}, ${col})`);
        }

        function highlightValidMoves(row, col, piece) {
            const moves = getValidMoves(row, col, piece);
            moves.forEach(move => {
                const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
                if (square) square.classList.add('highlight');
            });
        }

        function highlightAIMove(fromRow, fromCol, toRow, toCol) {
            const fromSquare = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
            const toSquare = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
            if (fromSquare) fromSquare.classList.add('ai-move');
            if (toSquare) toSquare.classList.add('ai-move');
        }

        function clearHighlightsAndSelection() {
            document.querySelectorAll('.highlight, .selected, .ai-move').forEach(square => {
                square.classList.remove('highlight', 'selected', 'ai-move');
            });
        }

        // === FUNÇÕES DE LÓGICA DE MOVIMENTO E VALIDAÇÃO ===

        function isValidMove(fromRow, fromCol, toRow, toCol, piece) {
            const validMoves = getValidMoves(fromRow, fromCol, piece);
            return validMoves.some(move => move.row === toRow && move.col === toCol);
        }

        function getValidMoves(row, col, piece) {
            if (!piece) return [];
            const isWhite = piece.toUpperCase() === piece;
            const rawMoves = getRawMoves(row, col, piece, board);
            const legalMoves = rawMoves.filter(move => {
                const tempBoard = board.map(r => [...r]);
                tempBoard[move.row][move.col] = piece;
                tempBoard[row][col] = '';
                const kingColor = isWhite ? 'white' : 'black';
                return !isKingInCheck(kingColor, tempBoard);
            });
            return legalMoves;
        }

        function getRawMoves(row, col, piece, currentBoard) {
            const moves = [];
            if (!piece) return moves;
            const isWhite = piece.toUpperCase() === piece;
            const pieceType = piece.toLowerCase();

            if (pieceType === 'p') {
                 const direction = isWhite ? -1 : 1;
                 const startRow = isWhite ? 6 : 1;
                 let nextRow = row + direction;
                 if (nextRow >= 0 && nextRow < 8) {
                    if (!currentBoard[nextRow][col]) {
                        moves.push({ row: nextRow, col: col });
                        if (row === startRow) {
                            let doubleNextRow = row + 2 * direction;
                            if (doubleNextRow >= 0 && doubleNextRow < 8 && !currentBoard[doubleNextRow][col]) {
                                moves.push({ row: doubleNextRow, col: col });
                            }
                        }
                    }
                    [-1, 1].forEach(side => {
                       let captureCol = col + side;
                       if (captureCol >= 0 && captureCol < 8) {
                           const targetPiece = currentBoard[nextRow][captureCol];
                           if (targetPiece && (isWhite ? targetPiece.toLowerCase() === targetPiece : targetPiece.toUpperCase() === targetPiece)) {
                               moves.push({ row: nextRow, col: captureCol });
                           }
                       }
                    });
                }
            } else if (['r', 'b', 'q'].includes(pieceType)) {
                const directionsRook = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                const directionsBishop = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
                let directions = [];
                if (pieceType === 'r') directions = directionsRook;
                else if (pieceType === 'b') directions = directionsBishop;
                else if (pieceType === 'q') directions = [...directionsRook, ...directionsBishop];

                directions.forEach(dir => {
                    let curRow = row + dir[0];
                    let curCol = col + dir[1];
                    while (curRow >= 0 && curRow < 8 && curCol >= 0 && curCol < 8) {
                        const targetPiece = currentBoard[curRow][curCol];
                        if (targetPiece) {
                            if ((isWhite && targetPiece.toLowerCase() === targetPiece) || (!isWhite && targetPiece.toUpperCase() === targetPiece)) {
                                moves.push({ row: curRow, col: curCol });
                            }
                            break;
                        } else {
                            moves.push({ row: curRow, col: curCol });
                        }
                        curRow += dir[0];
                        curCol += dir[1];
                    }
                });
            } else if (['n', 'k'].includes(pieceType)) {
                let relativeMoves = [];
                if (pieceType === 'n') relativeMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
                if (pieceType === 'k') relativeMoves = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];

                relativeMoves.forEach(move => {
                    const newRow = row + move[0];
                    const newCol = col + move[1];
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const targetPiece = currentBoard[newRow][newCol];
                        if (!targetPiece || (isWhite && targetPiece.toLowerCase() === targetPiece) || (!isWhite && targetPiece.toUpperCase() === targetPiece)) {
                            moves.push({ row: newRow, col: newCol });
                        }
                    }
                });
            }
            return moves;
         }

        // === FUNÇÕES DE VERIFICAÇÃO DE ESTADO DO JOGO ===

        function isKingInCheck(playerColor, currentBoard) {
            const kingPiece = playerColor === 'white' ? 'K' : 'k';
            const opponentColor = playerColor === 'white' ? 'black' : 'white';
            let kingPos = null;
            for (let r = 0; r < 8 && !kingPos; r++) {
                for (let c = 0; c < 8 && !kingPos; c++) {
                    if (currentBoard[r][c] === kingPiece) kingPos = { row: r, col: c };
                }
            }
            if (!kingPos) return false;

            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const opponentPiece = currentBoard[r][c];
                    if (opponentPiece && ((opponentColor === 'white' && opponentPiece.toUpperCase() === opponentPiece) || (opponentColor === 'black' && opponentPiece.toLowerCase() === opponentPiece))) {
                        const attackerMoves = getRawMoves(r, c, opponentPiece, currentBoard);
                        if (attackerMoves.some(attack => attack.row === kingPos.row && attack.col === kingPos.col)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        function isCheckmate(player) {
            return isKingInCheck(player, board) && !hasLegalMoves(player);
        }

        function isStalemate(player) {
            return !isKingInCheck(player, board) && !hasLegalMoves(player);
        }

        function hasLegalMoves(player) {
            const isWhitePlayer = player === 'white';
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const currentPiece = board[r][c];
                    if (currentPiece && ((isWhitePlayer && currentPiece.toUpperCase() === currentPiece) || (!isWhitePlayer && currentPiece.toLowerCase() === currentPiece))) {
                        if (getValidMoves(r, c, currentPiece).length > 0) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        // === ATUALIZAÇÃO DE STATUS ===
        function updateStatus() {
            // Verifica se o jogo já terminou para evitar atualizações desnecessárias
            if (gameEnded) {
                return;
            }

            // Define nomes amigáveis para os jogadores
            const currentPlayerName = currentPlayer === 'white' ? 'Brancas (Voce)' : 'Pretas (Maquina)'; // Usando sem acentos para teste

            // Define a mensagem padrão - Atenção às crases (backticks) ` `
            let message = `Vez das ${currentPlayerName}`;

            // Verifica se o jogador atual está em xeque
            const isCheck = isKingInCheck(currentPlayer, board); // Linha onde o erro anterior foi reportado

            // Lógica para mensagens de xeque, mate e afogamento
            if (isCheck) {
                // Verifica se é xeque-mate
                if (isCheckmate(currentPlayer)) {
                    const winner = currentPlayer === 'white' ? 'Maquina (Pretas)' : 'Voce (Brancas)'; // Usando sem acentos
                    // Define mensagem de vitória - Atenção às crases ` ` e aspas dentro do style=""
                    message = `<span style="color: #50fa7b; font-weight: bold;">XEQUE-MATE! ${winner} venceu!</span>`;
                    gameEnded = true; // Marca o jogo como terminado
                } else {
                    // Apenas avisa que está em xeque - Usando aspas simples para o span HTML
                    message += ' - <span style="color: #ff79c6; font-weight: bold;">XEQUE!</span>';
                }
            } else if (isStalemate(currentPlayer)) {
                 // Verifica afogamento (somente se NÃO estiver em xeque)
                 // Usa aspas simples para o span HTML
                message = '<span style="color: #f1fa8c; font-weight: bold;">EMPATE por Afogamento!</span>';
                gameEnded = true; // Marca o jogo como terminado
            }
            // (Outras condições de empate poderiam ser verificadas aqui)

            // Atualiza o elemento HTML com a mensagem final
            if (status) { // Garante que o elemento 'status' existe
               status.innerHTML = message;
            } else {
               console.error("Elemento de status nao encontrado no DOM para atualizar a mensagem.");
            }
        } // Fim da função updateStatus

        // === INTELIGÊNCIA ARTIFICIAL (IA) ===

        function makeAIMove() {
            if (gameEnded) return;
            const difficultyName = Object.keys(difficultyDepths).find(k=>difficultyDepths[k]===currentSearchDepth) || 'Desconhecida';
            console.log(`IA (${difficultyName}) pensando (prof ${currentSearchDepth})...`);
            const startThinkingTime = performance.now();

            const bestMoveInfo = minimax(currentSearchDepth, false, -Infinity, Infinity);

            const endThinkingTime = performance.now();
            console.log(`Tempo de calculo: ${(endThinkingTime - startThinkingTime).toFixed(0)} ms`);

            if (bestMoveInfo && bestMoveInfo.move) {
                const move = bestMoveInfo.move;
                 console.log(`IA move: ${move.piece}(${move.fromRow},${move.fromCol})->(${move.toRow},${move.toCol}) | Score: ${bestMoveInfo.score}`);
                board[move.toRow][move.toCol] = move.piece;
                board[move.fromRow][move.fromCol] = '';
                highlightAIMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
                currentPlayer = 'white';
                createBoard();
                updateStatus();
            } else {
                 console.error('Erro: Minimax nao retornou um movimento valido.');
                 updateStatus();
                 if (!gameEnded) {
                     status.textContent = 'Erro: IA falhou em determinar movimento.';
                     gameEnded = true;
                 }
            }
        }

        // --- Algoritmo Minimax com Poda Alpha-Beta ---
        function minimax(depth, isMaximizingPlayer, alpha, beta) {
            const whiteCheckmate = isCheckmate('white');
            const blackCheckmate = isCheckmate('black');
            const whiteStalemate = isStalemate('white');
            const blackStalemate = isStalemate('black');

            if (whiteCheckmate || blackCheckmate || whiteStalemate || blackStalemate) {
                if (whiteCheckmate) return { score: -100000 - depth };
                if (blackCheckmate) return { score: 100000 + depth };
                return { score: 0 };
            }
            if (depth === 0) {
                return { score: evaluateBoard() };
            }

            const possibleMoves = [];
            const playerColor = isMaximizingPlayer ? 'white' : 'black';
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const pieceForMinimax = board[r][c];
                    if (pieceForMinimax && ((playerColor === 'white' && pieceForMinimax.toUpperCase() === pieceForMinimax) || (playerColor === 'black' && pieceForMinimax.toLowerCase() === pieceForMinimax))) {
                        const validMoves = getValidMoves(r, c, pieceForMinimax);
                        validMoves.forEach(move => {
                            possibleMoves.push({ fromRow: r, fromCol: c, toRow: move.row, toCol: move.col, piece: pieceForMinimax });
                        });
                    }
                }
            }

            if (possibleMoves.length === 0) {
                 if (isKingInCheck(playerColor, board)) { return { score: isMaximizingPlayer ? (-100000 - depth) : (100000 + depth) }; }
                 else { return { score: 0 }; }
            }

            let bestMoveForThisNode = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

            if (isMaximizingPlayer) {
                let maxEval = -Infinity;
                for (const move of possibleMoves) {
                    const originalPiece = board[move.toRow][move.toCol];
                    board[move.toRow][move.toCol] = move.piece; board[move.fromRow][move.fromCol] = '';
                    let evalInfo = minimax(depth - 1, false, alpha, beta);
                    board[move.fromRow][move.fromCol] = move.piece; board[move.toRow][move.toCol] = originalPiece;
                    if (evalInfo.score > maxEval) { maxEval = evalInfo.score; bestMoveForThisNode = move; }
                    alpha = Math.max(alpha, evalInfo.score);
                    if (beta <= alpha) break;
                }
                return { score: maxEval, move: bestMoveForThisNode };
            } else {
                let minEval = Infinity;
                for (const move of possibleMoves) {
                    const originalPiece = board[move.toRow][move.toCol];
                    board[move.toRow][move.toCol] = move.piece; board[move.fromRow][move.fromCol] = '';
                    let evalInfo = minimax(depth - 1, true, alpha, beta);
                    board[move.fromRow][move.fromCol] = move.piece; board[move.toRow][move.toCol] = originalPiece;
                    if (evalInfo.score < minEval) { minEval = evalInfo.score; bestMoveForThisNode = move; }
                    beta = Math.min(beta, evalInfo.score);
                    if (beta <= alpha) break;
                }
                return { score: minEval, move: bestMoveForThisNode };
            }
        } // Fim da função minimax

        // --- Função de Avaliação Heurística ---
        function evaluateBoard() {
            const pieceValues = {
                'p': -10, 'P': 10, 'n': -30, 'N': 30, 'b': -31, 'B': 31,
                'r': -50, 'R': 50, 'q': -90, 'Q': 90, 'k': 0, 'K': 0
            };
            let score = 0;
             const pawnPos = [
                [0,0,0,0,0,0,0,0], [5,5,5,5,5,5,5,5], [1,1,2,3,3,2,1,1], [0.5,0.5,1,2.5,2.5,1,0.5,0.5],
                [0,0,0,2,2,0,0,0], [0.5,-0.5,-1,0,0,-1,-0.5,0.5], [0.5,1,1,-2,-2,1,1,0.5], [0,0,0,0,0,0,0,0]
            ];
            const knightPos = [
                [-5,-4,-3,-3,-3,-3,-4,-5], [-4,-2,0,0.5,0.5,0,-2,-4], [-3,0.5,1,1.5,1.5,1,0.5,-3],
                [-3,0,1.5,2,2,1.5,0,-3], [-3,0.5,1.5,2,2,1.5,0.5,-3], [-3,0,1,1.5,1.5,1,0,-3],
                [-4,-2,0,0,0,0,-2,-4], [-5,-4,-3,-3,-3,-3,-4,-5]
            ];
            const bishopPos = [
                [-2,-1,-1,-1,-1,-1,-1,-2], [-1,0,0,0,0,0,0,-1], [-1,0,0.5,1,1,0.5,0,-1],
                [-1,0.5,0.5,1,1,0.5,0.5,-1], [-1,0,1,1,1,1,0,-1], [-1,1,1,1,1,1,1,-1],
                [-1,0.5,0,0,0,0,0.5,-1], [-2,-1,-1,-1,-1,-1,-1,-2]
            ];
            const rookPos = [
                 [0,0,0,0.5,0.5,0,0,0], [-0.5,0,0,0,0,0,0,-0.5], [-0.5,0,0,0,0,0,0,-0.5],
                 [-0.5,0,0,0,0,0,0,-0.5], [-0.5,0,0,0,0,0,0,-0.5], [-0.5,0,0,0,0,0,0,-0.5],
                 [0.5,1,1,1,1,1,1,0.5], [0,0,0,0,0,0,0,0]
             ];
             const queenPos = [
                 [-2,-1,-1,-0.5,-0.5,-1,-1,-2],[-1,0,0.5,0,0,0,0,-1],[-1,0.5,0.5,0.5,0.5,0.5,0,-1],
                 [0,0,0.5,0.5,0.5,0.5,0,-0.5],[-0.5,0,0.5,0.5,0.5,0.5,0,-0.5],[-1,0,0.5,0.5,0.5,0.5,0,-1],
                 [-1,0,0,0,0,0,0,-1],[-2,-1,-1,-0.5,-0.5,-1,-1,-2]
             ];

            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const evalPiece = board[r][c];
                    if (evalPiece) {
                        const isWhitePiece = evalPiece.toUpperCase() === evalPiece;
                        const pieceType = evalPiece.toLowerCase();
                        const value = pieceValues[evalPiece] || 0;
                        let posBonus = 0;
                        try {
                            const rowIdx = isWhitePiece ? r : 7 - r;
                            const colIdx = c;
                            switch(pieceType) {
                                case 'p': posBonus = pawnPos[rowIdx]?.[colIdx] || 0; break;
                                case 'n': posBonus = knightPos[rowIdx]?.[colIdx] || 0; break;
                                case 'b': posBonus = bishopPos[rowIdx]?.[colIdx] || 0; break;
                                case 'r': posBonus = rookPos[rowIdx]?.[colIdx] || 0; break;
                                case 'q': posBonus = queenPos[rowIdx]?.[colIdx] || 0; break;
                                default: posBonus = 0;
                            }
                        } catch (e) { console.warn("Erro posBonus:", e); posBonus = 0; }
                        score += value + (isWhitePiece ? posBonus : -posBonus);
                    }
                }
            }
            return score;
        }

        // --- FUNÇÃO PARA DEFINIR A DIFICULDADE ---
        function setDifficulty(level) {
             if (difficultyDepths[level] !== undefined) {
                 currentSearchDepth = difficultyDepths[level];
                 console.log(`Dificuldade: ${level}, Profundidade: ${currentSearchDepth}`);
                 difficultyButtons.forEach(btn => {
                     btn.classList.remove('active-difficulty');
                     if (btn.dataset.difficulty === level) btn.classList.add('active-difficulty');
                 });
                 // resetGame();
             } else {
                 console.error(`Nivel de dificuldade invalido: ${level}`);
             }
         }

        // --- FUNÇÃO PARA REINICIAR O JOGO ---
        function resetGame() {
            console.log('Reiniciando...');
            board = initialBoard.map(row => [...row]);
            currentPlayer = 'white';
            gameEnded = false;
            selectedPieceInfo = null;
            createBoard();
            updateStatus();
        }

        // === INICIALIZAÇÃO E EVENT LISTENERS ===
        resetButton.addEventListener('click', resetGame);

        if (difficultyButtons.length > 0) {
            difficultyButtons.forEach(button => {
                button.addEventListener('click', (e) => setDifficulty(e.target.dataset.difficulty));
            });
            setDifficulty('medium');
        } else {
            console.log("Selecao de dificuldade desabilitada. Usando Medio.");
        }

        createBoard();
        updateStatus();

    } catch (error) {
        console.error('Erro fatal:', error);
        if (errorDiv) {
            errorDiv.textContent = `Erro critico: ${error.message}. Veja o console.`;
            errorDiv.style.display = 'block';
        }
    }
});