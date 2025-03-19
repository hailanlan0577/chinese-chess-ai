/**
 * 游戏控制类 - 负责游戏逻辑和流程控制
 */
class Game {
    constructor() {
        this.board = null;
        this.ai = new ChessAI();
        this.currentTurn = SIDES.RED; // 红方先行
        this.status = GAME_STATUS.PLAYING;
        this.moveHistory = [];
        this.moveCount = 0;
        this.isAIThinking = false;
        
        // UI元素引用
        this.statusElement = document.getElementById('status');
        this.movesElement = document.getElementById('moves');
        
        // 初始化游戏
        this.init();
        
        // 调试信息
        console.log("游戏初始化: AI难度设置为", this.ai.difficulty);
    }
    
    /**
     * 初始化游戏
     */
    init() {
        try {
            // 创建棋盘
            this.board = new Board();
            
            // 初始化棋盘
            this.board.reset();
            
            // 清空历史记录
            this.moveHistory = [];
            this.moveCount = 0;
            this.updateMoveHistory();
            
            // 设置游戏状态
            this.status = GAME_STATUS.PLAYING;
            this.currentTurn = SIDES.RED; // 红方先行
            this.isAIThinking = false;
            this.updateStatus();
        } catch (error) {
            console.error("初始化游戏时出错:", error);
            alert("初始化游戏时出错，请刷新页面重试。");
        }
    }
    
    /**
     * 重新开始游戏
     */
    restart() {
        try {
            // 如果AI正在思考，取消其操作
            if (this.isAIThinking) {
                this.isAIThinking = false;
                console.log("取消AI思考过程");
            }
            
            this.init();
            console.log("游戏已重新开始");
        } catch (error) {
            console.error("重新开始游戏时出错:", error);
            alert("重新开始游戏时出错，请刷新页面重试。");
        }
    }
    
    /**
     * 设置AI难度
     * @param {string} level - 难度级别
     */
    setDifficulty(level) {
        try {
            this.ai.setDifficulty(level);
            console.log("难度已设置:", level, this.ai.difficulty);
        } catch (error) {
            console.error("设置AI难度时出错:", error);
        }
    }
    
    /**
     * 玩家移动棋子
     * @param {Piece} piece - 要移动的棋子
     * @param {Array} to - 目标位置 [x, y]
     * @returns {boolean} 移动是否成功
     */
    makeMove(piece, to) {
        try {
            // 如果游戏已结束或不是玩家回合，或AI正在思考，忽略
            if (this.status !== GAME_STATUS.PLAYING || this.currentTurn !== SIDES.RED || this.isAIThinking) {
                console.log("无法移动：游戏已结束或不是玩家回合或AI正在思考");
                return false;
            }
            
            console.log(`玩家移动: ${piece.getChar()} 从 ${piece.position} 到 ${to}`);
            
            // 执行移动
            const moveResult = this.board.movePiece(piece, to);
            
            // 记录历史
            this.recordMove(piece, moveResult);
            
            // 更新游戏状态
            this.currentTurn = SIDES.BLACK;
            this.updateStatus();
            
            // 检查游戏是否结束
            const gameStatus = this.board.checkGameOver();
            if (gameStatus !== GAME_STATUS.PLAYING) {
                this.endGame(gameStatus);
                return true;
            }
            
            // AI回合
            console.log("玩家回合结束，开始AI回合");
            this.isAIThinking = true;
            this.updateStatus(); // 更新状态，显示"AI思考中"
            
            // 使用setTimeout使AI思考在下一个事件循环中进行，避免界面卡顿
            setTimeout(() => this.aiMove(), 100);
            
            return true;
        } catch (error) {
            console.error("玩家移动时出错:", error);
            this.isAIThinking = false;
            this.updateStatus();
            return false;
        }
    }
    
    /**
     * AI移动棋子
     */
    aiMove() {
        try {
            // 如果游戏已结束或不是AI回合，忽略
            if (this.status !== GAME_STATUS.PLAYING || this.currentTurn !== SIDES.BLACK) {
                console.log("AI无法移动：游戏已结束或不是AI回合");
                this.isAIThinking = false;
                this.updateStatus();
                return;
            }
            
            console.log("AI开始思考...");
            
            // 获取AI最佳移动
            const move = this.ai.getBestMove(this.board.pieces, SIDES.BLACK);
            
            // 标记AI思考完成
            this.isAIThinking = false;
            
            if (!move) {
                console.log("AI无子可走或思考过程出错");
                // 检查是否真的无子可走
                const hasValidMoves = this.board.pieces.some(piece => {
                    if (piece.side === SIDES.BLACK) {
                        const moves = Rules.getValidMoves(piece, this.board.pieces);
                        return moves.length > 0;
                    }
                    return false;
                });
                
                if (!hasValidMoves) {
                    console.log("AI确实无子可走，游戏结束");
                    this.endGame(GAME_STATUS.RED_WIN);
                } else {
                    console.log("AI计算出错，选择随机移动");
                    // 随机选择一个合法移动
                    for (const piece of this.board.pieces) {
                        if (piece.side === SIDES.BLACK) {
                            const moves = Rules.getValidMoves(piece, this.board.pieces);
                            if (moves.length > 0) {
                                const randomMove = moves[Math.floor(Math.random() * moves.length)];
                                this.executeAIMove(piece, randomMove);
                                return;
                            }
                        }
                    }
                    // 如果还是找不到，只能认为是红方胜利
                    this.endGame(GAME_STATUS.RED_WIN);
                }
                return;
            }
            
            // 执行AI移动
            this.executeAIMove(move.piece, move.to);
        } catch (error) {
            console.error("AI移动时出错:", error);
            this.isAIThinking = false;
            this.updateStatus();
            
            // 尝试随机走一步
            this.tryRandomAIMove();
        }
    }
    
    /**
     * 执行AI的移动
     * @param {Piece} piece - 要移动的棋子
     * @param {Array} to - 目标位置
     */
    executeAIMove(piece, to) {
        try {
            console.log(`AI决定移动: ${piece.getChar()} 从 ${piece.position} 到 ${to}`);
            
            // 执行移动
            const moveResult = this.board.movePiece(piece, to);
            
            // 记录历史
            this.recordMove(piece, moveResult);
            
            // 更新游戏状态
            this.currentTurn = SIDES.RED;
            this.updateStatus();
            
            // 检查游戏是否结束
            const gameStatus = this.board.checkGameOver();
            if (gameStatus !== GAME_STATUS.PLAYING) {
                this.endGame(gameStatus);
            }
        } catch (error) {
            console.error(`执行AI移动时出错:`, error);
            // 尝试随机走一步
            this.tryRandomAIMove();
        }
    }
    
    /**
     * 尝试随机AI移动（出错时的后备方案）
     */
    tryRandomAIMove() {
        try {
            console.log("尝试随机AI移动");
            
            // 获取所有黑方棋子
            const blackPieces = this.board.pieces.filter(p => p.side === SIDES.BLACK);
            
            // 随机尝试每个棋子
            for (const piece of blackPieces) {
                const validMoves = Rules.getValidMoves(piece, this.board.pieces);
                if (validMoves.length > 0) {
                    // 随机选择一个有效移动
                    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                    
                    // 执行移动
                    const moveResult = this.board.movePiece(piece, randomMove);
                    
                    // 记录历史
                    this.recordMove(piece, moveResult);
                    
                    // 更新游戏状态
                    this.currentTurn = SIDES.RED;
                    this.updateStatus();
                    
                    // 检查游戏是否结束
                    const gameStatus = this.board.checkGameOver();
                    if (gameStatus !== GAME_STATUS.PLAYING) {
                        this.endGame(gameStatus);
                    }
                    
                    console.log("随机AI移动成功");
                    return true;
                }
            }
            
            // 如果所有棋子都没有有效移动，游戏结束
            console.log("黑方无子可走，游戏结束");
            this.endGame(GAME_STATUS.RED_WIN);
            return false;
        } catch (error) {
            console.error("随机AI移动也失败:", error);
            // 如果随机移动也失败，直接结束游戏
            this.endGame(GAME_STATUS.RED_WIN);
            return false;
        }
    }
    
    /**
     * 记录移动历史
     * @param {Piece} piece - 移动的棋子
     * @param {Object} moveResult - 移动结果
     */
    recordMove(piece, moveResult) {
        try {
            this.moveCount++;
            
            const move = {
                count: this.moveCount,
                piece: piece.type,
                side: piece.side,
                from: [...moveResult.from],
                to: [...moveResult.to],
                captured: moveResult.captured ? {
                    type: moveResult.captured.type,
                    side: moveResult.captured.side
                } : null,
                notation: piece.getMoveNotation(moveResult.from, moveResult.to)
            };
            
            this.moveHistory.push(move);
            this.updateMoveHistory();
        } catch (error) {
            console.error("记录移动历史时出错:", error);
        }
    }
    
    /**
     * 更新移动历史显示
     */
    updateMoveHistory() {
        if (!this.movesElement) return;
        
        try {
            // 清空历史记录
            this.movesElement.innerHTML = '';
            
            // 添加每一步
            this.moveHistory.forEach(move => {
                const moveElement = document.createElement('div');
                moveElement.className = 'move-item';
                
                const numberElement = document.createElement('span');
                numberElement.className = 'move-number';
                numberElement.textContent = move.count + '. ';
                
                const textElement = document.createElement('span');
                textElement.className = `move-text ${move.side}`;
                
                // 构建移动文本
                let moveText = move.notation;
                if (move.captured) {
                    moveText += ' 吃' + PIECE_CHARS[move.captured.side][move.captured.type];
                }
                
                textElement.textContent = moveText;
                
                moveElement.appendChild(numberElement);
                moveElement.appendChild(textElement);
                
                this.movesElement.appendChild(moveElement);
            });
            
            // 滚动到底部
            this.movesElement.scrollTop = this.movesElement.scrollHeight;
        } catch (error) {
            console.error("更新移动历史显示时出错:", error);
        }
    }
    
    /**
     * 更新游戏状态显示
     */
    updateStatus() {
        if (!this.statusElement) return;
        
        try {
            let statusText = '';
            
            if (this.isAIThinking) {
                statusText = '黑方思考中...';
            } else {
                switch (this.status) {
                    case GAME_STATUS.PLAYING:
                        statusText = this.currentTurn === SIDES.RED ? '轮到红方' : '轮到黑方';
                        break;
                    case GAME_STATUS.RED_WIN:
                        statusText = '红方胜利！';
                        break;
                    case GAME_STATUS.BLACK_WIN:
                        statusText = '黑方胜利！';
                        break;
                    case GAME_STATUS.DRAW:
                        statusText = '和棋';
                        break;
                }
            }
            
            this.statusElement.textContent = statusText;
            console.log("游戏状态更新:", statusText);
        } catch (error) {
            console.error("更新游戏状态显示时出错:", error);
        }
    }
    
    /**
     * 结束游戏
     * @param {string} status - 游戏结束状态
     */
    endGame(status) {
        try {
            this.status = status;
            this.isAIThinking = false;
            this.updateStatus();
            console.log("游戏结束，结果:", status);
        } catch (error) {
            console.error("结束游戏时出错:", error);
        }
    }
}
