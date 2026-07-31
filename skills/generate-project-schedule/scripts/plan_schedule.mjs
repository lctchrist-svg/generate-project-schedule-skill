import fs from "node:fs/promises";

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  console.error("Usage: node plan_schedule.mjs <input.json> <output.json>");
  process.exit(2);
}

const input = JSON.parse(await fs.readFile(inputPath, "utf8"));
const holidays = new Set(input.holidays ?? []);
const adjustedWorkdays = new Set(input.adjustedWorkdays ?? []);
const maxParallel = input.maxParallelTasks ?? 2;

const iso = (date) => date.toISOString().slice(0, 10);
const addDays = (date, days) => new Date(date.getTime() + days * 86400000);
const parseDate = (value) => new Date(`${value}T00:00:00Z`);

function isWorkday(date) {
  const key = iso(date);
  if (adjustedWorkdays.has(key)) return true;
  if (holidays.has(key)) return false;
  return ![0, 6].includes(date.getUTCDay());
}

function nextWorkday(date) {
  let cursor = addDays(date, 1);
  while (!isWorkday(cursor)) cursor = addDays(cursor, 1);
  return cursor;
}

function workdaySequence(start, count) {
  const result = [];
  let cursor = parseDate(start);
  while (result.length < count) {
    if (isWorkday(cursor)) result.push(iso(cursor));
    cursor = addDays(cursor, 1);
  }
  return result;
}

const errors = [];
const warnings = [];
const stages = [];
let cursor = input.startDate;

for (const [index, stage] of (input.stages ?? []).entries()) {
  if (!Number.isInteger(stage.totalWorkdays) || stage.totalWorkdays <= 0) {
    errors.push(`stages[${index}].totalWorkdays 必须是正整数`);
    continue;
  }

  const workdays = workdaySequence(cursor, stage.totalWorkdays);
  const concurrency = Array(stage.totalWorkdays).fill(0);
  const tasks = [];

  for (const [taskIndex, task] of (stage.tasks ?? []).entries()) {
    const startOrdinal = task.startOrdinal;
    const endOrdinal = task.endOrdinal;
    if (
      !Number.isInteger(startOrdinal) ||
      !Number.isInteger(endOrdinal) ||
      startOrdinal < 1 ||
      endOrdinal < startOrdinal ||
      endOrdinal > stage.totalWorkdays
    ) {
      errors.push(`stages[${index}].tasks[${taskIndex}] 超出板块总工期`);
      continue;
    }
    for (let day = startOrdinal - 1; day < endOrdinal; day++) concurrency[day] += 1;
    tasks.push({
      ...task,
      startDate: workdays[startOrdinal - 1],
      endDate: workdays[endOrdinal - 1],
      allocatedWorkdays: endOrdinal - startOrdinal + 1
    });
  }

  concurrency.forEach((count, day) => {
    if (count === 0) warnings.push(`${stage.name} 第${day + 1}个工作日未分配细项`);
    if (count > maxParallel) errors.push(`${stage.name} 第${day + 1}个工作日并行${count}项，超过上限${maxParallel}`);
  });

  const finalWorkday = parseDate(workdays.at(-1));
  const proposalDate = stage.needsProposal ? iso(nextWorkday(finalWorkday)) : null;
  stages.push({
    ...stage,
    workdays,
    workStartDate: workdays[0],
    workEndDate: workdays.at(-1),
    proposalDate,
    displayEndDate: proposalDate ?? workdays.at(-1),
    tasks
  });
  cursor = iso(nextWorkday(parseDate(proposalDate ?? workdays.at(-1))));
}

const formalWorkdays = stages.reduce((sum, stage) => sum + stage.totalWorkdays, 0);
const followUpWorkdays = input.followUpWorkdays ?? 5;
const followUpDates = workdaySequence(cursor, followUpWorkdays);

const result = {
  projectName: input.projectName,
  startDate: input.startDate,
  formalWorkdays,
  proposalCount: stages.filter((stage) => stage.needsProposal).length,
  stages,
  followUp: {
    estimatedWorkdays: followUpWorkdays,
    dates: followUpDates,
    startDate: followUpDates[0] ?? null,
    endDate: followUpDates.at(-1) ?? null
  },
  validation: { errors, warnings, ok: errors.length === 0 }
};

await fs.writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`OK: ${stages.length} stages, ${formalWorkdays} formal workdays`);
