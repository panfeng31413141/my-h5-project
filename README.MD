此文档用于记录h5开发过程

# 设计稿在figma中完成后准备接入cursor开发，准备工作
1 cursor中figma mcp是否正常----在agent直接提问，然后返回确认答复
2 本地新建开发项目文件，用于管理相关项目----本地电脑新建文件夹，然后用cursor打开。并将相关图片素材拖入文件夹中/在cursor中新建readme.md
3 进行git版本管理
```bash
## 初始化项目
git init

## 查看状态
git status

## 添加所有修改到缓存区
git add .

## 提交到分支并添加注释
git commit -m "说明"

## 添加远程仓库github地址
git remote add origin https://github.com/panfeng31413141/my-h5-project.git

## 推送到远程github（第一次推动指定推送地址，例如默认推送到远程的 origin/main）
git push -u origin main
##记住第一次设置的推送地址每次都推送到这个分支
git push

## 查看提交历史
git log --oneline

## 确认在当前文件夹
pwd
```

# 在cursor中生成代码
核心原则：让 AI 先跑通，再跑对，最后跑美。

# 输入 提示词V1.0

```bash
figma设计稿地址 https://www.figma.com/design/BDJv2KQsnCZlI4gnKSqMW4/Untitled?node-id=0-1&t=r9k8qi0SM34ZPVEq-1 生成一个H5
## 技术框架：
- 单 HTML 文件，移动端适配
- 使用 Swiper.js CDN
- 移动端适配，宽度 390px

## 需求描述/页面结构：
这是一个宣发周杰伦16套音乐播放器皮肤的h5页面，共6个page。
page1首页，展示图文信息和一个btn1，点击btn1进入page2；
page2支持滑动展示16套播放器图片素材，循环滑动，图片素材需要支持动图和静态两种，和btn1，点击btn1选择当前图片素材，进入page3；
page3展示播放器素材pic，支持动态素材，播放周杰伦歌曲音频，音频同步绑定展示歌词，底部模块展示card内容，支持用户点击进行单选文本内容；用户点击选择后card反转，展示效果参考page4；
page4点击btn，进入page5，关闭page5，进入page6
page6展示图文信息

音频内容我还没有提供，先使用其他开源音频内容占位；图片素材除了设计稿中提供的外，不足的图片素材使用占位素材表示，后续替换

注意
请生成完整代码
```
# 输出及处理
项目文件夹中下载了图片，放在文件夹assets中；
生成index.html，流程严重缺失；

在根目录下，新增.cursorrules文件 # 是 Cursor 的项目级行为配置文件，用来告诉 AI 在你的项目中应该怎么工作、不应该做什么。


# 输入 提示词V1.1
```bash
 请基于我给的figma设计稿地址和页面需求描述，重点优化缺失流程：
在page3页面点击card中的选项a/选项b，card反转，反转后需要展示page4 中card内容，content包含：封面图片、介绍文本、btn2；
点击page4的btn2后跳转至page5，page5展示分享图片，分享渠道组件和关闭按钮，点击关闭按钮，进入page6；
page6展示图文信息和btn。
```
# 输出及处理
经过3轮自然语言沟通解决了点击卡片反转内容缺失问题，及后续page5 page6流程缺失问题，让agent总结问题产生（如下），我已将这段经验添加进cursorrules在项目中避免后续问题：
```bash
问题复盘：Page3 卡片翻转后内容为空
现象
Page3 点击 A/B 后卡片能翻转，但背面看不到 Page4 应有的内容（封面、文案、btn2），或看起来是「空的」。

结论（原因归属）
因素	是否主因	说明
你的需求描述
❌ 不是
需求写得很清楚：「选答后 card 反转，效果参考 page4」
Figma 数据读取
⚠️ 次要
MCP 能读到 page4 card 结构和素材；个别页面需按节点单独拉取，但不是「读不到」
实现方式 / 代码生成
✅ 主因
第一版没按设计稿分层实现，叠加 3D 翻转的 CSS 兼容问题，导致背面内容不显示
根因拆解（按重要性）
1. 实现结构与设计稿不一致（最主要）
Figma 里 Page4 的 card 是多层结构：

card/bg（棕色底）
  → card/pic（金色装饰边框图）
    → content（封面 + 文案）
      → btn2
第一版实现把它简化成：

<img class="card-frame">   <!-- 整层边框图 -->
<div class="card-inner">   <!-- 内容叠在下面 -->
问题在于：

没设 z-index，层级关系不明确
把 card-frame-back.png 当成「整张卡片」，没拆 bg / pic / content
内容区用 flex 塞在偏小的容器里（203px），而 Page4 卡片设计高度是 452px（适配后 226px），内容被裁切或挤出可视区
这不是你没说清楚，而是生成代码时没有严格按 Figma 节点层级还原。

2. CSS 3D 翻转的浏览器兼容问题（次要但常见）
用了 rotateY(180deg) 做翻转，但最初缺少：

-webkit-transform-style: preserve-3d
背面的 translateZ(1px)（Safari / 微信 WebView 下背面可能不渲染）
正反面 pointer-events 控制
在部分移动端上会表现为：动画有，背面是空白——容易被误判成「没内容」或「素材没读到」。

3. Figma MCP 的影响（有限）
实际遇到的情况：

情况	影响
首次 get_design_context(0:1) 失败
需按单页 nodeId 分别拉取，略增成本
Page6 过大，只返回 metadata
不影响 Page3/4 卡片
素材 CDN 7 天过期
已通过下载到 assets/ 规避
Figma 提供了 page4 card 的结构、坐标和素材 URL；问题不在「读不到设计稿」，而在第一次生成时没有按这些数据严格落地。

4. 项目策略与第一版目标（背景因素）
README 里写的是：先跑通，再跑对，最后跑美。

第一版优先：

6 页主流程能走通
单文件 + Swiper + 占位素材
对 Page3→Page4 采用了「同页 + 简单 flip + 通用 card-frame」，没有先做 Page4 card 的 1:1 分层还原，所以会出现「流程有了，背面内容不对/为空」。

解决过程（对应动作）
问题：翻转后背面空
    ↓
① 用 Figma MCP 单独拉取 page4 card 节点 (13:3363)
    ↓
② 按设计稿重建 4 层：bg → frame → content → btn2
    ↓
③ 坐标按 780→390（÷2）精确定位
    ↓
④ 下载 card-p4-frame.png、card-p4-cover.png 到本地
    ↓
⑤ 补 3D 翻转兼容：translateZ、preserve-3d、z-index
    ↓
结果：背面内容正常展示 ✅
后续 btn2 点不进 Page5，又是另一个问题：按钮在 3D 变换层内，点击被拦截——通过把点击热区移到翻转容器外解决，与「内容为空」是不同层面的 bug。

经验总结
给你的侧：

需求描述是够用的；若希望减少偏差，可补充一句：「Page4 card 请按 Figma 节点 card/bg、pic、content、btn2 分层实现」
.cursorrules 里「不猜测、以 Figma 为准」的方向是对的，第一版没完全执行到位
给 AI 生成侧的：

有 Figma MCP 时，复杂组件先拉子节点结构再写代码，不要先写简化版再补
带 3D 翻转 的交互，内容层与点击层最好分离（你后来 btn2 的问题也印证了这点）
装饰性大图（边框 frame）和内容层必须明确 z-index 与尺寸（203px vs 226px 这类差异会直接导致「看起来是空的」）
一句话总结
不是你的需求不准，也不是 Figma 读不到；主要是第一版实现没有按设计稿 Page4 card 的分层结构与尺寸还原，再叠加 CSS 3D 翻转兼容性，导致翻转后背面内容不显示。修复方式是：按 Figma 节点严格重建层级 + 修正翻转 CSS + 使用正确本地素材。
```


状态栏缺失，暂时没有解决
page6页面信息缺失严重，对figma中图层进行了重命名和自动布局，待更新设计数据文件----更新后内容基本补充到位！
框架流程基本ok，需要提交git

#输入提示词1.2
```bash
page1/page2/page3/page4/page6页面缺失状态栏status bar，请按照设计稿https://www.figma.com/design/BDJv2KQsnCZlI4gnKSqMW4/Untitled?node-id=0-1&t=clkx4nk2474BmRxq-1 中的位置补充
```

# ai流程已跑通，提交git V0.1 核心流程可用

---

# V0.1 版本说明（验收用）

## 项目结构

```
my-h5-project/
├── index.html          # 页面骨架（6 页 HTML 结构）
├── css/app.css         # 全局样式（设计稿 780→390，÷2）
├── js/app.js           # 交互逻辑（导航 / 轮播 / 答题 / 音频）
├── assets/             # 图片素材（Figma 导出）
├── .cursorrules        # AI 实现约束
└── README.MD           # 开发记录
```

## 页面流程

```
Page1 首页 ──进入──▶ Page2 皮肤选择 ──选择──▶ Page3 答题
     │                                              │
     └──分享(直达)──▶ Page5 分享 ◀──继续答题── Page4 翻转
                           │
                      关闭/返回
                           ▼
                      Page6 长页
```

## 状态栏规则

| 页面 | 返回 | 分享 |
|------|------|------|
| Page1 | ✓ | ✓（直达 Page5） |
| Page2/3/5/6 | ✓ | — |
| Page3 返回 | 直达 Page2（不先翻回卡片） | — |

## 本地预览

```bash
cd my-h5-project
python3 -m http.server 8765
# 浏览器访问 http://localhost:8765（勿用 file:// 打开）
```

## V0.1 已知占位项

- 音频：SoundHelix 占位，待换正式歌曲 + LRC
- 皮肤素材：仅第 1 套为设计稿图，其余为渐变色占位
- B 选项专辑封面：暂用 JAY 封面（`js/app.js` ANSWER_DATA.B）
- Page6 btn3「收藏专辑」：点击占位，待接正式跳转

## 提交 V0.1

```bash
git add .
git commit -m "feat: Jay H5 V0.1 核心流程跑通"
git tag v0.1
```

