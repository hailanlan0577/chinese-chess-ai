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
        this.updateStatus();
    }
    
    /**
     * 重新开始游戏
     */
    restart() {
        this.init();
    }
    
    /**
     * 设置AI难度
     * @param {string} level - 难度级别
     */
    setDifficulty(level) {
        this.ai.setDifficulty(level);
        console.log("难度已设置:", level, this.ai.difficulty);
    }
    
    /**
     * 玩家移动棋子
     * @param {Piece} piece - 要移动的棋子
     * @param {Array} to - 目标位置 [x, y]
     */
    makeMove(piece, to) {
        // 如果游戏已结束或不是玩家回合，忽略
        if (this.status !== GAME_STATUS.PLAYING || this.currentTurn !== SIDES.RED) {
            console.log("无法移动：游戏已结束或不是玩家回合");
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
        setTimeout(() => this.aiMove(), 500);
        
        return true;
    }
    
    /**
     * AI移动棋子
     */
    aiMove() {
        // 如果游戏已结束或不是AI回合，忽略
        if (this.status !== GAME_STATUS.PLAYING || this.currentTurn !== SIDES.BLACK) {
            console.log("AI无法移动：游戏已结束或不是AI回合");
            return;
        }
        
        console.log("AI开始思考...");
        
        // 获取AI最佳移动
        const move = this.ai.getBestMove(this.board.pieces, SIDES.BLACK);
        
        if (move) {
            console.log(`AI决定移动: ${move.piece.getChar()} 从 ${move.piece.position} 到 ${move.to}`);
            
            // 执行移动
            const moveResult = this.board.movePiece(move.piece, move.to);
            
            // 记录历史
            this.recordMove(move.piece, moveResult);
            
            // 更新游戏状态
            this.currentTurn = SIDES.RED;
            this.updateStatus();
            
            // 检查游戏是否结束
            const gameStatus = this.board.checkGameOver();
            if (gameStatus !== GAME_STATUS.PLAYING) {
                this.endGame(gameStatus);
            }
        } else {
            console.log("AI无子可走，游戏结束");
            // AI无子可走，游戏结束
            this.endGame(GAME_STATUS.RED_WIN);
        }
    }
    
    /**
     * 记录移动历史
     * @param {Piece} piece - 移动的棋子
     * @param {Object} moveResult - 移动结果
     */
    recordMove(piece, moveResult) {
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
    }
    
    /**
     * 更新移动历史显示
     */
    updateMoveHistory() {
        if (!this.movesElement) return;
        
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
    }
    
    /**
     * 更新游戏状态显示
     */
    updateStatus() {
        if (!this.statusElement) return;
        
        let statusText = '';
        
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
        
        this.statusElement.textContent = statusText;
        console.log("游戏状态更新:", statusText);
    }
    
    /**
     * 结束游戏
     * @param {string} status - 游戏结束状态
     */
    endGame(status) {
        this.status = status;
        this.updateStatus();
        console.log("游戏结束，结果:", status);
    }
}
