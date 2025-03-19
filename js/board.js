/**
 * 棋盘类 - 负责棋盘的渲染和状态管理
 */
class Board {
    constructor() {
        this.element = document.getElementById('board');
        this.pieces = [];
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.boardCells = [];
        
        this.init();
    }
    
    /**
     * 初始化棋盘
     */
    init() {
        this.createBoardGrid();
        this.addRiverDecoration();
    }
    
    /**
     * 创建棋盘网格
     */
    createBoardGrid() {
        const gridElement = document.createElement('div');
        gridElement.className = 'board-grid';
        
        for (let y = 0; y < BOARD_SIZE.HEIGHT; y++) {
            for (let x = 0; x < BOARD_SIZE.WIDTH; x++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // 添加点击事件
                cell.addEventListener('click', () => this.handleCellClick(x, y));
                
                gridElement.appendChild(cell);
                this.boardCells.push(cell);
            }
        }
        
        this.element.appendChild(gridElement);
    }
    
    /**
     * 添加"楚河汉界"装饰
     */
    addRiverDecoration() {
        const river = document.createElement('div');
        river.className = 'river';
        
        const leftText = document.createElement('div');
        leftText.className = 'river-text left';
        leftText.textContent = '楚河';
        
        const rightText = document.createElement('div');
        rightText.className = 'river-text right';
        rightText.textContent = '汉界';
        
        river.appendChild(leftText);
        river.appendChild(rightText);
        
        this.element.appendChild(river);
    }
    
    /**
     * 重置棋盘到初始状态
     */
    reset() {
        // 清除当前棋子
        this.clearPieces();
        
        // 重置状态
        this.selectedPiece = null;
        this.possibleMoves = [];
        
        // 设置初始棋子
        this.setupInitialPieces();
    }
    
    /**
     * 清除棋盘上的所有棋子
     */
    clearPieces() {
        // 移除所有棋子元素
        this.pieces.forEach(piece => {
            if (piece.element && piece.element.parentNode) {
                piece.element.parentNode.removeChild(piece.element);
            }
        });
        
        // 清空棋子数组
        this.pieces = [];
        
        // 清除可能移动标记
        this.clearPossibleMoves();
    }
    
    /**
     * 设置初始棋子
     */
    setupInitialPieces() {
        INITIAL_BOARD.forEach(pieceData => {
            const piece = new Piece(
                pieceData.type,
                pieceData.side,
                pieceData.position
            );
            
            this.addPiece(piece);
        });
    }
    
    /**
     * 添加棋子到棋盘
     */
    addPiece(piece) {
        this.pieces.push(piece);
        
        // 创建棋子DOM元素
        const pieceElement = document.createElement('div');
        pieceElement.className = `piece ${piece.side}`;
        pieceElement.textContent = PIECE_CHARS[piece.side][piece.type];
        
        // 设置位置
        const [x, y] = piece.position;
        const cell = this.getCellAt(x, y);
        if (cell) {
            cell.appendChild(pieceElement);
        }
        
        // 存储DOM引用
        piece.element = pieceElement;
        
        // 添加点击事件
        pieceElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handlePieceClick(piece);
        });
        
        return piece;
    }
    
    /**
     * 处理棋子点击事件
     */
    handlePieceClick(piece) {
        const game = window.game;
        
        // 如果游戏已经结束或不是玩家回合，忽略点击
        if (game.status !== GAME_STATUS.PLAYING || game.currentTurn !== SIDES.RED) {
            return;
        }
        
        // 如果选择的是对方棋子，而且已经有选中的我方棋子，尝试吃子
        if (piece.side !== SIDES.RED && this.selectedPiece) {
            const [x, y] = piece.position;
            this.handleCellClick(x, y);
            return;
        }
        
        // 选择己方棋子才响应
        if (piece.side !== SIDES.RED) {
            return;
        }
        
        // 取消之前的选择
        if (this.selectedPiece) {
            this.selectedPiece.element.classList.remove('selected');
            this.clearPossibleMoves();
        }
        
        // 如果点击的是已选中的棋子，取消选择
        if (this.selectedPiece === piece) {
            this.selectedPiece = null;
            return;
        }
        
        // 选中新棋子
        this.selectedPiece = piece;
        piece.element.classList.add('selected');
        
        // 显示可能的移动位置
        this.showPossibleMoves(piece);
    }
    
    /**
     * 处理棋盘格点击事件
     */
    handleCellClick(x, y) {
        // 如果没有选中棋子，忽略
        if (!this.selectedPiece) {
            return;
        }
        
        const game = window.game;
        
        // 检查移动是否合法
        const moves = Rules.getValidMoves(this.selectedPiece, this.pieces);
        const isValidMove = moves.some(move => move[0] === x && move[1] === y);
        
        if (isValidMove) {
            // 执行移动
            game.makeMove(this.selectedPiece, [x, y]);
            
            // 清除选择状态
            this.selectedPiece.element.classList.remove('selected');
            this.selectedPiece = null;
            this.clearPossibleMoves();
        }
    }
    
    /**
     * 显示棋子可能的移动位置
     */
    showPossibleMoves(piece) {
        // 获取合法移动
        const moves = Rules.getValidMoves(piece, this.pieces);
        this.possibleMoves = moves;
        
        // 为每个可能的移动创建标记
        moves.forEach(([x, y]) => {
            const cell = this.getCellAt(x, y);
            if (cell) {
                const marker = document.createElement('div');
                marker.className = 'possible-move';
                cell.appendChild(marker);
            }
        });
    }
    
    /**
     * 清除可能移动标记
     */
    clearPossibleMoves() {
        // 移除所有可能移动标记
        const markers = this.element.querySelectorAll('.possible-move');
        markers.forEach(marker => {
            if (marker.parentNode) {
                marker.parentNode.removeChild(marker);
            }
        });
        
        this.possibleMoves = [];
    }
    
    /**
     * 移动棋子
     */
    movePiece(piece, newPosition) {
        const [newX, newY] = newPosition;
        
        // 检查目标位置是否有其他棋子
        const targetPiece = this.getPieceAt(newX, newY);
        if (targetPiece) {
            // 移除被吃的棋子
            this.removePiece(targetPiece);
        }
        
        // 从原位置移除
        if (piece.element.parentNode) {
            piece.element.parentNode.removeChild(piece.element);
        }
        
        // 更新位置
        const [oldX, oldY] = piece.position;
        piece.position = [newX, newY];
        
        // 放置到新位置
        const cell = this.getCellAt(newX, newY);
        if (cell) {
            cell.appendChild(piece.element);
        }
        
        return { from: [oldX, oldY], to: [newX, newY], captured: targetPiece };
    }
    
    /**
     * 从棋盘上移除棋子
     */
    removePiece(piece) {
        // 从DOM中移除
        if (piece.element && piece.element.parentNode) {
            piece.element.parentNode.removeChild(piece.element);
        }
        
        // 从棋子数组中移除
        const index = this.pieces.indexOf(piece);
        if (index !== -1) {
            this.pieces.splice(index, 1);
        }
    }
    
    /**
     * 获取指定位置的棋子
     */
    getPieceAt(x, y) {
        return this.pieces.find(piece => {
            const [pieceX, pieceY] = piece.position;
            return pieceX === x && pieceY === y;
        });
    }
    
    /**
     * 获取指定位置的棋盘格元素
     */
    getCellAt(x, y) {
        return this.boardCells.find(cell => {
            return parseInt(cell.dataset.x) === x && parseInt(cell.dataset.y) === y;
        });
    }
    
    /**
     * 获取当前棋盘状态的副本（用于AI评估）
     */
    getState() {
        return {
            pieces: this.pieces.map(piece => ({
                type: piece.type,
                side: piece.side,
                position: [...piece.position]
            }))
        };
    }
    
    /**
     * 检查游戏是否结束
     */
    checkGameOver() {
        // 检查是否有一方的将/帅被吃掉
        const redKing = this.pieces.find(piece => piece.type === PIECE_TYPES.KING && piece.side === SIDES.RED);
        const blackKing = this.pieces.find(piece => piece.type === PIECE_TYPES.KING && piece.side === SIDES.BLACK);
        
        if (!redKing) {
            return GAME_STATUS.BLACK_WIN;
        }
        
        if (!blackKing) {
            return GAME_STATUS.RED_WIN;
        }
        
        // 检查当前玩家是否无子可走（将军/无子可走）
        const currentSide = window.game.currentTurn;
        const hasMoves = this.pieces.some(piece => {
            if (piece.side === currentSide) {
                const moves = Rules.getValidMoves(piece, this.pieces);
                return moves.length > 0;
            }
            return false;
        });
        
        if (!hasMoves) {
            return currentSide === SIDES.RED ? GAME_STATUS.BLACK_WIN : GAME_STATUS.RED_WIN;
        }
        
        return GAME_STATUS.PLAYING;
    }
}
