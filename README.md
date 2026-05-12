# 豆图工坊

Next.js App Router + TypeScript + Tailwind CSS 的拼豆图纸生成器 MVP。

用户可以上传图片、裁剪主体、设置图纸参数、生成拼豆图纸、查看明细网格、统计材料推荐，并导出 PNG / PDF。

## 当前进度

- 奶油紫主题样式与响应式 AppShell
- 首页、上传页、裁剪页、参数页、生成页
- 图纸预览、明细图纸、材料推荐 / 导出页
- Zustand 本地工作流状态
- Canvas / Web Worker 图纸生成
- Mard 221 色卡、Lab 感知色彩匹配与可调颜色合并
- 滑杆式豆子数量、横轴切割、颜色上限和合并强度设置
- 裁剪比例锁定，重新生成时保持原始画布比例
- Supabase 登录、项目保存、项目列表与项目详情
- Supabase 数据库迁移 SQL

## 开发

```bash
npm install
npm run dev
```

## 校验

```bash
npm run typecheck
npm run build
```
