# 豆图工坊 Web + H5 项目开发文档 v1.0

> 本文档用于交给 Codex / AI Coding Agent 直接开始开发。请严格按照本开发文档进行项目初始化、目录组织、页面实现、核心算法、数据模型和验收标准开发。

---

## 0. 项目一句话说明

豆图工坊是一款 Web + H5 响应式图片转拼豆图纸生成工具。用户上传图片后，可以裁剪图片、设置图纸参数、自动生成拼豆图纸、查看明细网格、统计颜色用量、查看材料推荐，并导出 PNG / PDF 或分享结果。

---

## 1. 项目目标

### 1.1 业务目标

实现一个可用的 MVP：

```txt
上传图片 → 裁剪调整 → 参数设置 → 生成图纸 → 图纸预览 → 明细查看 → 材料推荐 → 导出 / 分享
```

### 1.2 产品目标

1. 支持 Web 端桌面工作台体验。
2. 支持 H5 端移动设备响应式体验。
3. Web 和 H5 共用同一套业务逻辑，不拆成两个项目。
4. 页面风格统一：奶油白背景、浅紫主色、圆角卡片、柔和阴影、可爱拼豆 IP、轻拟物拼豆元素。
5. 首版不做在线购买材料，最后一步统一叫“材料推荐”。
6. 首版重点验证图片转拼豆图纸能力，不做社区、复杂商城和多人协作。

---

## 2. 推荐技术栈

### 2.1 核心技术栈

```txt
框架：Next.js App Router + React + TypeScript
样式：Tailwind CSS + shadcn/ui
状态管理：Zustand
表单校验：React Hook Form + Zod
裁剪：react-easy-crop
图纸绘制：Canvas + react-konva
图像处理：Canvas + Web Worker，后续可接 Sharp
数据库：Supabase PostgreSQL
鉴权：Supabase Auth
文件存储：Supabase Storage
导出：Canvas PNG + pdf-lib / jsPDF
部署：Vercel + Supabase
```

### 2.2 开发优先级

MVP 阶段优先实现：

```txt
Next.js + TypeScript + Tailwind CSS + Zustand + react-easy-crop + Canvas + Web Worker + Supabase + PDF 导出
```

进阶阶段再增强：

```txt
react-konva 高级交互、Sharp 服务端图片处理、PWA、模板中心、项目历史、用户会员、社区分享
```

---

## 3. 视觉风格规范

### 3.1 主题名称

**奶油紫拼豆工坊风**

### 3.2 视觉关键词

```txt
可爱、轻量、治愈、手作感、干净、现代、半拟物、低门槛、创作工具感
```

### 3.3 主色系统

```ts
const themeColors = {
  primary: '#7C3AED',        // 主紫色
  primaryLight: '#A78BFA',   // 浅紫
  primarySoft: '#F3E8FF',    // 紫色背景
  cream: '#FFFDF8',          // 奶油白背景
  card: '#FFFFFF',           // 卡片白
  textPrimary: '#1F1B3A',    // 深色主文本
  textSecondary: '#7A7390',  // 次级文本
  border: '#E9E1F7',         // 浅紫边框
  success: '#46B96C',        // 成功绿
  warning: '#F5A524',        // 提示黄
  danger: '#EF5A6F',         // 错误粉红
};
```

### 3.4 UI 风格要求

1. 所有主要容器使用圆角卡片，推荐 `rounded-2xl` 或 `rounded-3xl`。
2. 主按钮使用紫色渐变：`from-violet-500 to-purple-600`。
3. 页面背景使用奶油白或极浅紫渐变。
4. 重要页面加入拼豆装饰元素，例如散落彩色豆子、拼豆小猫/小狗 IP。
5. Web 端左侧固定侧边栏；H5 端底部 TabBar。
6. H5 端按钮要大，适合触摸。
7. 所有图纸页必须保证信息清晰，不因装饰影响可读性。

### 3.5 字体建议

```txt
中文：system-ui, PingFang SC, Microsoft YaHei, sans-serif
英文 / 数字：Inter, system-ui, sans-serif
```

---

## 4. 端侧设计原则

### 4.1 Web 端

Web 端定位为完整创作工作台。

特点：

1. 大屏操作。
2. 精细裁剪。
3. 复杂参数设置。
4. 高清图纸预览。
5. 明细图纸缩放、平移、同色高亮。
6. 表格化材料推荐。
7. PDF / PNG 导出和打印设置。

### 4.2 H5 端

H5 端定位为轻量快速生成端。

特点：

1. 单列步骤式流程。
2. 支持相册上传 / 拍照上传。
3. 参数简化为卡片选择。
4. 图纸支持双指缩放和分区查看。
5. 材料推荐用卡片列表展示。
6. 重点支持保存图片、导出 PDF、分享链接。

### 4.3 响应式断点建议

```ts
const breakpoints = {
  mobile: '< 768px',
  tablet: '768px - 1023px',
  desktop: '>= 1024px',
};
```

---

## 5. 页面路由设计

使用 Next.js App Router。

```txt
app/
├── page.tsx                              // 首页，Web + H5 响应式
├── workspace/
│   ├── page.tsx                          // 工作台入口，未创建项目时重定向到 upload
│   ├── upload/page.tsx                   // 上传图片
│   ├── crop/page.tsx                     // 裁剪调整
│   ├── params/page.tsx                   // 参数设置
│   ├── generating/page.tsx               // 生成中
│   ├── preview/page.tsx                  // 图纸预览
│   ├── detail/page.tsx                   // 明细图纸
│   └── export/page.tsx                   // 导出 / 打印 / 材料推荐
├── projects/page.tsx                     // 我的项目
├── projects/[id]/page.tsx                // 项目详情
├── templates/page.tsx                    // 模板中心，P2 可延后
├── materials/page.tsx                    // 材料库，P1 / P2
├── profile/page.tsx                      // 个人中心
├── login/page.tsx                        // 登录页，可选
└── api/
    ├── patterns/generate/route.ts        // 生成图纸 API，可选：也可纯前端 worker 生成
    ├── projects/route.ts                 // 项目增删查改
    ├── upload/route.ts                   // 上传相关
    ├── export/pdf/route.ts               // PDF 导出
    └── materials/recommend/route.ts      // 材料推荐
```

---

## 6. 推荐目录结构

```txt
src/
├── app/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── WebSidebar.tsx
│   │   ├── MobileTabBar.tsx
│   │   └── TopBar.tsx
│   ├── upload/
│   │   ├── UploadDropzone.tsx
│   │   ├── ExampleImageGrid.tsx
│   │   └── UploadTips.tsx
│   ├── crop/
│   │   ├── CropEditor.tsx
│   │   ├── CropToolbar.tsx
│   │   └── RatioSelector.tsx
│   ├── params/
│   │   ├── PatternParamPanel.tsx
│   │   ├── ParamOptionCard.tsx
│   │   └── EstimateSummary.tsx
│   ├── pattern/
│   │   ├── PatternPreview.tsx
│   │   ├── PatternCanvas.tsx
│   │   ├── PatternGrid.tsx
│   │   ├── ColorLegend.tsx
│   │   ├── DetailPatternViewer.tsx
│   │   └── SectionPatternViewer.tsx
│   ├── materials/
│   │   ├── MaterialRecommendTable.tsx
│   │   ├── MaterialRecommendCards.tsx
│   │   └── AlternativeColorList.tsx
│   ├── export/
│   │   ├── ExportPanel.tsx
│   │   ├── PrintSettings.tsx
│   │   └── PdfPreview.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectGrid.tsx
│   │   └── ProjectToolbar.tsx
│   └── shared/
│       ├── Logo.tsx
│       ├── EmptyState.tsx
│       ├── LoadingState.tsx
│       ├── ErrorState.tsx
│       └── BeadMascot.tsx
├── lib/
│   ├── image/
│   │   ├── canvas.ts
│   │   ├── crop.ts
│   │   ├── compression.ts
│   │   └── export-image.ts
│   ├── pattern/
│   │   ├── generator.ts
│   │   ├── color-quantization.ts
│   │   ├── palette-match.ts
│   │   ├── material.ts
│   │   ├── section.ts
│   │   └── symbols.ts
│   ├── pdf/
│   │   ├── create-pattern-pdf.ts
│   │   └── pdf-layout.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── queries.ts
│   ├── utils/
│   │   ├── format.ts
│   │   ├── responsive.ts
│   │   └── cn.ts
│   └── constants/
│       ├── bead-palettes.ts
│       ├── routes.ts
│       └── app-config.ts
├── stores/
│   ├── pattern-store.ts
│   ├── user-store.ts
│   └── ui-store.ts
├── workers/
│   └── pattern.worker.ts
├── types/
│   ├── pattern.ts
│   ├── project.ts
│   ├── material.ts
│   └── user.ts
└── styles/
    └── globals.css
```

---

## 7. 核心 TypeScript 类型定义

### 7.1 图纸参数

```ts
export type Difficulty = 'easy' | 'standard' | 'detailed';
export type BackgroundMode = 'simplify' | 'keep' | 'remove';
export type BeadSize = '2.6mm' | '5mm' | '10mm';

export type PatternConfig = {
  finishedSize: 'small' | 'medium' | 'large' | 'custom';
  customWidthCm?: number;
  customHeightCm?: number;
  beadSize: BeadSize;
  gridWidth: number;
  gridHeight: number;
  colorCount: number;
  difficulty: Difficulty;
  backgroundMode: BackgroundMode;
  aiColorReduce: boolean;
};
```

### 7.2 颜色与材料

```ts
export type BeadColor = {
  id: string;
  name: string;
  colorCode: string;
  hex: string;
  rgb: [number, number, number];
  symbol: string;
};

export type MaterialItem = {
  colorId: string;
  colorName: string;
  colorCode: string;
  hex: string;
  requiredCount: number;
  recommendedCount: number;
  spareCount: number;
  spareRate: number;
  alternativeColors: BeadColor[];
};
```

### 7.3 图纸网格

```ts
export type PatternCell = {
  x: number;
  y: number;
  colorId: string;
  colorCode: string;
  hex: string;
  symbol: string;
  isTransparent?: boolean;
};

export type GeneratedPattern = {
  id?: string;
  width: number;
  height: number;
  totalBeads: number;
  colorCount: number;
  cells: PatternCell[][];
  colors: BeadColor[];
  materials: MaterialItem[];
  previewImageUrl?: string;
  createdAt?: string;
};
```

### 7.4 项目

```ts
export type ProjectStatus = 'draft' | 'generated' | 'exported';

export type Project = {
  id: string;
  userId?: string;
  title: string;
  sourceImageUrl?: string;
  croppedImageUrl?: string;
  coverImageUrl?: string;
  config: PatternConfig;
  pattern?: GeneratedPattern;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};
```

---

## 8. Zustand 状态设计

创建 `stores/pattern-store.ts`。

```ts
import { create } from 'zustand';
import type { PatternConfig, GeneratedPattern, Project } from '@/types/pattern';

interface PatternState {
  currentProject: Project | null;
  sourceFile: File | null;
  sourceImageUrl: string | null;
  croppedImageUrl: string | null;
  config: PatternConfig;
  generatedPattern: GeneratedPattern | null;
  isGenerating: boolean;
  generationProgress: number;
  generationMessage: string;

  setSourceFile: (file: File) => void;
  setCroppedImageUrl: (url: string) => void;
  updateConfig: (partial: Partial<PatternConfig>) => void;
  setGeneratedPattern: (pattern: GeneratedPattern) => void;
  resetWorkflow: () => void;
}

export const usePatternStore = create<PatternState>((set) => ({
  currentProject: null,
  sourceFile: null,
  sourceImageUrl: null,
  croppedImageUrl: null,
  config: {
    finishedSize: 'medium',
    beadSize: '5mm',
    gridWidth: 40,
    gridHeight: 40,
    colorCount: 24,
    difficulty: 'standard',
    backgroundMode: 'simplify',
    aiColorReduce: true,
  },
  generatedPattern: null,
  isGenerating: false,
  generationProgress: 0,
  generationMessage: '',

  setSourceFile: (file) => set({ sourceFile: file, sourceImageUrl: URL.createObjectURL(file) }),
  setCroppedImageUrl: (url) => set({ croppedImageUrl: url }),
  updateConfig: (partial) => set((state) => ({ config: { ...state.config, ...partial } })),
  setGeneratedPattern: (pattern) => set({ generatedPattern: pattern }),
  resetWorkflow: () => set({
    currentProject: null,
    sourceFile: null,
    sourceImageUrl: null,
    croppedImageUrl: null,
    generatedPattern: null,
    isGenerating: false,
    generationProgress: 0,
    generationMessage: '',
  }),
}));
```

---

## 9. 核心算法设计

### 9.1 目标

输入一张裁剪后的图片，输出一份可拼的拼豆图纸。

输入：

```txt
croppedImageUrl
PatternConfig
standard bead color palette
```

输出：

```txt
GeneratedPattern
- width
- height
- cells 二维数组
- colors 颜色表
- materials 材料推荐清单
- preview image
```

### 9.2 生成流程

```txt
1. 加载裁剪后的图片
2. 根据参数计算网格宽高
3. 使用 Canvas 将图片缩放到 gridWidth × gridHeight
4. 逐像素读取颜色
5. 可选：背景简化 / 去除
6. 对颜色进行减色处理
7. 将减色后的颜色匹配到标准拼豆色卡
8. 生成 PatternCell 二维数组
9. 统计每种颜色数量
10. 根据数量生成材料推荐
11. 生成预览图
```

### 9.3 网格尺寸计算

如果用户选择 H5 简化参数：

```ts
const presetGridMap = {
  small: { width: 24, height: 24 },
  medium: { width: 40, height: 40 },
  large: { width: 64, height: 64 },
};
```

如果用户设置 Web 端成品尺寸：

```ts
function cmToGrid(cm: number, beadSizeMm: number) {
  return Math.round((cm * 10) / beadSizeMm);
}
```

例如：

```txt
20cm 成品宽度，5mm 拼豆：20 × 10 / 5 = 40 颗
```

### 9.4 色卡数据

MVP 先使用内置通用色卡，不绑定具体品牌。

创建 `lib/constants/bead-palettes.ts`：

```ts
export const DEFAULT_BEAD_PALETTE = [
  { id: 'white', name: '白色', colorCode: 'W01', hex: '#F8F5EE', rgb: [248, 245, 238], symbol: 'W' },
  { id: 'black', name: '黑色', colorCode: 'K01', hex: '#1D1D24', rgb: [29, 29, 36], symbol: 'K' },
  { id: 'purple', name: '丁香紫', colorCode: 'P01', hex: '#8B5CF6', rgb: [139, 92, 246], symbol: 'P' },
  { id: 'light-purple', name: '浅紫', colorCode: 'P02', hex: '#C4B5FD', rgb: [196, 181, 253], symbol: 'L' },
  { id: 'pink', name: '樱花粉', colorCode: 'R01', hex: '#FB7185', rgb: [251, 113, 133], symbol: 'R' },
  { id: 'cream', name: '奶油色', colorCode: 'Y01', hex: '#FDECC8', rgb: [253, 236, 200], symbol: 'C' },
  { id: 'yellow', name: '柠檬黄', colorCode: 'Y02', hex: '#FACC15', rgb: [250, 204, 21], symbol: 'Y' },
  { id: 'brown', name: '浅棕', colorCode: 'B01', hex: '#B45309', rgb: [180, 83, 9], symbol: 'B' },
  { id: 'blue', name: '天空蓝', colorCode: 'BL01', hex: '#60A5FA', rgb: [96, 165, 250], symbol: 'U' },
  { id: 'green', name: '嫩绿色', colorCode: 'G01', hex: '#86EFAC', rgb: [134, 239, 172], symbol: 'G' },
];
```

后续可以扩展为多品牌色卡：

```txt
通用色卡
品牌 A 色卡
品牌 B 色卡
用户自定义色卡
```

### 9.5 颜色匹配算法

MVP 先用 RGB 欧氏距离。

```ts
function colorDistance(a: [number, number, number], b: [number, number, number]) {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow(a[2] - b[2], 2)
  );
}

function findNearestBeadColor(rgb: [number, number, number], palette: BeadColor[]) {
  return palette.reduce((nearest, current) => {
    return colorDistance(rgb, current.rgb) < colorDistance(rgb, nearest.rgb)
      ? current
      : nearest;
  }, palette[0]);
}
```

进阶版可以改为 Lab 色彩空间匹配，让视觉相似度更准确。

### 9.6 减色策略

MVP 可采用简单策略：

1. 将图片缩放到目标网格尺寸。
2. 获取每个格子的 RGB。
3. 匹配到拼豆色卡。
4. 统计所有颜色出现次数。
5. 如果颜色数量超过用户设置的 `colorCount`，保留出现频率最高的 N 个颜色。
6. 其他颜色重新匹配到保留颜色中最近的颜色。

伪代码：

```ts
function reduceToColorLimit(cells, maxColors) {
  const colorFrequency = countColorFrequency(cells);
  const topColors = getTopColors(colorFrequency, maxColors);

  return cells.map(row =>
    row.map(cell => {
      if (topColors.includes(cell.colorId)) return cell;
      const nearest = findNearestColorInTopColors(cell.rgb, topColors);
      return { ...cell, ...nearest };
    })
  );
}
```

### 9.7 材料推荐算法

```ts
function createMaterialRecommendations(pattern: GeneratedPattern): MaterialItem[] {
  const countMap = new Map<string, number>();

  for (const row of pattern.cells) {
    for (const cell of row) {
      if (!cell.isTransparent) {
        countMap.set(cell.colorId, (countMap.get(cell.colorId) || 0) + 1);
      }
    }
  }

  return pattern.colors.map((color) => {
    const requiredCount = countMap.get(color.id) || 0;
    const spareRate = requiredCount > 500 ? 0.08 : 0.1;
    const recommendedCount = Math.ceil(requiredCount * (1 + spareRate) / 10) * 10;

    return {
      colorId: color.id,
      colorName: color.name,
      colorCode: color.colorCode,
      hex: color.hex,
      requiredCount,
      recommendedCount,
      spareCount: recommendedCount - requiredCount,
      spareRate,
      alternativeColors: [],
    };
  });
}
```

### 9.8 Web Worker 要求

图片生成算法要尽量放到 Worker 中，避免主线程卡顿。

文件：`workers/pattern.worker.ts`

Worker 输入：

```ts
type GeneratePatternMessage = {
  type: 'GENERATE_PATTERN';
  payload: {
    imageBitmap: ImageBitmap;
    config: PatternConfig;
    palette: BeadColor[];
  };
};
```

Worker 输出：

```ts
type GeneratePatternResultMessage = {
  type: 'GENERATE_PATTERN_SUCCESS';
  payload: GeneratedPattern;
};
```

进度输出：

```ts
postMessage({
  type: 'GENERATE_PATTERN_PROGRESS',
  payload: {
    progress: 60,
    message: '正在生成拼豆网格...',
  },
});
```

---

## 10. 页面详细开发说明

## 10.1 首页 `/`

### 页面目标

用户快速理解产品，并开始上传。

### Web 布局

```txt
左侧：固定导航 Sidebar
右侧：Hero 区 + 上传卡片 + 示例图 + 功能卡片 + 最近项目
```

### H5 布局

```txt
顶部：Logo + 菜单
中间：Hero Banner
主操作：上传图片 / 拍照生成
下方：示例图 + 功能卡片
底部：TabBar
```

### 功能

1. 点击上传图片进入 `/workspace/upload`。
2. 点击示例图直接进入裁剪或参数页。
3. 未登录用户可以体验基础生成。
4. 已登录用户显示最近项目。

### 验收标准

1. 桌面端显示 Sidebar。
2. 移动端显示底部 TabBar。
3. 主按钮可正常进入上传流程。
4. 页面风格和设计稿一致。

---

## 10.2 上传页 `/workspace/upload`

### Web 功能

1. 拖拽上传。
2. 点击选择文件。
3. 显示最近上传。
4. 显示示例图片。
5. 文件格式校验：JPG、PNG、WebP。
6. 文件大小限制：20MB。

### H5 功能

1. 相册上传。
2. 拍照上传。
3. 示例图体验。
4. 上传前压缩。

### 验收标准

1. 上传图片后进入裁剪页。
2. 格式错误时给出提示。
3. 图片过大时给出提示或压缩。
4. H5 端上传按钮足够大。

---

## 10.3 裁剪页 `/workspace/crop`

### 功能

1. 显示图片裁剪框。
2. 支持拖动裁剪区域。
3. 支持缩放。
4. 支持 1:1、3:4、4:3、16:9、自定义比例。
5. 支持旋转。
6. 支持重置。
7. 点击下一步生成裁剪图片，并进入参数设置页。

### Web 布局

```txt
左侧：大裁剪区域
右侧：上传卡片、最近上传、裁剪小贴士、AI 构图建议
底部：上一步 / 下一步
```

### H5 布局

```txt
顶部：返回、标题、下一步
中间：裁剪区域
下方：缩放条、比例选择、建议卡片
底部：固定下一步按钮
```

### 验收标准

1. 裁剪图可以正确输出为图片 URL。
2. 切换比例后裁剪框正确变化。
3. 移动端拖动和缩放流畅。

---

## 10.4 参数设置页 `/workspace/params`

### Web 参数

```txt
成品大小：小号 / 中号 / 大号 / 自定义
拼豆规格：2.6mm / 5mm / 10mm
颜色数量：12 / 24 / 36 / 48 / 自定义
难度等级：简单 / 标准 / 精细
背景处理：保留背景 / 简化背景 / 去除背景
AI 自动减色：开 / 关
```

### H5 参数

```txt
成品大小：小 / 中 / 大
颜色数量：少 / 标准 / 多
难度：简单 / 标准 / 精细
背景处理：简化 / 保留
```

### 智能预估

显示：

```txt
预计颗数
预计颜色数
预计拼装时间
推荐难度
```

### 验收标准

1. 修改参数后实时更新预估信息。
2. 点击“生成图纸”进入生成中页面。
3. H5 端参数选择不使用复杂输入框。

---

## 10.5 生成中页 `/workspace/generating`

### 功能

1. 调用 Worker 生成拼豆图纸。
2. 显示进度条。
3. 显示当前步骤。
4. 生成成功后跳转预览页。
5. 生成失败时显示错误并允许重试。

### 进度文案

```txt
正在识别图片主体...
正在优化颜色...
正在生成拼豆网格...
正在统计材料清单...
正在完成图纸预览...
```

### 验收标准

1. 生成过程不阻塞 UI。
2. 常规 40 × 40 图纸 20 秒内生成。
3. 失败可重试。

---

## 10.6 图纸预览页 `/workspace/preview`

### 功能

1. 显示原图。
2. 显示拼豆效果图。
3. 显示颜色列表。
4. 显示使用颜色数量。
5. 显示相似度 / 可拼性评分，可先用模拟分数。
6. 支持重新生成。
7. 支持查看明细图纸。

### Web 布局

```txt
顶部：标题 + 下载 / 分享
上方：原图和拼豆预览并排
中部：颜色条
下方：完整图纸 / 分区图纸 / 颜色统计 Tabs
右侧：颜色表和评分卡
```

### H5 布局

```txt
顶部：返回 + 标题 + 分享
上方：原图 / 拼豆预览
中部：颜色横向滚动
下方：预览 / 明细 / 颜色 Tabs
底部：查看材料推荐按钮
```

### 验收标准

1. 图纸和颜色统计一致。
2. 点击颜色能在明细图中高亮同色，P1 可做。
3. 支持进入明细页。

---

## 10.7 明细图纸页 `/workspace/detail`

### 功能

1. 展示完整拼豆网格。
2. 每颗豆显示颜色或符号。
3. 显示横纵坐标。
4. 支持缩放。
5. 支持平移。
6. 支持高亮同色。
7. 支持分区查看。
8. 右侧或下方显示颜色明细。

### Web 技术要求

使用 `react-konva` 或 Canvas 绘制。

### H5 技术要求

1. 默认显示适合手机的缩放尺寸。
2. 支持双指缩放。
3. 支持“分区查看”按钮。
4. 大图纸不要一次性渲染过多 DOM，优先 Canvas。

### 验收标准

1. 40 × 40 图纸不卡顿。
2. 64 × 64 图纸基本可用。
3. 颜色表和图纸数量一致。
4. 点击“查看材料推荐”进入导出页。

---

## 10.8 导出 / 打印 / 材料推荐页 `/workspace/export`

### 页面名称

注意：本项目不使用“购买材料”这个词，统一使用 **材料推荐**。

### 功能

1. 材料推荐表。
2. 每种颜色的需求数量、建议数量、备用量。
3. 替代色建议。
4. 工具建议：底板、镊子、烫纸。
5. 导出 PNG。
6. 导出 PDF。
7. 打印设置。
8. 分享链接。

### PDF 内容

```txt
第 1 页：作品预览
第 2 页：完整图纸
第 3 页：分区图纸
第 4 页：颜色说明表
第 5 页：材料推荐清单
```

### 验收标准

1. 导出 PDF 成功。
2. PDF 中包含图纸和材料清单。
3. 材料推荐数量与图纸统计一致。
4. H5 端可以保存图片或复制分享链接。

---

## 10.9 我的项目 `/projects`

### 功能

1. 项目列表。
2. 搜索项目。
3. 按状态筛选：全部 / 草稿 / 已导出 / 收藏。
4. 新建项目。
5. 删除项目。
6. 复制项目。
7. 重命名项目。
8. 打开项目继续编辑。

### 验收标准

1. 未登录用户提示登录后保存。
2. 登录用户可看到自己的项目。
3. 项目卡片显示封面、名称、尺寸、颜色数、更新时间。

---

## 11. Supabase 数据库设计

### 11.1 profiles 表

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  avatar_url text,
  plan text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 11.2 projects 表

```sql
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null default '未命名项目',
  status text not null default 'draft',
  source_image_url text,
  cropped_image_url text,
  cover_image_url text,
  config jsonb not null default '{}'::jsonb,
  pattern jsonb,
  total_beads int default 0,
  color_count int default 0,
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 11.3 material_recommendations 表

```sql
create table public.material_recommendations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  color_id text not null,
  color_name text not null,
  color_code text not null,
  hex text not null,
  required_count int not null,
  recommended_count int not null,
  spare_count int not null,
  spare_rate numeric not null,
  alternative_colors jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);
```

### 11.4 export_records 表

```sql
create table public.export_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  export_type text not null,
  file_url text,
  created_at timestamptz default now()
);
```

### 11.5 templates 表，P2

```sql
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  cover_url text,
  pattern jsonb,
  color_count int,
  total_beads int,
  is_public boolean default true,
  created_at timestamptz default now()
);
```

### 11.6 RLS 权限策略

必须开启 Row Level Security。

```sql
alter table public.projects enable row level security;
alter table public.material_recommendations enable row level security;
alter table public.export_records enable row level security;
```

项目策略示例：

```sql
create policy "Users can view own projects"
on public.projects
for select
using (auth.uid() = user_id);

create policy "Users can insert own projects"
on public.projects
for insert
with check (auth.uid() = user_id);

create policy "Users can update own projects"
on public.projects
for update
using (auth.uid() = user_id);

create policy "Users can delete own projects"
on public.projects
for delete
using (auth.uid() = user_id);
```

---

## 12. Supabase Storage 设计

### 12.1 Bucket

```txt
project-images
project-exports
template-assets
```

### 12.2 路径规范

```txt
project-images/{userId}/{projectId}/source.png
project-images/{userId}/{projectId}/cropped.png
project-images/{userId}/{projectId}/preview.png
project-exports/{userId}/{projectId}/pattern.pdf
project-exports/{userId}/{projectId}/pattern.png
```

### 12.3 上传限制

```txt
图片最大：20MB
支持格式：JPG / JPEG / PNG / WebP
导出 PDF 最大：建议 50MB 内
```

---

## 13. API 设计

## 13.1 保存项目

```txt
POST /api/projects
```

请求：

```ts
{
  title: string;
  sourceImageUrl?: string;
  croppedImageUrl?: string;
  config: PatternConfig;
  pattern?: GeneratedPattern;
}
```

响应：

```ts
{
  success: boolean;
  project: Project;
}
```

## 13.2 获取项目列表

```txt
GET /api/projects
```

支持 query：

```txt
status
keyword
favorite
page
pageSize
```

## 13.3 更新项目

```txt
PATCH /api/projects/:id
```

## 13.4 删除项目

```txt
DELETE /api/projects/:id
```

## 13.5 导出 PDF

```txt
POST /api/export/pdf
```

请求：

```ts
{
  projectId: string;
  pattern: GeneratedPattern;
  exportOptions: {
    paperSize: 'A4' | 'A3';
    orientation: 'portrait' | 'landscape';
    showCoordinates: boolean;
    showSymbols: boolean;
  };
}
```

响应：

```ts
{
  success: boolean;
  fileUrl?: string;
  blob?: Blob;
}
```

---

## 14. 开发任务拆解

### 阶段一：项目初始化

1. 创建 Next.js + TypeScript 项目。
2. 配置 Tailwind CSS。
3. 配置 shadcn/ui。
4. 配置路径别名 `@/*`。
5. 创建基础目录结构。
6. 创建主题色和全局样式。
7. 创建 Web Sidebar 和 H5 TabBar。
8. 完成响应式 Layout。

验收：

```txt
项目能正常启动
首页有统一风格
桌面端和移动端布局不同但风格一致
```

### 阶段二：首页 + 上传流程

1. 首页 Hero。
2. 上传入口。
3. 示例图片。
4. 上传页。
5. 文件格式和大小校验。
6. Zustand 保存原图状态。

验收：

```txt
上传图片后能进入裁剪页
H5 能从相册选择图片
Web 能拖拽上传图片
```

### 阶段三：裁剪功能

1. 集成 react-easy-crop。
2. 实现比例选择。
3. 实现缩放和旋转。
4. 生成裁剪后的图片 URL。
5. 进入参数设置页。

验收：

```txt
裁剪结果正确
比例切换正常
移动端触控流畅
```

### 阶段四：参数设置

1. Web 完整参数面板。
2. H5 简化参数卡片。
3. 实时计算 gridWidth / gridHeight。
4. 实时计算预计颗数、颜色数、时间。
5. 点击生成进入 generating。

验收：

```txt
参数能写入 store
预计数据随参数变化
```

### 阶段五：拼豆图纸生成算法

1. 实现色卡。
2. 实现颜色匹配。
3. 实现图片缩放采样。
4. 实现颜色限制。
5. 实现材料统计。
6. 接入 Web Worker。
7. 生成 GeneratedPattern。

验收：

```txt
能从一张图片生成二维图纸数据
能生成颜色表和材料清单
生成过程不卡 UI
```

### 阶段六：图纸预览和明细图纸

1. 预览页展示原图和拼豆图。
2. Canvas 绘制拼豆预览。
3. 明细页绘制完整网格。
4. 显示坐标。
5. 显示颜色表。
6. 实现缩放。
7. 实现同色高亮，P1。
8. 实现分区查看，P1。

验收：

```txt
图纸可读
颜色数量一致
缩放可用
```

### 阶段七：材料推荐 + 导出

1. 材料推荐表。
2. H5 材料推荐卡片。
3. PNG 导出。
4. PDF 导出。
5. 打印设置。
6. 分享链接，P1。

验收：

```txt
材料推荐数量正确
PDF 能下载
PNG 能保存
```

### 阶段八：Supabase 集成

1. 创建数据库表。
2. 配置 Supabase Auth。
3. 配置 Supabase Storage。
4. 项目保存。
5. 项目列表。
6. 项目详情。
7. 导出记录。

验收：

```txt
登录用户能保存项目
用户只能看到自己的项目
刷新后项目仍然存在
```

---

## 15. 环境变量

创建 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

注意：

1. `SUPABASE_SERVICE_ROLE_KEY` 只能在服务端使用。
2. 不要暴露到客户端。
3. 客户端只能使用 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。

---

## 16. 需要安装的依赖

```bash
npm install zustand zod react-hook-form @hookform/resolvers
npm install react-easy-crop react-dropzone
npm install konva react-konva
npm install @supabase/supabase-js
npm install pdf-lib jspdf
npm install lucide-react framer-motion
npm install browser-image-compression
```

shadcn/ui 初始化：

```bash
npx shadcn@latest init
npx shadcn@latest add button card tabs dialog sheet table input label slider switch select badge progress separator scroll-area tooltip
```

可选：

```bash
npm install sharp
```

---

## 17. 代码质量要求

1. 所有核心数据结构必须有 TypeScript 类型。
2. 所有可复用 UI 拆成组件。
3. 核心算法放在 `lib/pattern`，不要写在页面组件里。
4. Worker 逻辑和 UI 逻辑分离。
5. 页面组件只负责展示和交互调度。
6. 所有错误都要有用户提示。
7. 移动端必须测试 375px 宽度。
8. 桌面端必须测试 1440px 宽度。
9. 不要使用在线购买、商城支付相关文案。
10. 项目内统一使用“材料推荐”。

---

## 18. MVP 验收清单

### 必须完成

```txt
[ ] 首页 Web + H5 响应式
[ ] 图片上传
[ ] 图片裁剪
[ ] 参数设置
[ ] 图纸生成算法
[ ] Web Worker 生成
[ ] 图纸预览
[ ] 明细图纸
[ ] 颜色统计
[ ] 材料推荐
[ ] PNG 导出
[ ] PDF 导出
[ ] 我的项目
[ ] 项目保存
[ ] Supabase Auth
[ ] Supabase Storage
[ ] 移动端适配
```

### 可后置

```txt
[ ] 模板中心
[ ] 分享链接
[ ] 同色高亮
[ ] 分区打印
[ ] PWA
[ ] 高级色卡
[ ] AI 主体识别
[ ] 背景去除模型
```

---

## 19. Codex 开发指令建议

可以把下面这段作为给 Codex 的第一条任务：

```txt
请你根据当前项目开发文档，从 0 初始化一个 Next.js App Router + TypeScript + Tailwind CSS 项目，项目名称为 bean-pattern-workshop。请先完成基础工程结构、主题样式、响应式 AppShell、Web 端 Sidebar、H5 端 TabBar、首页和上传页。项目风格遵循“奶油紫拼豆工坊风”：奶油白背景、浅紫主色、圆角卡片、柔和阴影、可爱拼豆元素。先不要实现后端数据库，先用本地 Zustand 状态完成上传流程。
```

第二条任务：

```txt
请继续实现裁剪页和参数设置页。裁剪页使用 react-easy-crop，支持 1:1、3:4、4:3、16:9 比例选择、缩放、旋转、重置。参数设置页需要支持成品大小、拼豆规格、颜色数量、难度、背景处理、AI 自动减色，并实时显示预计颗数、预计颜色数和预计拼装时间。Web 端使用大屏双栏布局，H5 端使用单列卡片布局。
```

第三条任务：

```txt
请实现拼豆图纸生成核心逻辑。将算法放到 lib/pattern 中，并使用 workers/pattern.worker.ts 在 Web Worker 中运行。输入为裁剪后的图片、PatternConfig 和默认拼豆色卡；输出 GeneratedPattern，包括二维 cells、颜色表、总颗数和材料推荐。MVP 使用 Canvas 缩放采样 + RGB 最近色匹配 + 高频颜色保留的减色策略。
```

第四条任务：

```txt
请实现图纸预览页、明细图纸页和材料推荐 / 导出页。图纸预览页展示原图和拼豆图对比；明细图纸页使用 Canvas 或 react-konva 绘制网格、坐标和色号；材料推荐页展示每种颜色的需求数量、建议数量和备用量，并支持导出 PNG 和 PDF。注意：页面文案统一使用“材料推荐”，不要出现“购买材料”。
```

第五条任务：

```txt
请接入 Supabase。创建 Supabase client/server 工具函数，设计 projects、material_recommendations、export_records 表，支持用户登录、保存项目、读取项目列表、项目详情和导出记录。注意开启 RLS，确保用户只能访问自己的项目。
```

---

## 20. 开发前你需要准备的内容

### 20.1 必须准备

1. GitHub 仓库。
2. Supabase 项目。
3. Vercel 账号。
4. 项目 Logo，建议先用临时文字 Logo 也可以。
5. 3 到 5 张测试图片：宠物、头像、风景、动漫、简单图标。
6. 拼豆默认色卡，MVP 可以先用内置 20 到 40 个颜色。

### 20.2 建议准备

1. 可爱拼豆 IP 形象，例如紫色小猫。
2. 示例图素材。
3. 首页 Banner 图。
4. 空状态插画。
5. 生成中动效素材。
6. PDF 导出模板样式。

### 20.3 暂时不需要准备

1. 支付接口。
2. 商城系统。
3. 物流系统。
4. 社区审核系统。
5. 复杂 AI 模型。

---

## 21. 项目里程碑

### M1：基础界面与上传流程

```txt
首页
上传页
响应式布局
Zustand 状态
```

### M2：裁剪与参数设置

```txt
裁剪页
参数页
智能预估
```

### M3：核心生成算法

```txt
Canvas 采样
颜色匹配
颜色减色
材料统计
Web Worker
```

### M4：图纸展示与导出

```txt
预览页
明细页
材料推荐页
PNG 导出
PDF 导出
```

### M5：用户与项目系统

```txt
Supabase Auth
项目保存
项目列表
导出记录
```

---

## 22. 最终交付标准

项目完成后，应该能演示以下完整路径：

```txt
1. 用户打开首页
2. 点击上传图片
3. 裁剪主体区域
4. 设置图纸参数
5. 点击生成图纸
6. 系统生成拼豆图纸
7. 用户查看图纸预览
8. 用户查看明细网格
9. 用户查看材料推荐
10. 用户导出 PDF 或 PNG
11. 用户保存项目
12. 用户在我的项目中再次打开
```

---

## 23. 注意事项

1. 首版必须以“可用”为目标，不追求完美 AI。
2. 不要一开始做商城和支付。
3. 核心亮点是图像处理 + 图纸生成 + 材料推荐。
4. Web 和 H5 不要拆成两个项目。
5. 先完成基础算法，再优化生成质量。
6. PDF 导出可以先简单实现，再优化排版。
7. 复杂图片生成效果不佳时，要提示用户选择简单模式或减少颜色数量。
8. 用户上传图片后，如果未登录，允许体验但提示登录可保存项目。
9. 所有页面要保留统一风格。
10. 代码结构必须清晰，便于后续继续扩展。

---

## 24. 最小可运行 Demo 标准

即使不接数据库，也至少要做到：

```txt
本地上传图片
裁剪
设置参数
生成图纸
展示图纸
统计颜色数量
展示材料推荐
导出 PNG
```

这就是最小可演示版本。

---

## 25. 后续可扩展方向

1. 多品牌拼豆色卡。
2. 更精准的 Lab 色彩匹配。
3. K-means / Median Cut 减色算法。
4. AI 主体识别。
5. 自动去背景。
6. 模板中心。
7. 社区作品分享。
8. 图纸收藏。
9. 用户等级。
10. 材料清单外部链接。
11. PWA 离线查看。
12. 批量生成图纸。

---

## 26. 本文档推荐的第一阶段开发顺序

如果用 Codex 开发，请按以下顺序下发任务：

```txt
1. 初始化项目和 UI 基础架构
2. 首页和上传页
3. 裁剪页
4. 参数设置页
5. 图纸生成算法
6. Web Worker
7. 预览页
8. 明细图纸页
9. 材料推荐页
10. PNG / PDF 导出
11. Supabase 登录和项目保存
12. 移动端细节优化
```

---

## 27. 技术参考链接

- Next.js App Router: https://nextjs.org/docs/app
- Supabase Docs: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com
- Konva / react-konva: https://konvajs.org/docs/react/index.html
- Sharp: https://sharp.pixelplumbing.com
- pdf-lib: https://pdf-lib.js.org
