import * as XLSX from "xlsx";
import { TournamentRegistration } from "./types";

export const EXPORT_HEADERS = [
  "Reg No.",
  "Team Name",
  "Captain (Player 1) Name",
  "Captain (Player 1) IGN",
  "Captain (Player 1) UID",
  "Player 2 Name",
  "Player 2 UID",
  "Player 3 Name",
  "Player 3 UID",
  "Player 4 Name",
  "Player 4 UID",
  "Player 5 (Substitute) Name",
  "Player 5 (Substitute) UID",
  "Contact",
  "Registered At",
];

export function mapRegistrationToExportRow(reg: TournamentRegistration): string[] {
  let p2 = { name: "", uid: "" };
  let p3 = { name: "", uid: "" };
  let p4 = { name: "", uid: "" };
  let p5 = reg.substitute || { name: "", uid: "" };

  if (reg.players && reg.players.length > 0) {
    if (reg.players.length === 1) {
      // Duo format: Captain is Player 1, player is Player 2
      p2 = reg.players[0] || p2;
    } else if (reg.players.length === 2) {
      p2 = reg.players[0] || p2;
      p3 = reg.players[1] || p3;
    } else if (reg.players.length === 3) {
      // Standard Squad format: Captain is Player 1, squad teammates are Player 2, Player 3, Player 4
      p2 = reg.players[0] || p2;
      p3 = reg.players[1] || p3;
      p4 = reg.players[2] || p4;
    } else if (reg.players.length >= 4) {
      // 4+ players provided in roster
      p2 = reg.players[0] || p2;
      p3 = reg.players[1] || p3;
      p4 = reg.players[2] || p4;
      if (!p5.name && reg.players[3]) {
        p5 = reg.players[3];
      }
    }
  }

  const contactStr = `Phone: ${reg.contact.phone} | Email: ${reg.contact.email}`;
  const registeredAtFormatted = new Date(reg.createdAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  return [
    String(reg.registrationNumber),
    reg.teamName,
    reg.captain.name,
    reg.captain.ign,
    String(reg.captain.uid),
    p2.name,
    String(p2.uid || ""),
    p3.name,
    String(p3.uid || ""),
    p4.name,
    String(p4.uid || ""),
    p5.name,
    String(p5.uid || ""),
    contactStr,
    registeredAtFormatted,
  ];
}

/**
 * Generates an Excel (.xlsx) buffer with UID columns explicitly formatted as text
 */
export function generateExcelExport(registrations: TournamentRegistration[]): Buffer {
  const rows = registrations.map(mapRegistrationToExportRow);
  const data = [EXPORT_HEADERS, ...rows];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Force all cells to text type ('s') so spreadsheet programs never truncate or scientific-notate UIDs
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:O1");
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].t = "s"; // String/Text type
      }
    }
  }

  // Set friendly column widths
  worksheet["!cols"] = [
    { wch: 10 }, // Reg No
    { wch: 22 }, // Team Name
    { wch: 22 }, // Captain (Player 1) Name
    { wch: 18 }, // Captain (Player 1) IGN
    { wch: 18 }, // Captain (Player 1) UID
    { wch: 18 }, // Player 2 Name
    { wch: 16 }, // Player 2 UID
    { wch: 18 }, // Player 3 Name
    { wch: 16 }, // Player 3 UID
    { wch: 18 }, // Player 4 Name
    { wch: 16 }, // Player 4 UID
    { wch: 22 }, // Player 5 (Substitute) Name
    { wch: 16 }, // Player 5 (Substitute) UID
    { wch: 38 }, // Contact
    { wch: 24 }, // Registered At
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

/**
 * Escapes a single CSV value following RFC 4180
 */
function escapeCsvValue(val: string): string {
  if (val.includes('"') || val.includes(",") || val.includes("\n") || val.includes("\r")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return `"${val}"`; // Wrap all values in quotes to guarantee text treatment in spreadsheet software
}

/**
 * Generates a UTF-8 CSV string with BOM (\uFEFF) for regional language and emoji preservation
 */
export function generateCsvExport(registrations: TournamentRegistration[]): string {
  const headerLine = EXPORT_HEADERS.map(escapeCsvValue).join(",");
  const dataLines = registrations.map((reg) => {
    const row = mapRegistrationToExportRow(reg);
    return row.map(escapeCsvValue).join(",");
  });

  // \uFEFF is the UTF-8 Byte Order Mark (BOM) needed by Excel to render UTF-8 (Hindi, Kannada, Emojis)
  return "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
}
