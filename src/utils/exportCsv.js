export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;

  const keys = Object.keys(rows[0]).filter(
    (key) => key !== "id"
  );

  const csvContent = [
    keys.join(";"),
    ...rows.map((row) =>
      keys.map((k) => `"${row[k] ?? ""}"`).join(";")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}