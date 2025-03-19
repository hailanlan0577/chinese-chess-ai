/**
 * 规则类 - 定义和检查中国象棋的规则
 */
class Rules {
    /**
     * 获取棋子的所有合法移动位置
     * @param {Piece} piece - 要移动的棋子
     * @param {Array} pieces - 棋盘上的所有棋子
     * @return {Array} 合法的移动位置数组，每个位置是 [x, y]
     */
    static getValidMoves(piece, pieces) {
        try {
            // 获取所有可能的移动
            let moves = this.getPossibleMoves(piece, pieces);
            
            console.log(`棋子 ${piece.getChar()} [${piece.position}] 的初步合法移动: ${moves.length}个`);
            
            // 过滤掉会导致将军的移动
            moves = this.filterCheckMoves(piece, moves, pieces);
            
            console.log(`棋子 ${piece.getChar()} [${piece.position}] 的最终合法移动: ${moves.length}个`);
            
            return moves;
        } catch (error) {
            console.error(`获取有效移动时出错: ${error.message}`, error);
            // 返回空数组，避免程序崩溃
            return [];
        }
    }
    
    /**
     * 获取棋子的所有可能移动位置（不考虑将军）
     * @param {Piece} piece - 要移动的棋子
     * @param {Array} pieces - 棋盘上的所有棋子
     * @return {Array} 可能的移动位置数组
     */
    static getPossibleMoves(piece, pieces) {
        const [x, y] = piece.position;
        let moves = [];
        
        try {
            switch (piece.type) {
                case PIECE_TYPES.KING:
                    moves = this.getKingMoves(piece, pieces);
                    break;
                case PIECE_TYPES.ADVISOR:
                    moves = this.getAdvisorMoves(piece, pieces);
                    break;
                case PIECE_TYPES.ELEPHANT:
                    moves = this.getElephantMoves(piece, pieces);
                    break;
                case PIECE_TYPES.HORSE:
                    moves = this.getHorseMoves(piece, pieces);
                    break;
                case PIECE_TYPES.CHARIOT:
                    moves = this.getChariotMoves(piece, pieces);
                    break;
                case PIECE_TYPES.CANNON:
                    moves = this.getCannonMoves(piece, pieces);
                    break;
                case PIECE_TYPES.PAWN:
                    moves = this.getPawnMoves(piece, pieces);
                    break;
                default:
                    console.error(`未知棋子类型: ${piece.type}`);
            }
            
            // 过滤掉超出棋盘范围的移动
            moves = moves.filter(([nx, ny]) => {
                return nx >= 0 && nx < BOARD_SIZE.WIDTH && ny >= 0 && ny < BOARD_SIZE.HEIGHT;
            });
            
            // 过滤掉吃自己棋子的移动
            moves = moves.filter(([nx, ny]) => {
                const targetPiece = this.getPieceAt([nx, ny], pieces);
                return !targetPiece || targetPiece.side !== piece.side;
            });
            
            return moves;
        } catch (error) {
            console.error(`获取棋子 ${piece.getChar()} [${piece.position}] 的移动时出错:`, error);
            return [];
        }
    }
    
    /**
     * 获取将/帅的合法移动位置
     */
    static getKingMoves(piece, pieces) {
        const [x, y] = piece.position;
        const moves = [];
        
        // 定义九宫格范围
        const minX = 3;
        const maxX = 5;
        let minY, maxY;
        
        if (piece.side === SIDES.RED) {
            minY = 7;
            maxY = 9;
        } else {
            minY = 0;
            maxY = 2;
        }
        
        // 上下左右各走一步
        const directions = [
            [0, -1], // 上
            [1, 0],  // 右
            [0, 1],  // 下
            [-1, 0]  // 左
        ];
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            // 确保在九宫格内
            if (nx >= minX && nx <= maxX && ny >= minY && ny <= maxY) {
                moves.push([nx, ny]);
            }
        }
        
        // 特殊规则：将帅对面
        const oppositeSide = piece.side === SIDES.RED ? SIDES.BLACK : SIDES.RED;
        const oppositeKing = pieces.find(p => p.type === PIECE_TYPES.KING && p.side === oppositeSide);
        
        if (oppositeKing) {
            const [kx, ky] = oppositeKing.position;
            
            // 如果在同一列
            if (x === kx) {
                // 检查两个将/帅之间是否有其他棋子
                let hasBlockingPiece = false;
                const minY1 = Math.min(y, ky);
                const maxY1 = Math.max(y, ky);
                
                for (let py = minY1 + 1; py < maxY1; py++) {
                    if (this.getPieceAt([x, py], pieces)) {
                        hasBlockingPiece = true;
                        break;
                    }
                }
                
                // 如果没有阻挡，可以直接\"吃\"对方将/帅
                if (!hasBlockingPiece) {
                    moves.push([kx, ky]);
                }
            }
        }
        
        return moves;
    }
    
    /**
     * 获取士/仕的合法移动位置
     */
    static getAdvisorMoves(piece, pieces) {
        const [x, y] = piece.position;
        const moves = [];
        
        // 定义九宫格范围
        const minX = 3;
        const maxX = 5;
        let minY, maxY;
        
        if (piece.side === SIDES.RED) {
            minY = 7;
            maxY = 9;
        } else {
            minY = 0;
            maxY = 2;
        }
        
        // 四个对角线方向各走一步
        const directions = [
            [-1, -1], // 左上
            [1, -1],  // 右上
            [-1, 1],  // 左下
            [1, 1]    // 右下
        ];
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            // 确保在九宫格内
            if (nx >= minX && nx <= maxX && ny >= minY && ny <= maxY) {
                moves.push([nx, ny]);
            }
        }
        
        return moves;
    }
    
    /**
     * 获取象/相的合法移动位置
     */
    static getElephantMoves(piece, pieces) {
        const [x, y] = piece.position;
        const moves = [];
        
        // 四个对角线方向各走两步
        const directions = [
            [-2, -2], // 左上
            [2, -2],  // 右上
            [-2, 2],  // 左下
            [2, 2]    // 右下
        ];
        
        // 象眼位置
        const eyes = [
            [-1, -1], // 左上象眼
            [1, -1],  // 右上象眼
            [-1, 1],  // 左下象眼
            [1, 1]    // 右下象眼
        ];
        
        // 象不能过河
        const riverLine = piece.side === SIDES.RED ? 4 : 5;
        
        for (let i = 0; i < directions.length; i++) {
            const [dx, dy] = directions[i];
            const nx = x + dx;
            const ny = y + dy;
            
            // 首先检查目标位置是否在棋盘范围内
            if (nx < 0 || nx >= BOARD_SIZE.WIDTH || ny < 0 || ny >= BOARD_SIZE.HEIGHT) {
                continue;
            }
            
            // 确保不过河
            if ((piece.side === SIDES.RED && ny >= 5) || (piece.side === SIDES.BLACK && ny <= 4)) {
                // 检查象眼是否被塞住
                const [ex, ey] = eyes[i];
                const eyeX = x + ex;
                const eyeY = y + ey;
                
                if (!this.getPieceAt([eyeX, eyeY], pieces)) {
                    moves.push([nx, ny]);
                }
            }
        }
        
        return moves;
    }
    
    /**
     * 获取马的合法移动位置
     */
    static getHorseMoves(piece, pieces) {
        const [x, y] = piece.position;
        const moves = [];
        
        // 马走日
        const directions = [
            [-1, -2], // 左上
            [1, -2],  // 右上
            [-2, -1], // 上左
            [2, -1],  // 上右
            [-2, 1],  // 下左
            [2, 1],   // 下右
            [-1, 2],  // 左下
            [1, 2]    // 右下
        ];
        
        // 马腿位置
        const legs = [
            [0, -1], // 上方马腿
            [0, -1], // 上方马腿
            [-1, 0], // 左方马腿
            [1, 0],  // 右方马腿
            [-1, 0], // 左方马腿
            [1, 0],  // 右方马腿
            [0, 1],  // 下方马腿
            [0, 1]   // 下方马腿
        ];
        
        for (let i = 0; i < directions.length; i++) {
            const [dx, dy] = directions[i];
            const nx = x + dx;
            const ny = y + dy;
            
            // 首先检查目标位置是否在棋盘范围内
            if (nx < 0 || nx >= BOARD_SIZE.WIDTH || ny < 0 || ny >= BOARD_SIZE.HEIGHT) {
                continue;
            }
            
            // 检查马腿是否被塞住
            const [lx, ly] = legs[i];
            const legX = x + lx;
            const legY = y + ly;
            
            if (!this.getPieceAt([legX, legY], pieces)) {
                moves.push([nx, ny]);
            }
        }
        
        return moves;
    }
    
    /**
     * 获取车的合法移动位置
     */
    static getChariotMoves(piece, pieces) {
        const [x, y] = piece.position;
        const moves = [];
        
        // 上下左右四个方向
        const directions = [
            [0, -1], // 上
            [1, 0],  // 右
            [0, 1],  // 下
            [-1, 0]  // 左
        ];
        
        for (const [dx, dy] of directions) {
            let nx = x;
            let ny = y;
            
            // 沿着方向一直走，直到碰到边界或其他棋子
            while (true) {
                nx += dx;
                ny += dy;
                
                // 超出边界
                if (nx < 0 || nx >= BOARD_SIZE.WIDTH || ny < 0 || ny >= BOARD_SIZE.HEIGHT) {
                    break;
                }
                
                const targetPiece = this.getPieceAt([nx, ny], pieces);
                
                if (!targetPiece) {
                    // 空位置，可以走
                    moves.push([nx, ny]);
                } else {
                    // 碰到棋子
                    if (targetPiece.side !== piece.side) {
                        // 可以吃子
                        moves.push([nx, ny]);
                    }
                    break; // 无论是否可以吃子，都要停止
                }
            }
        }
        
        return moves;
    }
    
    /**
     * 获取炮的合法移动位置
     */
    static getCannonMoves(piece, pieces) {
        const [x, y] = piece.position;
        const moves = [];
        
        // 上下左右四个方向
        const directions = [
            [0, -1], // 上
            [1, 0],  // 右
            [0, 1],  // 下
            [-1, 0]  // 左
        ];
        
        for (const [dx, dy] of directions) {
            let nx = x;
            let ny = y;
            let hasObstacle = false; // 是否已经遇到障碍物
            
            // 沿着方向一直走
            while (true) {
                nx += dx;
                ny += dy;
                
                // 超出边界
                if (nx < 0 || nx >= BOARD_SIZE.WIDTH || ny < 0 || ny >= BOARD_SIZE.HEIGHT) {
                    break;
                }
                
                const targetPiece = this.getPieceAt([nx, ny], pieces);
                
                if (!targetPiece) {
                    // 空位置
                    if (!hasObstacle) {
                        // 没有障碍物时，可以走到空位置
                        moves.push([nx, ny]);
                    }
                } else {
                    // 碰到棋子
                    if (!hasObstacle) {
                        // 第一次碰到棋子，作为炮架
                        hasObstacle = true;
                    } else {
                        // 第二次碰到棋子，可以吃子（如果是敌方棋子）
                        if (targetPiece.side !== piece.side) {
                            moves.push([nx, ny]);
                        }
                        break; // 无论如何，遇到第二个棋子后停止
                    }
                }
            }
        }
        
        return moves;
    }
    
    /**
     * 获取兵/卒的合法移动位置
     */
    static getPawnMoves(piece, pieces) {
        const [x, y] = piece.position;
        const moves = [];
        
        // 兵/卒只能前进，红方向上（y减小），黑方向下（y增大）
        const forwardDir = piece.side === SIDES.RED ? -1 : 1;
        
        // 是否已过河（红方y<5，黑方y>4）
        const crossedRiver = piece.side === SIDES.RED ? y < 5 : y > 4;
        
        // 前进
        const forwardY = y + forwardDir;
        if (forwardY >= 0 && forwardY < BOARD_SIZE.HEIGHT) {
            moves.push([x, forwardY]);
        }
        
        // 过河后可以左右移动
        if (crossedRiver) {
            // 左移
            if (x > 0) {
                moves.push([x - 1, y]);
            }
            
            // 右移
            if (x < BOARD_SIZE.WIDTH - 1) {
                moves.push([x + 1, y]);
            }
        }
        
        return moves;
    }
    
    /**
     * 过滤掉会导致自己被将军的移动
     */
    static filterCheckMoves(piece, moves, pieces) {
        try {
            const side = piece.side;
            
            return moves.filter(([nx, ny]) => {
                try {
                    // 模拟移动
                    const simulatedPieces = this.simulateMove(piece, [nx, ny], pieces);
                    
                    // 检查移动后是否会被将军
                    return !this.isChecked(side, simulatedPieces);
                } catch (error) {
                    console.error(`过滤移动 [${nx}, ${ny}] 时出错:`, error);
                    return false; // 发生错误时，保守地不允许这个移动
                }
            });
        } catch (error) {
            console.error("过滤将军移动时出错:", error);
            return []; // 发生错误时返回空数组，避免程序崩溃
        }
    }
    
    /**
     * 模拟移动棋子，返回移动后的棋盘状态
     */
    static simulateMove(piece, newPos, pieces) {
        try {
            // 深拷贝所有棋子
            const newPieces = pieces.map(p => {
                return new Piece(p.type, p.side, [...p.position]);
            });
            
            // 找到目标棋子
            const movingPiece = newPieces.find(p => {
                const [px, py] = p.position;
                const [x, y] = piece.position;
                return px === x && py === y && p.type === piece.type && p.side === piece.side;
            });
            
            if (!movingPiece) {
                console.error("模拟移动：找不到棋子");
                return newPieces;
            }
            
            // 检查目标位置是否有棋子需要移除
            const [nx, ny] = newPos;
            const targetIndex = newPieces.findIndex(p => {
                const [px, py] = p.position;
                return px === nx && py === ny;
            });
            
            // 如果有，移除目标位置的棋子
            if (targetIndex !== -1) {
                newPieces.splice(targetIndex, 1);
            }
            
            // 移动棋子
            movingPiece.position = [...newPos];
            
            return newPieces;
        } catch (error) {
            console.error("模拟移动出错:", error);
            return [...pieces]; // 返回原始棋子，避免错误传播
        }
    }
    
    /**
     * 检查指定方是否被将军
     */
    static isChecked(side, pieces) {
        try {
            // 找到将/帅
            const king = pieces.find(p => p.type === PIECE_TYPES.KING && p.side === side);
            if (!king) {
                console.error(`找不到 ${side} 方将帅`);
                return false; // 没有将/帅，不算被将军
            }
            
            const [kx, ky] = king.position;
            
            // 检查是否有敌方棋子可以吃到将/帅
            const oppositeSide = side === SIDES.RED ? SIDES.BLACK : SIDES.RED;
            
            for (const piece of pieces) {
                if (piece.side !== oppositeSide) continue;
                
                // 获取该棋子的所有可能移动（不考虑将军）
                const moves = this.getPossibleMoves(piece, pieces);
                
                // 检查是否有移动可以到达将/帅位置
                if (moves.some(([mx, my]) => mx === kx && my === ky)) {
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error("检查将军状态时出错:", error);
            return false; // 出错时保守地假设没有将军
        }
    }
    
    /**
     * 获取指定位置的棋子
     */
    static getPieceAt(position, pieces) {
        try {
            const [x, y] = position;
            return pieces.find(piece => {
                const [px, py] = piece.position;
                return px === x && py === y;
            });
        } catch (error) {
            console.error("获取指定位置棋子出错:", error);
            return null;
        }
    }
}
