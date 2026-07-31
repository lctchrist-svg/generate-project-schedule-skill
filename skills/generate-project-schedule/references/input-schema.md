# 输入 JSON

```json
{
  "projectName": "项目名称",
  "startDate": "2026-08-03",
  "maxParallelTasks": 2,
  "followUpWorkdays": 5,
  "holidays": ["2026-10-01"],
  "adjustedWorkdays": ["2026-10-10"],
  "stages": [
    {
      "name": "风格研究与设计",
      "totalWorkdays": 10,
      "needsProposal": true,
      "deliverables": "身体科技风格方向、概念风格板",
      "acceptance": "甲方确认主风格方向",
      "tasks": [
        {"name": "趋势研究", "startOrdinal": 1, "endOrdinal": 4},
        {"name": "风格方向构思", "startOrdinal": 3, "endOrdinal": 8},
        {"name": "成果整理", "startOrdinal": 9, "endOrdinal": 10}
      ]
    }
  ]
}
```

日期使用 `YYYY-MM-DD`。`startOrdinal` 和 `endOrdinal` 是板块内部正式工作日序号，不是日历日期。
