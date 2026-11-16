# 素材来源与 AI 使用记录

## 美工组原画

建筑与长轴总览来自美工组交付的 `references/architecture-source.zip`。网页用 `scripts/prepare_assets.py` 对 PNG 透明边界裁切、缩小并转换为 WebP，没有对建筑结构作生成式修改。标题字体来自美工组交付的 `assets/shangshou-ruibo.ttf`。

## AI 辅助素材

生成工具：Codex 内置 imagegen。输入的原画只用于风格参照，网页中保留原画建筑。生成素材在画面底部以“AI生成底纹与植物”标明。

### 植物 `assets/ai-foliage.webp`

参照：美工组示意图与故宫白昼图。提示词：

> Create one decorative plant cluster for a Beijing Central Axis interactive scroll website. Treat the supplied images ONLY as visual style references: precise flat vector-like shapes, clean geometric fan leaves, delicate linear ribs, playful luminous gradients in turquoise, mint, sky blue, coral pink, peach and soft yellow, crisp cut-paper edges. Subject: two small stylized ornamental shrubs / fan-shaped foliage forms suitable for placement beside the architecture, no pot, no architecture, no ground plane, no text, no logo, no shadow. Keep the cluster wide and low with generous transparent space around it. It must be a genuinely transparent PNG cutout. Do not copy any building from the references. Avoid realistic leaves, brush painting, grain, 3D rendering or photographic texture.

### 白昼底纹 `assets/scroll-ground-day.webp`

参照：美工组故宫白昼图与示意图。提示词：

> Generate a clean, wide, horizontal ground-surface illustration for a PC interactive website about Beijing's Central Axis. Use supplied images only as style references: soft luminous vector-like gradients, flat geometric shapes, crisp edges, subtle aqua-to-cream-to-peach color transitions, no photographic texture. The asset is the unrolled surface of a long cultural scroll viewed in shallow perspective: a broad empty central pathway with extremely restrained decorative border lines near the two long edges, delicate repeating geometric cloud and tile motifs at the margins only. No buildings, no plants, no people, no writing, no icons, no map labels, no cast shadow. It must remain visually quiet so supplied architectural PNGs can stand vertically above it. Wide landscape composition, high resolution, seamless-looking horizontal continuation at left and right. The reference artwork must not be copied.

### 黑夜底纹 `assets/scroll-ground-night.webp`

以白昼底纹为编辑目标。提示词：

> Edit the supplied scroll-ground image into its NIGHT companion asset for the same interactive Beijing Central Axis website. Preserve EXACTLY the original wide horizontal composition, empty central pathway, long border placement, cloud motif rhythm, dimensions and crisp flat vector-like style. Change only the palette and lighting: midnight indigo and deep teal ground, faint cyan and soft violet edge glow with very restrained warm peach accents. Keep the center quiet and readable behind standing building illustrations. No buildings, people, plants, text, stars, moon, labels, or new objects. This should align visually with the daytime version when users toggle modes.

`scroll-ground-*-vertical.webp` 是对应底纹旋转 90 度后用于网页透视铺设的版本。
