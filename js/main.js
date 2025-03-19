/**
 * 主程序入口
 */
document.addEventListener('DOMContentLoaded', () => {
    // 创建游戏实例
    window.game = new Game();
    
    // 绑定UI事件
    initEventHandlers();
    
    // 调试信息
    console.log('游戏初始化完成，等待用户操作');
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
            console.log(`已设置AI难度为: ${difficulty}`);
        });
    });
    
    // 重新开始按钮
    const restartButton = document.getElementById('restart-btn');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            if (confirm('确定要重新开始游戏吗？')) {
                window.game.restart();
                console.log('游戏已重新开始');
            }
        });
    }
}
