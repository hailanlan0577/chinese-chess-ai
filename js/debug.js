/**
 * 调试工具 - 用于帮助排查游戏问题
 */

// 调试模式开关
const DEBUG = true;

// 调试日志级别
const DEBUG_LEVELS = {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    LOG: 'log'
};

/**
 * 显示调试信息
 * @param {string} message - 调试消息
 * @param {string} level - 日志级别
 */
function debug(message, level = DEBUG_LEVELS.LOG) {
    if (!DEBUG) return;
    
    const timestamp = new Date().toISOString().substring(11, 23);
    const formattedMessage = `[${timestamp}] ${message}`;
    
    switch (level) {
        case DEBUG_LEVELS.INFO:
            console.info(formattedMessage);
            break;
        case DEBUG_LEVELS.WARN:
            console.warn(formattedMessage);
            break;
        case DEBUG_LEVELS.ERROR:
            console.error(formattedMessage);
            break;
        default:
            console.log(formattedMessage);
    }
}

/**
 * 打印棋盘状态
 * @param {Array} pieces - 棋子数组
 */
function debugBoardState(pieces) {
    if (!DEBUG) return;
    
    // 创建空棋盘
    const board = Array(BOARD_SIZE.HEIGHT).fill().map(() => Array(BOARD_SIZE.WIDTH).fill('  '));
    
    // 填充棋子
    pieces.forEach(piece => {
        const [x, y] = piece.position;
        
        if (x >= 0 && x < BOARD_SIZE.WIDTH && y >= 0 && y < BOARD_SIZE.HEIGHT) {
            let symbol = PIECE_CHARS[piece.side][piece.type];
            if (piece.side === SIDES.BLACK) {
                symbol = `[${symbol}]`;
            } else {
                symbol = ` ${symbol} `;
            }
            board[y][x] = symbol;
        }
    });
    
    // 打印棋盘
    let boardStr = '\n';
    boardStr += '   0  1  2  3  4  5  6  7  8 \n';
    boardStr += '  ----------------------------- \n';
    
    for (let y = 0; y < BOARD_SIZE.HEIGHT; y++) {
        boardStr += `${y} |`;
        for (let x = 0; x < BOARD_SIZE.WIDTH; x++) {
            boardStr += board[y][x];
        }
        boardStr += '|\n';
    }
    boardStr += '  ----------------------------- \n';
    
    console.log(boardStr);
}

/**
 * 检查AI逻辑
 * @param {Object} ai - AI对象
 * @param {Array} pieces - 棋子数组
 * @param {string} side - AI方
 */
function debugAI(ai, pieces, side) {
    if (!DEBUG) return;
    
    debug(`开始AI调试 (${side})`, DEBUG_LEVELS.INFO);
    
    try {
        // 打印当前棋盘状态
        debug('当前棋盘状态:', DEBUG_LEVELS.INFO);
        debugBoardState(pieces);
        
        // 列出所有可能的移动
        const allMoves = ai.getAllPossibleMoves(pieces, side);
        debug(`AI可能的移动数量: ${allMoves.length}`, DEBUG_LEVELS.INFO);
        
        if (allMoves.length === 0) {
            debug('AI无子可走', DEBUG_LEVELS.WARN);
            return;
        }
        
        // 打印每个可能移动的分数
        debug('移动评分:', DEBUG_LEVELS.INFO);
        
        for (const move of allMoves) {
            const [fromX, fromY] = move.piece.position;
            const [toX, toY] = move.to;
            
            // 模拟移动
            const newPieces = Rules.simulateMove(move.piece, move.to, pieces);
            
            // 评估分数
            const oppositeSide = side === SIDES.RED ? SIDES.BLACK : SIDES.RED;
            const score = ai.evaluateBoard(newPieces, side);
            
            debug(`${move.piece.getChar()} [${fromX},${fromY}] -> [${toX},${toY}]: 分数 ${score}`);
        }
        
        // 获取最佳移动
        const bestMove = ai.getBestMove(pieces, side);
        
        if (bestMove) {
            const [fromX, fromY] = bestMove.piece.position;
            const [toX, toY] = bestMove.to;
            debug(`最佳移动: ${bestMove.piece.getChar()} [${fromX},${fromY}] -> [${toX},${toY}]`, DEBUG_LEVELS.INFO);
        } else {
            debug('无法找到最佳移动', DEBUG_LEVELS.ERROR);
        }
    } catch (error) {
        debug(`AI调试出错: ${error.message}`, DEBUG_LEVELS.ERROR);
        console.error(error);
    }
}

// 将调试函数添加到全局作用域
window.debug = debug;
window.debugBoardState = debugBoardState;
window.debugAI = debugAI;

// 添加全局错误处理
window.addEventListener('error', (event) => {
    debug(`全局错误: ${event.message} (${event.filename}:${event.lineno})`, DEBUG_LEVELS.ERROR);
});

// 在游戏开始时打印一条调试信息
document.addEventListener('DOMContentLoaded', () => {
    debug('调试模式已启用', DEBUG_LEVELS.INFO);
});
