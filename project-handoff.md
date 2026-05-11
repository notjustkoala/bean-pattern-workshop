# 豆图工坊项目交接文档

最后更新：2026-05-11  
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
