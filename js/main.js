/**
 * 主程序入口
 */
document.addEventListener('DOMContentLoaded', () => {
    // 创建游戏实例
    window.game = new Game();
    
    // 绑定UI事件
    initEventHandlers();
});

/**
 * 初始化事件处理器
 */
function initEventHandlers() {
    // 难度选择按钮
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    difficultyButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 更新按钮状态
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 设置AI难度
            const difficulty = this.id;
            window.game.setDifficulty(difficulty);
        });
    });
    
    // 重新开始按钮
    const restartButton = document.getElementById('restart-btn');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            if (confirm('确定要重新开始游戏吗？')) {
                window.game.restart();
            }
        });
    }
}
