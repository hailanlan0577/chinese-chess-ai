# 中国象棋 - 人机对战

这是一个简单的中国象棋人机对战网页游戏，支持三个难度级别。

## 功能特性

- 完整实现中国象棋规则
- 支持三个AI难度级别：初级、中级、高级
- 移动历史记录
- 响应式设计，适配各种设备
- 极小极大算法和Alpha-Beta剪枝实现的AI

## 在线游戏

访问 [https://hailanlan0577.github.io/chinese-chess-ai/](https://hailanlan0577.github.io/chinese-chess-ai/) 开始游戏

## 本地运行

1. 克隆仓库
2. 在浏览器中打开 `index.html` 文件

## 技术实现

- 纯JavaScript实现，无需任何框架
- 模块化设计：棋盘、棋子、规则、AI等类分离
- 高效的AI搜索和评估算法

## 调试模式

游戏内置调试模式，可以在浏览器控制台查看游戏状态和AI思考过程。

## 项目结构

- `js/constants.js` - 游戏常量定义
- `js/pieces.js` - 棋子类
- `js/rules.js` - 规则实现
- `js/board.js` - 棋盘类
- `js/ai.js` - AI实现
- `js/game.js` - 游戏控制
- `js/main.js` - 入口文件
- `js/debug.js` - 调试工具
- `css/style.css` - 样式文件
