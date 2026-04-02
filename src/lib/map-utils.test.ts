import { describe, expect, it } from "vitest";
import { getMapStyleUrl, isValidMapView } from "@/lib/map-utils";

describe("isValidMapView", () => {
    it("returns true for valid coordinates and zoom", () => {
        expect(isValidMapView({ lng: 2.35, lat: 48.85, zoom: 10 })).toBe(true);
    });

    it("returns false when latitude is out of range", () => {
        expect(isValidMapView({ lng: 2.35, lat: 95, zoom: 10 })).toBe(false);
    });

    it("returns false when zoom is out of range", () => {
        expect(isValidMapView({ lng: 2.35, lat: 48.85, zoom: 30 })).toBe(false);
    });

    it("returns false when values are missing or non-numeric", () => {
        expect(isValidMapView({})).toBe(false);
        expect(
            isValidMapView({ lng: Number.NaN, lat: 48.85, zoom: 10 }),
        ).toBe(false);
    });
});