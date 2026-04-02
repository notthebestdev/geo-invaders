import { describe, expect, it } from "vitest";
import { normalize, numericNormalize } from "@/lib/search-utils";

describe("numericNormalize", () => {
    it("removes leading zeros after underscore", () => {
        expect(numericNormalize("PA_0012")).toBe("PA_12");
    });

    it("does not change ids without numeric suffix padding", () => {
        expect(numericNormalize("PA_12")).toBe("PA_12");
    });
});

describe("normalize", () => {
    it("trims, lowercases, and collapses whitespace", () => {
        expect(normalize("  PA   0012  ")).toBe("pa 0012");
    });

    it("removes accents and zero-width characters", () => {
        expect(normalize("Caf\u00E9\u200B")).toBe("cafe");
    });

    it("returns empty string for undefined", () => {
        expect(normalize(undefined)).toBe("");
    });
});
