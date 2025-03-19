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
    }
    
    /**
     * 玩家移动棋子
     * @param {Piece} piece - 要移动的棋子
     * @param {Array} to - 目标位置 [x, y]
     */
    makeMove(piece, to) {
        // 如果游戏已结束或不是玩家回合，忽略
        if (this.status !== GAME_STATUS.PLAYING || this.currentTurn !== SIDES.RED) {
            return false;
        }
        
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
        setTimeout(() => this.aiMove(), 500);
        
        return true;
    }
    
    /**
     * AI移动棋子
     */
    aiMove() {
        // 如果游戏已结束或不是AI回合，忽略
        if (this.status !== GAME_STATUS.PLAYING || this.currentTurn !== SIDES.BLACK) {
            return;
        }
        
        // 获取AI最佳移动
        const move = this.ai.getBestMove(this.board.pieces, SIDES.BLACK);
        
        if (move) {
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
    }
    
    /**
     * 结束游戏
     * @param {string} status - 游戏结束状态
     */
    endGame(status) {
        this.status = status;
        this.updateStatus();
    }
}
