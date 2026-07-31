# Generate Project Schedule Skill

从服务建议书、合同或人工整理的服务项生成并校验中国项目甘特排期。Skill 会严格按板块总工作日排期，避开周末和法定节假日，识别法定补班日，并按统一模板生成 Excel。

## 主要规则

- 板块总工作日是唯一工期口径，细项必须在板块总工期内分配。
- 绿色为正式工作日，粉色为提案日，灰色为前期准备，黄色为默认 5 个工作日的跟进期。
- 提案日在正式工期结束后的下一个有效工作日，不计入板块工作日。
- 多个细项可并行，默认同一天不超过 2 项。

## 安装

在 Codex 中直接说：

> 请从 GitHub 安装 `lctchrist-svg/generate-project-schedule-skill` 仓库中 `skills/generate-project-schedule` 路径的 Skill。

也可以使用 Codex 自带的安装脚本：

```bash
python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo lctchrist-svg/generate-project-schedule-skill \
  --path skills/generate-project-schedule
```

安装完成后，在下一轮对话中使用 `$generate-project-schedule`。

## 更新

安装器为避免覆盖本地内容，不会自动覆盖已存在的 Skill。更新时先把旧目录移到备份位置，再重新安装：

```bash
mv ~/.codex/skills/generate-project-schedule \
  ~/.codex/skills/generate-project-schedule.backup

python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo lctchrist-svg/generate-project-schedule-skill \
  --path skills/generate-project-schedule
```

确认新版本正常后，可自行删除备份目录。

## 仓库结构

```text
skills/generate-project-schedule/
├── SKILL.md
├── agents/openai.yaml
├── assets/project-schedule-template.xlsx
├── references/
│   ├── input-schema.md
│   └── scheduling-rules.md
└── scripts/plan_schedule.mjs
```

## 修改模板

以后只需替换：

`skills/generate-project-schedule/assets/project-schedule-template.xlsx`

然后提交并推送到 GitHub。团队成员按上面的更新流程重新安装即可，不需要重做整个 Skill。
