# 素材来源与 AI 使用记录

## 美工组原画

建筑与长轴总览来自美工组交付的 `references/architecture-source.zip`。网页用 `scripts/prepare_assets.py` 对 PNG 透明边界裁切、缩小并转换为 WebP，没有对建筑结构作生成式修改。正文使用用户提供的润植家康熙字典美化体，大标题使用用户提供的 HLD 齐伋复刻修正版；网页中的 HLD 字体文件仅保留当前文案所需字形。

## AI 辅助素材

生成工具：Codex 内置 imagegen。输入的原画只用于风格参照，网页中保留原画建筑。当前网页使用的卷轴底纹和植物在画面底部标明。

### 植物 `assets/ai-foliage.webp`

参照：美工组示意图与故宫白昼图。提示词：

> Create one decorative plant cluster for a Beijing Central Axis interactive scroll website. Treat the supplied images ONLY as visual style references: precise flat vector-like shapes, clean geometric fan leaves, delicate linear ribs, playful luminous gradients in turquoise, mint, sky blue, coral pink, peach and soft yellow, crisp cut-paper edges. Subject: two small stylized ornamental shrubs / fan-shaped foliage forms suitable for placement beside the architecture, no pot, no architecture, no ground plane, no text, no logo, no shadow. Keep the cluster wide and low with generous transparent space around it. It must be a genuinely transparent PNG cutout. Do not copy any building from the references. Avoid realistic leaves, brush painting, grain, 3D rendering or photographic texture.

### 白昼底纹 `assets/scroll-ground-day.webp`

参照：美工组故宫白昼图与示意图。提示词：

> Generate a clean, wide, horizontal ground-surface illustration for a PC interactive website about Beijing's Central Axis. Use supplied images only as style references: soft luminous vector-like gradients, flat geometric shapes, crisp edges, subtle aqua-to-cream-to-peach color transitions, no photographic texture. The asset is the unrolled surface of a long cultural scroll viewed in shallow perspective: a broad empty central pathway with extremely restrained decorative border lines near the two long edges, delicate repeating geometric cloud and tile motifs at the margins only. No buildings, no plants, no people, no writing, no icons, no map labels, no cast shadow. It must remain visually quiet so supplied architectural PNGs can stand vertically above it. Wide landscape composition, high resolution, seamless-looking horizontal continuation at left and right. The reference artwork must not be copied.

### 黑夜底纹 `assets/scroll-ground-night.webp`

以白昼底纹为编辑目标。提示词：

> Edit the supplied scroll-ground image into its NIGHT companion asset for the same interactive Beijing Central Axis website. Preserve EXACTLY the original wide horizontal composition, empty central pathway, long border placement, cloud motif rhythm, dimensions and crisp flat vector-like style. Change only the palette and lighting: midnight indigo and deep teal ground, faint cyan and soft violet edge glow with very restrained warm peach accents. Keep the center quiet and readable behind standing building illustrations. No buildings, people, plants, text, stars, moon, labels, or new objects. This should align visually with the daytime version when users toggle modes.

`scroll-ground-*-vertical.webp` 是对应底纹旋转 90 度后的网页版本。网页用 Canvas 将完整图像及云纹边饰铺进弧形透视轮廓，SVG 提供加载时的备用画面，并按昼夜模式切换底纹。

### 矮草 `assets/ai-grass.webp`

参照：美工组示意图及先前生成的扇形植物。提示词：

> Create ONE compact low grass cluster as a genuinely transparent-background PNG cutout for the Beijing Central Axis interactive webpage. Match the supplied reference's crisp geometric flat illustration and luminous aqua, teal, mint, coral and soft yellow gradients. Shape: a low uneven row of narrow upright grass blades and a few fan-shaped small leaves, wider than tall, visibly botanical rather than a decorative fan. Keep a clean silhouette and precise edges. No building, pot, soil, ground plane, words, drop shadow, photo texture, glowing fringe or fuzzy halo. The reference is style only.

### 树形植物 `assets/ai-tree.webp`

参照：美工组示意图及先前生成的扇形植物。提示词：

> Create ONE taller ornamental tree cutout for the Beijing Central Axis interactive webpage, genuinely transparent background. Match the supplied reference's crisp flat geometric illustration, clean cut-paper edges and luminous aqua, teal, mint, sky blue, coral pink and soft yellow gradients. Silhouette: slender dark-teal trunk with several layered rounded and fan-like foliage canopies, clearly taller than wide; stylized Chinese garden tree, but no architectural elements. Keep foliage in separate readable clusters with quiet internal detail, suitable beside colorful building illustrations. No building, pot, soil, ground plane, words, drop shadow, realistic texture, glow fringe or fuzzy halo. The reference is style only.
