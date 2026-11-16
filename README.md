# 一线定城｜北京中轴线交互长卷

B 赛道古都美学方向的 PC 网页演示。当前版本重点完成长轴漫游：滚动向北、建筑直立于卷轴、点击查看点位、白昼／黑夜随时切换。首页暂为入口页，等待美工组的首页交互稿。

## 运行

无需安装依赖。直接打开 `index.html`，或在项目目录运行 `python -m http.server 8000` 后访问 `http://localhost:8000`。建议使用 1366 × 768 以上的 PC 浏览器窗口。

## 素材

- `assets/buildings/`：美工组建筑原画导出的透明 WebP，白色背景版对应白昼，黑色背景版对应黑夜。先农坛只有白昼原画，黑夜暂时沿用白昼版。
- `assets/axis-overview-*.webp`：美工组长轴总览图的网页缩略版。
- `assets/kangxi-body.ttf`：正文使用的润植家康熙字典美化体。
- `assets/hld-heading.ttf`：大标题使用的 HLD 齐伋复刻修正版，仅保留当前网页文字所需字形。新增标题字后可运行 `scripts/subset_heading_font.py <原始 HLD 字体路径>` 重新生成；脚本依赖 `fonttools`。
- `assets/ai-foliage.webp`、`assets/ai-grass.webp`、`assets/ai-tree.webp`：AI 辅助生成的扇形灌木、矮草和树形装饰。
- 长轴使用 `assets/scroll-ground-*-vertical.webp` 的完整昼夜卷轴图，包括两侧云纹边饰。Canvas 按参考图的弧形透视轮廓铺设图像，SVG 提供加载时的备用画面。生成过程见 [素材来源记录](ASSET_PROVENANCE.md)。
- `references/`：美工组提供的原始压缩包与内容资料；新增事实文案时先核对权威来源。

美工组更新建筑原画后，可运行 `scripts/prepare_assets.py` 重新输出 WebP：

```bash
python -m pip install Pillow
python scripts/prepare_assets.py references/architecture-source.zip
```

## 协作

每个独立任务从最新 `main` 建新分支，完成后发 Pull Request。当前网页内容配置集中在 `main.js` 的 `stops` 数组；点位顺序、文案、东西偏移和配图路径都在那里调整。`styles.css` 控制场景透视和昼夜色彩。正式公开展示前，请核对素材授权及所有事实性文案。
