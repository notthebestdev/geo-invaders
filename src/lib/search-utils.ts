export const numericNormalize = (s: string) => s.replace(/_0+(\d+)/g, "_$1");

export const normalize = (s?: string) =>
    (s || "")
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\u00A0/g, " ")
        .replace(/[\u200B-\u200F\u2060\uFEFF]/g, "")
        .replace(/\s+/g, " ")
        .toLocaleLowerCase();