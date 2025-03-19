/**
 * 中国象棋常量定义
 */
 
// 棋子类型
const PIECE_TYPES = {
    KING: 'king',        // 将/帅
    ADVISOR: 'advisor',  // 士/仕
    ELEPHANT: 'elephant',// 象/相
    HORSE: 'horse',      // 马
    CHARIOT: 'chariot',  // 车
    CANNON: 'cannon',    // 炮
    PAWN: 'pawn'         // 兵/卒
};

// 棋子阵营
const SIDES = {
    RED: 'red',
    BLACK: 'black'
};

// 棋子Unicode字符
const PIECE_CHARS = {
    [SIDES.RED]: {
        [PIECE_TYPES.KING]: '帅',
        [PIECE_TYPES.ADVISOR]: '仕',
        [PIECE_TYPES.ELEPHANT]: '相',
        [PIECE_TYPES.HORSE]: '马',
        [PIECE_TYPES.CHARIOT]: '车',
        [PIECE_TYPES.CANNON]: '炮',
        [PIECE_TYPES.PAWN]: '兵'
    },
    [SIDES.BLACK]: {
        [PIECE_TYPES.KING]: '将',
        [PIECE_TYPES.ADVISOR]: '士',
        [PIECE_TYPES.ELEPHANT]: '象',
        [PIECE_TYPES.HORSE]: '马',
        [PIECE_TYPES.CHARIOT]: '车',
        [PIECE_TYPES.CANNON]: '炮',
        [PIECE_TYPES.PAWN]: '卒'
    }
};

// 初始棋盘配置
const INITIAL_BOARD = [
    // 黑方（上方）
    { type: PIECE_TYPES.CHARIOT, side: SIDES.BLACK, position: [0, 0] },
    { type: PIECE_TYPES.HORSE, side: SIDES.BLACK, position: [1, 0] },
    { type: PIECE_TYPES.ELEPHANT, side: SIDES.BLACK, position: [2, 0] },
    { type: PIECE_TYPES.ADVISOR, side: SIDES.BLACK, position: [3, 0] },
    { type: PIECE_TYPES.KING, side: SIDES.BLACK, position: [4, 0] },
    { type: PIECE_TYPES.ADVISOR, side: SIDES.BLACK, position: [5, 0] },
    { type: PIECE_TYPES.ELEPHANT, side: SIDES.BLACK, position: [6, 0] },
    { type: PIECE_TYPES.HORSE, side: SIDES.BLACK, position: [7, 0] },
    { type: PIECE_TYPES.CHARIOT, side: SIDES.BLACK, position: [8, 0] },
    { type: PIECE_TYPES.CANNON, side: SIDES.BLACK, position: [1, 2] },
    { type: PIECE_TYPES.CANNON, side: SIDES.BLACK, position: [7, 2] },
    { type: PIECE_TYPES.PAWN, side: SIDES.BLACK, position: [0, 3] },
    { type: PIECE_TYPES.PAWN, side: SIDES.BLACK, position: [2, 3] },
    { type: PIECE_TYPES.PAWN, side: SIDES.BLACK, position: [4, 3] },
    { type: PIECE_TYPES.PAWN, side: SIDES.BLACK, position: [6, 3] },
    { type: PIECE_TYPES.PAWN, side: SIDES.BLACK, position: [8, 3] },
    
    // 红方（下方）
    { type: PIECE_TYPES.PAWN, side: SIDES.RED, position: [0, 6] },
    { type: PIECE_TYPES.PAWN, side: SIDES.RED, position: [2, 6] },
    { type: PIECE_TYPES.PAWN, side: SIDES.RED, position: [4, 6] },
    { type: PIECE_TYPES.PAWN, side: SIDES.RED, position: [6, 6] },
    { type: PIECE_TYPES.PAWN, side: SIDES.RED, position: [8, 6] },
    { type: PIECE_TYPES.CANNON, side: SIDES.RED, position: [1, 7] },
    { type: PIECE_TYPES.CANNON, side: SIDES.RED, position: [7, 7] },
    { type: PIECE_TYPES.CHARIOT, side: SIDES.RED, position: [0, 9] },
    { type: PIECE_TYPES.HORSE, side: SIDES.RED, position: [1, 9] },
    { type: PIECE_TYPES.ELEPHANT, side: SIDES.RED, position: [2, 9] },
    { type: PIECE_TYPES.ADVISOR, side: SIDES.RED, position: [3, 9] },
    { type: PIECE_TYPES.KING, side: SIDES.RED, position: [4, 9] },
    { type: PIECE_TYPES.ADVISOR, side: SIDES.RED, position: [5, 9] },
    { type: PIECE_TYPES.ELEPHANT, side: SIDES.RED, position: [6, 9] },
    { type: PIECE_TYPES.HORSE, side: SIDES.RED, position: [7, 9] },
    { type: PIECE_TYPES.CHARIOT, side: SIDES.RED, position: [8, 9] }
];

// 棋子基础价值（用于AI评估）
const PIECE_VALUES = {
    [PIECE_TYPES.KING]: 10000,
    [PIECE_TYPES.ADVISOR]: 200,
    [PIECE_TYPES.ELEPHANT]: 200,
    [PIECE_TYPES.HORSE]: 400,
    [PIECE_TYPES.CHARIOT]: 900,
    [PIECE_TYPES.CANNON]: 450,
    [PIECE_TYPES.PAWN]: 100
};

// AI搜索深度（按难度级别）- 减少搜索深度，提高响应速度
const AI_DIFFICULTY = {
    EASY: {
        depth: 1,         // 降低搜索深度
        randomFactor: 0.3  // 更高的随机因子使AI有时会做出次优选择
    },
    MEDIUM: {
        depth: 2,         // 降低搜索深度
        randomFactor: 0.15
    },
    HARD: {
        depth: 3,         // 降低搜索深度
        randomFactor: 0.05
    }
};

// 棋盘尺寸
const BOARD_SIZE = {
    WIDTH: 9,   // 列数
    HEIGHT: 10  // 行数
};

// 坐标转换（用于移动表示法）
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
const RANKS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

// 游戏状态
const GAME_STATUS = {
    PLAYING: 'playing',
    RED_WIN: 'red_win',
    BLACK_WIN: 'black_win',
    DRAW: 'draw'
};

// 缓存设置
const CACHE_ENABLED = true; // 启用缓存来提高性能
