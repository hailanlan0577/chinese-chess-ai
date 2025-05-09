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
        
        // 添加缓存大小限制
        this.MAX_CACHE_SIZE = 1000;
        
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
     * 管理缓存大小
     * @param {Map} cache - 要管理的缓存
     */
    manageCacheSize(cache) {
        if (cache.size > this.MAX_CACHE_SIZE) {
            // 删除最旧的20%缓存条目
            const keysToDelete = Array.from(cache.keys()).slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2));
            keysToDelete.forEach(key => cache.delete(key));
            console.log(`缓存清理：删除了 ${keysToDelete.length} 个条目`);
        }
    }
    
    /**
     * 获取棋盘状态的哈希值（用于缓存）
     * @param {Array} pieces - 棋子数组
     * @return {string} 哈希值
     */
    getBoardHash(pieces) {
        // 优化：只使用关键信息生成哈希，提高性能
        return pieces.map(p => `${p.type}_${p.side}_${p.position.join(',')}`).sort().join('|');
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
        try {
            console.time('AI思考时间');
            console.log(`AI开始分析棋局，棋子数量: ${pieces.length}`);
            
            const boardHash = this.getBoardHash(pieces);
            
            // 尝试从缓存获取移动
            if (CACHE_ENABLED && this.moveCache.has(boardHash)) {
                const cachedMove = this.moveCache.get(boardHash);
                
                // 验证缓存的移动是否仍然有效
                const actualPiece = pieces.find(p => 
                    p.type === cachedMove.piece.type && 
                    p.side === cachedMove.piece.side && 
                    p.position[0] === cachedMove.piece.position[0] && 
                    p.position[1] === cachedMove.piece.position[1]
                );
                
                if (actualPiece) {
                    // 验证移动是否合法
                    const validMoves = Rules.getValidMoves(actualPiece, pieces);
                    const isValidMove = validMoves.some(move => 
                        move[0] === cachedMove.to[0] && 
                        move[1] === cachedMove.to[1]
                    );
                    
                    if (isValidMove) {
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
            
            // 添加随机顺序遍历，避免AI总是选择相同移动
            const shuffledMoves = this.shuffleArray([...allMoves]);
            
            for (const move of shuffledMoves) {
                try {
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
                } catch (error) {
                    console.error(`评估移动时出错: ${error.message}`, error);
                    // 继续处理下一个移动
                    continue;
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
                
                // 管理缓存大小
                this.manageCacheSize(this.moveCache);
            }
            
            console.timeEnd('AI思考时间');
            return selectedMove;
        } catch (error) {
            console.error(`AI获取最佳移动时出错: ${error.message}`, error);
            console.timeEnd('AI思考时间');
            
            // 失败时选择一个随机合法移动
            try {
                const allMoves = this.getAllPossibleMoves(pieces, side);
                if (allMoves.length > 0) {
                    return allMoves[Math.floor(Math.random() * allMoves.length)];
                }
            } catch (e) {
                console.error("尝试随机移动也失败:", e);
            }
            
            return null;
        }
    }
    
    /**
     * 打乱数组顺序（Fisher-Yates洗牌算法）
     * @param {Array} array - 要打乱的数组
     * @return {Array} 打乱后的数组
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    /**
     * 获取所有可能的移动
     * @param {Array} pieces - 当前棋盘上的所有棋子
     * @param {string} side - 当前方
     * @return {Array} 所有可能移动的数组，每个元素格式为 {piece, to}
     */
    getAllPossibleMoves(pieces, side) {
        try {
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
                
                // 管理缓存大小
                this.manageCacheSize(this.moveCache);
            }
            
            return moves;
        } catch (error) {
            console.error(`获取所有可能移动时出错: ${error.message}`, error);
            return []; // 发生错误时返回空数组
        }
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
        try {
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
                    this.manageCacheSize(this.evalCache);
                }
                return score;
            }
            
            let bestScore = -Infinity;
            
            // 随机排序以增加AI变化
            const shuffledMoves = depth >= this.difficulty.depth - 1 ? 
                this.shuffleArray([...moves]) : moves;
            
            for (const move of shuffledMoves) {
                try {
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
                } catch (error) {
                    console.error(`极小极大搜索中出错: ${error.message}`, error);
                    // 继续处理下一个移动
                    continue;
                }
            }
            
            // 缓存结果
            if (CACHE_ENABLED) {
                this.evalCache.set(cacheKey, bestScore);
                this.manageCacheSize(this.evalCache);
            }
            
            return bestScore;
        } catch (error) {
            console.error(`极小极大算法出错: ${error.message}`, error);
            // 出错时返回0分，不影响整体评估
            return 0;
        }
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
        try {
            // 尝试从缓存获取
            const cacheKey = this.getBoardHash(pieces) + `_eval_${side}`;
            if (CACHE_ENABLED && this.evalCache.has(cacheKey)) {
                return this.evalCache.get(cacheKey);
            }
            
            // 检查是否有一方胜利
            const redKing = pieces.find(p => p.type === PIECE_TYPES.KING && p.side === SIDES.RED);
            const blackKing = pieces.find(p => p.type === PIECE_TYPES.KING && p.side === SIDES.BLACK);
            
            // 如果己方将帅被吃，返回最低分
            if ((side === SIDES.RED && !redKing) || (side === SIDES.BLACK && !blackKing)) {
                return -10000;
            }
            
            // 如果对方将帅被吃，返回最高分
            if ((side === SIDES.RED && !blackKing) || (side === SIDES.BLACK && !redKing)) {
                return 10000;
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
            const oppositeSide = side === SIDES.RED ? SIDES.BLACK : SIDES.RED;
            if (Rules.isChecked(oppositeSide, pieces)) {
                score += 50; // 将对方军，加分
            }
            
            if (Rules.isChecked(side, pieces)) {
                score -= 50; // 被对方将军，减分
            }
            
            // 缓存结果
            if (CACHE_ENABLED) {
                this.evalCache.set(cacheKey, score);
                this.manageCacheSize(this.evalCache);
            }
            
            return score;
        } catch (error) {
            console.error(`评估棋盘出错: ${error.message}`, error);
            return 0; // 出错时返回中性分数
        }
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
            
            case PIECE_TYPES.KING:
                // 鼓励将帅远离边界，位于九宫中间位置
                if (piece.side === SIDES.RED) {
                    // 红方将帅，中间位置是(4,8)
                    bonus += (4 - Math.abs(x - 4)) * 2;
                    bonus += (8 - Math.abs(y - 8)) * 2;
                } else {
                    // 黑方将帅，中间位置是(4,1)
                    bonus += (4 - Math.abs(x - 4)) * 2;
                    bonus += (1 - Math.abs(y - 1)) * 2;
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
