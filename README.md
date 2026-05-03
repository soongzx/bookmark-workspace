# 📑 Chrome Bookmark Workspace Manager

一款现代化的 Chrome 浏览器扩展,以工作区(Workspace)的方式管理和浏览书签,提供多列树状视图、全局搜索、主题切换与缩放控制功能。

![Version](https://img.shields.io/badge/version-1.2.0-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-green)
![License](https://img.shields.io/badge/license-MulanPSL--2-orange)

## ✨ 核心特性

- **🗂️ 工作区管理**: 将书签栏顶层文件夹抽象为独立工作区,快速切换不同项目/类别的书签集合
- **🌳 多列树状视图**: 横向展开多级目录结构,直观展示文件夹层级关系
- **🔍 全局搜索**: 实时搜索所有书签的标题、URL 和路径,支持防抖优化
- **🎨 三套主题**: 亮色、护眼、暗色主题自由切换,满足不同使用场景
- **🔎 缩放控制**: 0.7x ~ 1.5x 无级缩放,适配不同屏幕和阅读习惯
- **⚡ 高性能**: 扁平化索引 + 智能缓存,确保大量书签下的流畅体验

## 📸 界面预览

```
┌─────────────────────────────────────┐
│  📑 Bookmark Workspace        [●●●] │  ← 标题栏 + 主题切换
├─────────────────────────────────────┤
│  🔍 搜索框...          共 5 个工作区 │  ← 工具栏卡片
│  [全部] [前端] [后端] [设计] ...    │  ← 筛选按钮
├─────────────────────────────────────┤
│              [🔍−] 100% [🔍+]      │  ← 缩放控件
│  ┌────────┬────────┬────────┐      │
│  │  列 1  │  列 2  │  列 3  │ ...  │  ← 多列树状视图
│  │ 📁 文件夹   📁 子文件夹         │
│  │ 🔗 书签     🔗 书签             │
│  └────────┴────────┴────────┘      │
└─────────────────────────────────────┘
```

## 🚀 快速开始

### 安装步骤

1. **克隆或下载项目**
   ```bash
   git clone <repository-url>
   cd bookmark-workspace
   ```

2. **准备图标文件**(必需)
   
   从 [iconfont](https://www.iconfont.cn/) 或其他资源下载四个尺寸的 PNG 图标:
   - `icons/icon16.png` (16×16)
   - `icons/icon32.png` (32×32)
   - `icons/icon48.png` (48×48)
   - `icons/icon128.png` (128×128)

3. **加载到 Chrome**
   - 打开 Chrome 浏览器,访问 `chrome://extensions`
   - 开启右上角 **"开发者模式"**
   - 点击 **"加载已解压的扩展程序"**
   - 选择 `bookmark-workspace` 文件夹

4. **开始使用**
   - 点击浏览器工具栏的扩展图标 📑
   - 自动在新标签页打开书签工作区界面

### 系统要求

- Chrome 浏览器 88+ (支持 Manifest V3)
- 启用 `bookmarks` 和 `storage` 权限

## 📖 使用指南

### 工作区切换

- 点击工具栏中的筛选按钮(如"全部"、"前端开发"、"学习资料")
- 每个按钮显示该工作区的书签总数
- 互斥选择,高亮显示当前激活的工作区

### 多列导航

- **展开文件夹**: 点击任意文件夹项,在其右侧新增一列展示子内容
- **折叠分支**: 点击已展开的文件夹,折叠其右侧所有列
- **视觉层级**: 左侧彩色边框宽度和透明度随层级递减,清晰标识深度

### 全局搜索

- 在搜索框输入关键词,实时过滤书签(200ms 防抖)
- 搜索结果最多显示 80 条,包含标题、面包屑路径和 URL
- 按 `Escape` 或点击清除按钮退出搜索模式
- 快捷键: `Ctrl/Cmd + F` 快速聚焦搜索框

### 主题切换

点击标题栏右侧的三个圆形按钮:
- 🔵 **亮色**: 经典白底蓝调,适合日间办公
- 🟢 **护眼**: 柔和绿底,降低蓝光刺激
- ⚫ **暗色**: 深色背景,夜间友好

主题偏好自动保存,下次打开时保持。

### 缩放调整

- 点击展示区右上角的 `🔍−` / `🔍+` 按钮
- 缩放范围: 0.7x ~ 1.5x,步长 0.1
- 影响列宽、字体大小和间距
- 缩放值持久化存储

### 打开书签

- 点击任意书签项 → 在新标签页中打开
- 操作后显示 Toast 提示"已打开"

## 🏗️ 项目结构

```
bookmark-workspace/
├── manifest.json          # 扩展配置文件 (Manifest V3)
├── background.js          # Service Worker - 处理图标点击事件
├── popup.html             # 主界面 HTML
├── popup.js               # 核心业务逻辑 (~500 行)
├── icons/                 # 扩展图标目录
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # 项目说明文档
```

### 关键文件说明

| 文件 | 职责 |
|------|------|
| `manifest.json` | 声明扩展元数据、权限、后台脚本 |
| `background.js` | 监听图标点击,在新标签页打开 `popup.html` |
| `popup.html` | 单页应用容器,包含标题栏、工具栏、展示区 |
| `popup.js` | 全部交互逻辑:书签树解析、列渲染、搜索、主题、缩放 |

## 🎨 设计规范

### 色彩方案

| 主题 | 背景色 | 卡片色 | 文字色 | 强调色 |
|------|--------|--------|--------|--------|
| 亮色 | `#f5f6f7` | `#ffffff` | `#1d1d1f` | `#0071e3` |
| 护眼 | `#eef5ec` | `#f9fdf8` | `#2e4a2e` | `#2d6a4f` |
| 暗色 | `#1c1c1e` | `#2c2c2e` | `#f5f5f7` | `#0a84ff` |

### 层级视觉表示

| 层级 | 边框宽度 | 透明度 | 示例 |
|------|----------|--------|------|
| 第 0 级(根) | 4px | 1.0 | 工作区名称 |
| 第 1 级 | 3px | 0.9 | 一级文件夹 |
| 第 2 级 | 2px | 0.8 | 二级文件夹 |
| 第 3+ 级 | 1px | 0.7 | 深层文件夹 |

边框颜色由当前主题的 `--level-color` CSS 变量控制。

## 💡 技术亮点

### 1. 智能书签栏识别

兼容不同语言环境下的书签栏命名:
```javascript
// 取第一个非"其他书签"且包含子项的文件夹
function findBookmarksBar(rootNode) {
    return rootNode.children.find(child => 
        child.title !== "其他书签" && child.children
    );
}
```

### 2. 扁平化搜索索引

初始化时构建扁平数组,避免重复遍历树:
```javascript
allBookmarksFlat = []; // [{id, title, url, path}, ...]
function flattenBookmarks(node, path = []) {
    // 递归收集所有书签节点
}
```

### 3. 动态列路径管理

通过 `columnPath` 数组维护当前展开的列序列:
```javascript
columnPath = [
    {id: 'root', title: '全部', children: [...]},
    {id: 'folder1', title: '前端', children: [...]},
    {id: 'folder2', title: 'React', children: [...]}
];
```

### 4. CSS 变量驱动的主题系统

``css
body[data-theme="light"] {
    --bg: #f5f6f7;
    --card-bg: #ffffff;
    --text: #1d1d1f;
    --accent: #0071e3;
    --level-color: 0, 113, 227;
}
```

## 🔧 开发相关

### 调试技巧

1. **查看控制台日志**: 右键扩展页面 → "检查" → Console 面板
2. **热重载**: 修改代码后在 `chrome://extensions` 点击刷新按钮
3. **验证 Manifest**: 确保 `manifest.json` 格式正确,无语法错误

### 权限说明

| 权限 | 用途 |
|------|------|
| `bookmarks` | 读取和管理浏览器书签树 |
| `storage` | 保存用户偏好(主题、缩放值) |

### 性能优化

- ✅ 搜索防抖 200ms,减少无效计算
- ✅ 扁平化索引一次性构建,搜索时仅字符串匹配
- ✅ DOM 复用,列切换时增量更新而非全量重绘
- ✅ 滚动动画使用 `requestAnimationFrame`

## 📝 版本历史

### v1.2.0 (2026-05-02)
- ✨ 新增三套主题切换(亮色/护眼/暗色)
- ✨ 新增缩放控制(0.7x ~ 1.5x)
- 🎨 优化工具栏卡片样式,整合搜索和筛选区
- 🎨 改进层级视觉表示,采用渐变边框效果
- 🐛 修复书签栏识别兼容性问题
- 📈 提升大规模书签树的渲染性能

### v1.0.0 (初始版本)
- 🎉 基础多列树状视图
- 🔍 全局搜索功能
- 🗂️ 工作区切换

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request!

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 **木兰宽松许可证,第2版** (Mulan PSL v2) - 详见 [LICENSE](LICENSE) 文件

木兰宽松许可证是中国首个通过 OSI(开放源代码促进会)认证的开源许可证,允许自由使用、修改和分发本软件,包括商业用途。

## 🙏 致谢

- 灵感来源于现代效率工具的简洁设计理念
- 参考 Apple Human Interface Guidelines 的视觉规范
- 感谢 Chrome Extension API 提供的强大能力

---

**⭐ 如果这个项目对你有帮助,欢迎 Star 支持!**

有问题或建议?欢迎提 Issue 讨论 😊
