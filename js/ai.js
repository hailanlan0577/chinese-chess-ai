/**
 * AI类 - 实现电脑玩家的决策逻辑
 */
class ChessAI {
    constructor() {
        // 默认使用中等难度
        this.setDifficulty('medium');
    }
    
    /**
     * 设置AI难度
     * @param {string} level - 难度级别：'easy', 'medium', 'hard'
     */
    setDifficulty(level) {
        switch (level.toLowerCase()) {
            case 'easy':
                this.difficulty = AI_DIFFICULTY.EASY;
                break;
            case 'medium':
                this.difficulty = AI_DIFFICULTY.MEDIUM;
                break;
            case 'hard':
                this.difficulty = AI_DIFFICULTY.HARD;
                break;
            default:
                this.difficulty = AI_DIFFICULTY.MEDIUM;
        }
    }
    
    /**
     * 获取AI的最佳移动
     * @param {Array} pieces - 当前棋盘上的所有棋子
     * @param {string} side - AI方（通常是黑方）
     * @return {Object} 最佳移动，格式为 {piece, to}
     */
    getBestMove(pieces, side) {
        // 找出所有可能的移动
        const allMoves = this.getAllPossibleMoves(pieces, side);
        
        if (allMoves.length === 0) {
            return null; // 无子可走
        }
        
        // 使用极小极大算法评估每一个移动
        const bestMoves = [];
        let bestScore = -Infinity;
        
        for (const move of allMoves) {
            // 模拟移动
            const newPieces = Rules.simulateMove(move.piece, move.to, pieces);
            
            // 评估分数（极小极大搜索）
            const score = -this.minimax(
                newPieces,
                this.difficulty.depth - 1,
                -Infinity,
                Infinity,
                side === SIDES.RED ? SIDES.BLACK : SIDES.RED
            );
            
            // 更新最佳移动
            if (score > bestScore) {
                bestScore = score;
                bestMoves.length = 0;
                bestMoves.push(move);
            } else if (score === bestScore) {
                bestMoves.push(move);
            }
        }
        
        // 随机选择一个最佳移动（加入随机性）
        if (bestMoves.length > 0) {
            // 根据难度，可能选择次优解
            if (Math.random() < this.difficulty.randomFactor) {
                // 随机选择一个可能的移动，而不一定是最佳移动
                return allMoves[Math.floor(Math.random() * allMoves.length)];
            } else {
                // 在最佳移动中随机选择
                return bestMoves[Math.floor(Math.random() * bestMoves.length)];
            }
        }
        
        return null;
    }
    
    /**
     * 获取所有可能的移动
     * @param {Array} pieces - 当前棋盘上的所有棋子
     * @param {string} side - 当前方
     * @return {Array} 所有可能移动的数组，每个元素格式为 {piece, to}
     */
    getAllPossibleMoves(pieces, side) {
        const moves = [];
        
        // 遍历所有指定方的棋子
        for (const piece of pieces) {
            if (piece.side === side) {
                // 获取该棋子的所有合法移动
                const validMoves = Rules.getValidMoves(piece, pieces);
                
                // 将每个移动添加到结果数组
                for (const to of validMoves) {
                    moves.push({
                        piece: piece,
                        to: to
                    });
                }
            }
        }
        
        return moves;
    }
    
    /**
     * 极小极大算法（带Alpha-Beta剪枝）
     * @param {Array} pieces - 当前棋盘上的所有棋子
     * @param {number} depth - 搜索深度
     * @param {number} alpha - Alpha值
     * @param {number} beta - Beta值
     * @param {string} side - 当前玩家方
     * @return {number} 最佳分数
     */
    minimax(pieces, depth, alpha, beta, side) {
        // 达到搜索深度或游戏结束
        if (depth === 0 || this.isGameOver(pieces)) {
            return this.evaluateBoard(pieces, side === SIDES.RED ? SIDES.BLACK : SIDES.RED);
        }
        
        // 获取所有可能的移动
        const moves = this.getAllPossibleMoves(pieces, side);
        
        if (moves.length === 0) {
            // 无子可走，可能是将军或平局
            return this.evaluateBoard(pieces, side === SIDES.RED ? SIDES.BLACK : SIDES.RED);
        }
        
        let bestScore = -Infinity;
        
        for (const move of moves) {
            // 模拟移动
            const newPieces = Rules.simulateMove(move.piece, move.to, pieces);
            
            // 递归评估（交换玩家）
            const score = -this.minimax(
                newPieces,
                depth - 1,
                -beta,
                -alpha,
                side === SIDES.RED ? SIDES.BLACK : SIDES.RED
            );
            
            // 更新最佳分数
            bestScore = Math.max(bestScore, score);
            alpha = Math.max(alpha, score);
            
            // Alpha-Beta剪枝
            if (alpha >= beta) {
                break;
            }
        }
        
        return bestScore;
    }
    
    /**
     * 检查游戏是否结束
     * @param {Array} pieces - 当前棋盘上的所有棋子
     * @return {boolean} 游戏是否结束
     */
    isGameOver(pieces) {
        // 检查是否有一方的将/帅被吃掉
        const redKing = pieces.find(p => p.type === PIECE_TYPES.KING && p.side === SIDES.RED);
        const blackKing = pieces.find(p => p.type === PIECE_TYPES.KING && p.side === SIDES.BLACK);
        
        return !redKing || !blackKing;
    }
    
    /**
     * 评估棋盘局势
     * @param {Array} pieces - 当前棋盘上的所有棋子
     * @param {string} side - 评估方（通常是AI方，黑方）
     * @return {number} 评估分数
     */
    evaluateBoard(pieces, side) {
        let score = 0;
        
        // 基础分数：棋子价值
        for (const piece of pieces) {
            let pieceValue = piece.getValue();
            
            // 位置加成
            pieceValue += this.getPositionBonus(piece);
            
            // 如果是我方棋子，加分；否则减分
            if (piece.side === side) {
                score += pieceValue;
            } else {
                score -= pieceValue;
            }
        }
        
        // 棋子机动性加成（可移动位置数量）
        score += this.getMobilityBonus(pieces, side);
        
        // 将军加成
        if (Rules.isChecked(side === SIDES.RED ? SIDES.BLACK : SIDES.RED, pieces)) {
            score += 50; // 将对方军，加分
        }
        
        if (Rules.isChecked(side, pieces)) {
            score -= 50; // 被对方将军，减分
        }
        
        return score;
    }
    
    /**
     * 获取棋子位置加成
     * @param {Piece} piece - 棋子
     * @return {number} 位置加成分数
     */
    getPositionBonus(piece) {
        const [x, y] = piece.position;
        let bonus = 0;
        
        switch (piece.type) {
            case PIECE_TYPES.PAWN:
                // 兵过河有额外加成
                if ((piece.side === SIDES.RED && y < 5) || 
                    (piece.side === SIDES.BLACK && y > 4)) {
                    bonus += 15;
                }
                
                // 兵靠近敌方底线有加成
                if (piece.side === SIDES.RED) {
                    bonus += (9 - y) * 2; // 越靠近黑方底线越好
                } else {
                    bonus += y * 2; // 越靠近红方底线越好
                }
                break;
                
            case PIECE_TYPES.HORSE:
            case PIECE_TYPES.CANNON:
                // 马和炮在中间位置更有价值
                const centerX = Math.abs(x - 4);
                const centerY = Math.abs(y - 4.5);
                bonus += (4 - centerX) * 2 + (4.5 - centerY) * 2;
                break;
                
            case PIECE_TYPES.CHARIOT:
                // 车在开阔位置更有价值
                if (x === 0 || x === 8 || y === 0 || y === 9) {
                    bonus += 10; // 在边缘，容易控制整行/列
                }
                break;
        }
        
        return bonus;
    }
    
    /**
     * 获取机动性加成（可移动位置数量）
     * @param {Array} pieces - 当前棋盘上的所有棋子
     * @param {string} side - 评估方
     * @return {number} 机动性加成分数
     */
    getMobilityBonus(pieces, side) {
        let myMobility = 0;
        let opponentMobility = 0;
        
        for (const piece of pieces) {
            const moves = Rules.getValidMoves(piece, pieces);
            
            if (piece.side === side) {
                myMobility += moves.length;
            } else {
                opponentMobility += moves.length;
            }
        }
        
        // 机动性差异作为加成
        return (myMobility - opponentMobility) * 0.1;
    }
}
