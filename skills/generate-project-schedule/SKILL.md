---
name: generate-project-schedule
description: Generate and validate Chinese project Gantt schedule workbooks from service proposals, contracts, or manually supplied service items. Use when users need to extract service stages and total working-day durations, avoid Chinese weekends/holidays/adjusted workdays, allocate subtasks within each stage without summing them into extra duration, add proposal days outside formal duration, estimate follow-up periods, or produce a standardized Excel project schedule.
---

# 项目排期自动生成

## 工作流

1. 读取服务建议书或合同，提取板块名称、板块总工期、交付物、通过标准、提案要求和前后依赖。
2. 将提取结果整理为 `references/input-schema.md` 中的 JSON。
3. 读取 `references/scheduling-rules.md`，以板块总工期为唯一工期口径。
4. 运行：

   ```bash
   node scripts/plan_schedule.mjs input.json output.json
   ```

5. 检查输出中的 `validation.errors`。存在错误时停止生成 Excel，先修正输入。
6. 使用 `assets/project-schedule-template.xlsx` 生成最终工作簿，保留模板的冻结窗格、颜色、列宽和图例。
7. 检查甘特图中每个板块的不同正式工作日期数量，必须等于该板块 `totalWorkdays`。
8. 检查提案日是否为板块正式工作结束后的下一个有效工作日，且未计入正式工期。
9. 渲染并检查全部工作表后再交付。

## 强制规则

- 不得把服务细项工期相加为板块工期。
- 所有细项必须分配在所属板块的正式工作日期集合之内；细项允许并行。
- “无需提案”的板块不得生成粉色提案节点。
- 有提案的板块，提案日为正式工作结束后的下一个有效工作日。
- 周末、法定休假日不排正式工作；法定补班日视为工作日。
- 默认同时进行的细项不超过 2 项，除非输入明确允许。
- 黄色跟进默认 5 个工作日，仅为估算，不计入正式工期。
- 输出前必须报告正式工作日合计、提案日数量和各板块日期范围。

## 资源

- 排期与颜色规则：`references/scheduling-rules.md`
- 输入数据结构：`references/input-schema.md`
- 计算与校验脚本：`scripts/plan_schedule.mjs`
- Excel 模板：`assets/project-schedule-template.xlsx`
