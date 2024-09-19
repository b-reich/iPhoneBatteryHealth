import * as csv from "jsr:@std/csv@1";
import type { BatteryEntry } from "./data.ts";
import * as gnuplot from "./gnuplot.ts";

async function generateBatteryCsvFile(battery: BatteryEntry, filename: string) {
  const columns: csv.ColumnDetails[] = [
    { header: "Date", prop: 0 },
    {
      header: `(${battery.owner}) ${battery.device} ${battery.age.slice(0, 7)}`,
      prop: 1,
    },
  ];

  const lines = Object.entries(battery.health).map(([key, value]) => {
    const timestamp = Date.parse(key) / 1000;
    return [String(timestamp), String(value)];
  });

  const content = csv.stringify(lines, { columns });
  await Deno.writeTextFile(filename, content);
}

export async function batteryDate(
  batteries: readonly BatteryEntry[],
): Promise<void> {
  const sortedBatteries = [...batteries]
    // Newest Battery first
    .sort((a, b) => Date.parse(b.age) - Date.parse(a.age));

  await Promise.all(
    sortedBatteries.map((o, i) =>
      generateBatteryCsvFile(o, `tmp/date-${i + 1}.csv`)
    ),
  );
  await gnuplot.run("battery-date.gnuplot", [
    `lines=${sortedBatteries.length}`,
  ]);
}
