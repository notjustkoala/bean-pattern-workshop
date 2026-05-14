# 豆图工坊项目交接文档

最后更新：2026-05-12  
项目：bean-pattern-workshop  
当前目录：E:\se-learn\pindou\bean-pattern-workshop

## 项目概况

豆图工坊是 Next.js App Router + TypeScript + Tailwind CSS 项目，用于把图片转换成拼豆图纸，支持上传、裁剪、参数设置、图纸生成、预览、明细、导出打印、材料推荐和项目保存。

技术栈：Next.js 15、React 19、TypeScript、Tailwind CSS、Zustand、Supabase、react-easy-crop、Canvas/Web Worker。

## 已完成模块

- 基础工程、全局主题、奶油紫拼豆工坊风 UI。
- 响应式 AppShell：Web Sidebar、H5 TabBar、TopBar。
- 首页 `/`。
- 上传页 `/workspace/upload`。
- 裁剪页 `/workspace/crop`。
- 参数页 `/workspace/params`。
- 生成页 `/workspace/generating`。
- 预览页 `/workspace/preview`。
- 明细页 `/workspace/detail`。
- 导出/材料页 `/workspace/export`。
- 登录页 `/login` 和 Auth callback。
- 我的项目 `/projects` 和项目详情 `/projects/[id]`。
- Supabase 项目保存、项目读取、材料推荐写入。

## 关键文件

- 状态：`src/stores/pattern-store.ts`
- 类型：`src/types/pattern.ts`
- 路由：`src/app/*`
- 布局：`src/components/layout/*`
- 上传：`src/components/upload/*`
- 裁剪：`src/components/crop/CropWorkspace.tsx`
- 参数：`src/components/params/*`
- 图纸生成：`src/lib/pattern/generator.ts`
- Worker：`src/workers/pattern.worker.ts`
- 预览绘制：`src/lib/pattern/preview.ts`
- 导出：`src/lib/pattern/export-image.ts`
- Supabase：`src/lib/supabase/*`
- 数据库 SQL：`supabase/migrations/0001_initial_schema.sql`

## 最新迭代记录

2026-05-12：

- 图纸生成算法从 RGB 最近色匹配升级为 Lab 感知色彩匹配。
- 默认色卡切换为 `all-colors.md` 记录的 Mard 221 色，最终图纸色号只输出 Mard 色号。
- 新增 `aspectRatio`、`targetBeadCount`、`colorMergeStrength`、`colorMergeMode` 配置。
- 颜色合并 0% 时使用完整 Mard 色卡，并加入饱和度惩罚，避免动画图匹配到偏灰、偏淡颜色。
- Worker 在 0% 合并时关闭缩放平滑，优先保留动画图硬边和高饱和色。
- 豆子数量上限提升到 176400，横轴切割上限提升到 420，颜色上限按 Mard 色卡限制为 221。
- 裁剪比例会写入配置，后续调横轴切割会按裁剪比例推导纵轴，避免 1:1 重新生成后变形。
- 参数页新增滑杆式精细参数轴：豆子数量、横轴切割、可用颜色上限、颜色合并模式。
- 预览页新增“生成后编辑”，用户可以拖动参数轴并基于同一图片重新生成。

2026-05-13：

- 新增图像类型配置 `imageMode`，支持 `realistic` 真实图片与 `cartoon` Q版/像素图两套算法。
- 上传页、参数页和生成后编辑区都可以选择“真实图片”或“Q版 / 像素图”；选择 Q版会自动切到 221 色、0% 合并和精细模式。
- 真实图片算法走柔和区域平均采样，更适合风景、人像、宠物等连续色调图片。
- Q版算法走边缘感知的局部颜色簇采样，更适合小图、像素图、卡通人物和线稿。
- Worker 采样从目标网格缩放取点改为源图区域代表色采样，颜色合并 0% 时优先保留线条和高饱和局部颜色。
- 区域采样继续升级为边缘感知的局部颜色簇采样，提升眼睛、轮廓、发丝、装饰等精细小部位的还原。
- Mard 色卡匹配在 0% 合并时提高 RGB、亮度和饱和度保真权重，减少简单线稿颜色被映射成偏浅或偏灰的问题。
- 色卡筛选阶段给深色线条和高饱和小色块增加保留权重，降低细节色因占比小被合并掉的概率。
- Q版生成新增细线连续性桥接，会补齐水平、垂直和斜向一到两格内的断线，改善头发线、轮廓线中断。
- Q版采样窗口轻微外扩并提高低合并模式采样密度，减少细线落在格子边界时被漏采的问题。
- 参数页拼豆规格去除 10mm，只保留 2.6mm 和 5mm。
- 生成页完成后直接展示原图、拼豆预览、明细图纸、生成后编辑和豆子颜色明细，用户可在同一页调整参数并重新生成。

## Supabase 状态

已设计并执行的表：

- `profiles`
- `projects`
- `material_recommendations`
- `export_records`

已设计 Storage bucket：

- `project-images`
- `project-exports`
- `template-assets`

所有业务表已启用 RLS。项目、材料、导出记录按 `auth.uid() = user_id` 限制。

## 环境变量

`.env.local` 需要：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=你的 publishable key
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 anon public key，可选
SUPABASE_SERVICE_ROLE_KEY=你的 service role key，可选，仅服务端使用
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
