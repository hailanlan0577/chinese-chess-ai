/**
 * 棋子类 - 表示棋盘上的一个棋子
 */
class Piece {
    /**
     * 创建一个新棋子
     * @param {string} type - 棋子类型 (king, advisor, elephant, etc.)
     * @param {string} side - 棋子方 (red, black)
     * @param {Array} position - 棋子位置 [x, y]
     */
    constructor(type, side, position) {
        this.type = type;
        this.side = side;
        this.position = position;
        this.element = null; // DOM 引用，由 Board 类设置
    }
    
    /**
     * 获取棋子的显示字符
     */
    getChar() {
        return PIECE_CHARS[this.side][this.type];
    }
    
    /**
     * 获取棋子的基础价值（用于AI评估）
     */
    getValue() {
        return PIECE_VALUES[this.type];
    }
    
    /**
     * 克隆棋子
     */
    clone() {
        return new Piece(this.type, this.side, [...this.position]);
    }
    
    /**
     * 获取棋子在棋盘上的位置表示（如 'e4'）
     */
    getPositionNotation() {
        const [x, y] = this.position;
        return `${FILES[x]}${RANKS[y]}`;
    }
    
    /**
     * 获取棋子移动的表示（如 '炮二平五'）
     * 用于历史记录
     */
    getMoveNotation(fromPos, toPos) {
        const [fromX, fromY] = fromPos;
        const [toX, toY] = toPos;
        
        let notation = '';
        const char = this.getChar();
        
        // 兵种名称
        notation += char;
        
        // 起始位置
        if (this.side === SIDES.RED) {
            // 红方用数字表示纵线
            notation += 9 - fromX;
        } else {
            // 黑方用汉字表示纵线
            const numbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
            notation += numbers[fromX];
        }
        
        // 移动方向
        if (fromY === toY) {
            // 平移
            notation += '平';
            if (this.side === SIDES.RED) {
                notation += 9 - toX;
            } else {
                const numbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
                notation += numbers[toX];
            }
        } else if (
            (this.side === SIDES.RED && toY < fromY) || 
            (this.side === SIDES.BLACK && toY > fromY)
        ) {
            // 进
            notation += '进';
            if (this.type === PIECE_TYPES.HORSE || this.type === PIECE_TYPES.ELEPHANT || this.type === PIECE_TYPES.ADVISOR) {
                // 马、象、士特殊处理
                if (this.side === SIDES.RED) {
                    notation += 9 - toX;
                } else {
                    const numbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
                    notation += numbers[toX];
                }
            } else {
                // 其他棋子用数字表示前进格数
                notation += Math.abs(toY - fromY);
            }
        } else {
            // 退
            notation += '退';
            if (this.type === PIECE_TYPES.HORSE || this.type === PIECE_TYPES.ELEPHANT || this.type === PIECE_TYPES.ADVISOR) {
                // 马、象、士特殊处理
                if (this.side === SIDES.RED) {
                    notation += 9 - toX;
                } else {
                    const numbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
                    notation += numbers[toX];
                }
            } else {
                // 其他棋子用数字表示后退格数
                notation += Math.abs(toY - fromY);
            }
        }
        
        return notation;
    }
}
