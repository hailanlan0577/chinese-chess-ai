/**
 * 主程序入口
 */
document.addEventListener('DOMContentLoaded', () => {
    // 确保DOM完全加载后再初始化游戏
    console.log('DOM已加载，开始初始化游戏...');
    
    try {
        // 创建游戏实例
        window.game = new Game();
        
        // 绑定UI事件
        initEventHandlers();
        
        console.log('游戏初始化完成，等待用户操作');
    } catch (error) {
        console.error('游戏初始化失败:', error);
        alert('游戏初始化失败，请刷新页面重试。\n错误详情: ' + error.message);
    }
});

/**
 * 初始化事件处理器
 */
function initEventHandlers() {
    try {
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
        } else {
            console.warn('警告: 找不到重新开始按钮');
        }
        
        console.log('事件处理器初始化完成');
    } catch (error) {
        console.error('初始化事件处理器时出错:', error);
    }
}

// 添加全局错误处理
window.onerror = function(message, source, lineno, colno, error) {
    console.error('全局错误:', message, 'at', source, lineno, colno);
    return false;
};
