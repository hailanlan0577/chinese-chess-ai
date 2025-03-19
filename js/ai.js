/**
 * AI类 - 实现电脑玩家的决策逻辑
 */
class ChessAI {
    constructor() {
        // 默认使用中等难度
        this.setDifficulty('medium');
        
        // 缓存系统
        this.moveCache = new Map(); // 移动缓存
        this.evalCache = new Map(); // 评估缓存
        
        console.log("AI初始化完成，默认难度：medium");
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
        
        // 清除缓存，因为难度改变会影响评估
        this.clearCache();
        
        console.log(`AI难度设置为 ${level}，搜索深度: ${this.difficulty.depth}, 随机因子: ${this.difficulty.randomFactor}`);
    }
    
    /**
     * 清除AI缓存
     */
    clearCache() {
        this.moveCache.clear();
        this.evalCache.clear();
        console.log("AI缓存已清除");
    }
    
    /**
     * 获取棋盘状态的哈希值（用于缓存）
     * @param {Array} pieces - 棋子数组
     * @return {string} 哈希值
     */
    getBoardHash(pieces) {
        // 简单的序列化，足够作为缓存键
        return JSON.stringify(pieces.map(p => ({
            t: p.type,
            s: p.side,
            p: p.position
        })));
    }
    
    /**
     * 获取移动状态哈希（用于缓存）
     * @param {Piece} piece - 棋子
     * @param {Array} position - 目标位置
     * @param {Array} pieces - 所有棋子
     * @return {string} 哈希值
     */
    getMoveHash(piece, position, pieces) {
        return `${piece.type}_${piece.side}_${piece.position.join(',')}_${position.join(',')}_${this.getBoardHash(pieces)}`;
    }
    
    /**
     * 获取AI的最佳移动
     * @param {Array} pieces - 当前棋盘上的所有棋子
     * @param {string} side - AI方（通常是黑方）
     * @return {Object} 最佳移动，格式为 {piece, to}
     */
    getBestMove(pieces, side) {
        console.time('AI思考时间');
        console.log(`AI开始分析棋局，棋子数量: ${pieces.length}`);
        
        const boardHash = this.getBoardHash(pieces);
        
        // 尝试从缓存获取移动
        if (CACHE_ENABLED && this.moveCache.has(boardHash)) {
            const cachedMove = this.moveCache.get(boardHash);
            
            // 验证缓存的移动是否仍然有效
            const isValid = pieces.some(p => 
                p.type === cachedMove.piece.type && 
                p.side === cachedMove.piece.side && 
                p.position[0] === cachedMove.piece.position[0] && 
                p.position[1] === cachedMove.piece.position[1]
            );
            
            if (isValid) {
                const actualPiece = pieces.find(p => 
                    p.type === cachedMove.piece.type && 
                    p.side === cachedMove.piece.side && 
                    p.position[0] === cachedMove.piece.position[0] && 
                    p.position[1] === cachedMove.piece.position[1]
                );
                
                if (actualPiece) {
                    console.log(`从缓存中获取最佳移动`);
                    console.timeEnd('AI思考时间');
                    return {
                        piece: actualPiece,
                        to: cachedMove.to
                    };
                }
            }
        }
        
        // 找出所有可能的移动
        const allMoves = this.getAllPossibleMoves(pieces, side);
        console.log(`AI可能的移动数量: ${allMoves.length}`);
        
        if (allMoves.length === 0) {
            console.log("AI无子可走");
            console.timeEnd('AI思考时间');
            return null; // 无子可走
        }
        
        // 如果只有一个可能的移动，直接返回
        if (allMoves.length === 1) {
            console.log("只有一个可能的移动，直接返回");
            console.timeEnd('AI思考时间');
            return allMoves[0];
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
        
        console.log(`找到 ${bestMoves.length} 个最佳移动，分数: ${bestScore}`);
        
        let selectedMove = null;
        
        // 随机选择一个最佳移动（加入随机性）
        if (bestMoves.length > 0) {
            // 根据难度，可能选择次优解
            if (Math.random() < this.difficulty.randomFactor) {
                // 随机选择一个可能的移动，而不一定是最佳移动
                selectedMove = allMoves[Math.floor(Math.random() * allMoves.length)];
                console.log(`选择随机移动`);
            } else {
                // 在最佳移动中随机选择
                selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
                console.log(`选择最佳移动`);
            }
        }
        
        // 缓存这个移动
        if (CACHE_ENABLED && selectedMove) {
            this.moveCache.set(boardHash, {
                piece: {
                    type: selectedMove.piece.type,
                    side: selectedMove.piece.side,
                    position: [...selectedMove.piece.position]
                },
                to: [...selectedMove.to]
            });
        }
        
        console.timeEnd('AI思考时间');
        return selectedMove;
    }
    
    /**
     * 获取所有可能的移动
     * @param {Array} pieces - 当前棋盘上的所有棋子
     * @param {string} side - 当前方
     * @return {Array} 所有可能移动的数组，每个元素格式为 {piece, to}
     */
    getAllPossibleMoves(pieces, side) {
        const boardHash = this.getBoardHash(pieces) + '_' + side;
        
        // 尝试从缓存获取
        if (CACHE_ENABLED && this.moveCache.has(boardHash + '_moves')) {
            const cachedMoves = this.moveCache.get(boardHash + '_moves');
            
            // 将缓存数据转换回实际的棋子对象
            const validMoves = [];
            for (const move of cachedMoves) {
                const piece = pieces.find(p => 
                    p.type === move.pieceType && 
                    p.side === move.pieceSide && 
                    p.position[0] === move.from[0] && 
                    p.position[1] === move.from[1]
                );
                
                if (piece) {
                    validMoves.push({
                        piece: piece,
                        to: move.to
                    });
                }
            }
            
            if (validMoves.length > 0) {
                console.log(`从缓存中获取 ${validMoves.length} 个可能移动`);
                return validMoves;
            }
        }
        
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
        
        // 缓存结果 - 以简化的形式存储，不存储完整的棋子对象
        if (CACHE_ENABLED) {
            const simplifiedMoves = moves.map(move => ({
                pieceType: move.piece.type,
                pieceSide: move.piece.side,
                from: [...move.piece.position],
                to: [...move.to]
            }));
            
            this.moveCache.set(boardHash + '_moves', simplifiedMoves);
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
        // 检查递归终止条件
        if (depth <= 0 || this.isGameOver(pieces)) {
            return this.evaluateBoard(pieces, side === SIDES.RED ? SIDES.BLACK : SIDES.RED);
        }
        
        // 尝试从缓存获取
        const cacheKey = this.getBoardHash(pieces) + `_${depth}_${side}`;
        if (CACHE_ENABLED && this.evalCache.has(cacheKey)) {
            return this.evalCache.get(cacheKey);
        }
        
        // 获取所有可能的移动
        const moves = this.getAllPossibleMoves(pieces, side);
        
        if (moves.length === 0) {
            // 无子可走，可能是将军或平局
            const score = this.evaluateBoard(pieces, side === SIDES.RED ? SIDES.BLACK : SIDES.RED);
            if (CACHE_ENABLED) {
                this.evalCache.set(cacheKey, score);
            }
            return score;
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
        
        // 缓存结果
        if (CACHE_ENABLED) {
            this.evalCache.set(cacheKey, bestScore);
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
        // 尝试从缓存获取
        const cacheKey = this.getBoardHash(pieces) + `_eval_${side}`;
        if (CACHE_ENABLED && this.evalCache.has(cacheKey)) {
            return this.evalCache.get(cacheKey);
        }
        
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
        
        // 机动性加成（可移动位置数量）
        score += this.getMobilityBonus(pieces, side);
        
        // 将军加成
        if (Rules.isChecked(side === SIDES.RED ? SIDES.BLACK : SIDES.RED, pieces)) {
            score += 50; // 将对方军，加分
        }
        
        if (Rules.isChecked(side, pieces)) {
            score -= 50; // 被对方将军，减分
        }
        
        // 缓存结果
        if (CACHE_ENABLED) {
            this.evalCache.set(cacheKey, score);
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
        // 机动性检查在较低深度上可以简化，提高性能
        let myMobility = 0;
        let opponentMobility = 0;
        
        // 简化：使用快速的固定值而不是实际计算移动数量
        const mobilityValues = {
            [PIECE_TYPES.KING]: 4,
            [PIECE_TYPES.ADVISOR]: 2,
            [PIECE_TYPES.ELEPHANT]: 4,
            [PIECE_TYPES.HORSE]: 8,
            [PIECE_TYPES.CHARIOT]: 10,
            [PIECE_TYPES.CANNON]: 10,
            [PIECE_TYPES.PAWN]: 3
        };
        
        for (const piece of pieces) {
            const baseValue = mobilityValues[piece.type] || 0;
            
            if (piece.side === side) {
                myMobility += baseValue;
            } else {
                opponentMobility += baseValue;
            }
        }
        
        // 机动性差异作为加成
        return (myMobility - opponentMobility) * 0.1;
    }
}
