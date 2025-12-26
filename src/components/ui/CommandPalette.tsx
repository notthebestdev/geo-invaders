/* eslint-disable react-hooks/refs */
"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

interface CommandPaletteProps {
    geojsonRef: React.MutableRefObject<
        GeoJSON.Feature<
            GeoJSON.Point,
            { id: string; status: string; instagramUrl?: string }
        >[]
    >;
    onSelectFeature: (
        feature: GeoJSON.Feature<
            GeoJSON.Point,
            { id: string; status: string; instagramUrl?: string }
        >,
    ) => void;
    mapContainer: React.RefObject<HTMLDivElement | null>;
}

const numericNormalize = (s: string) => s.replace(/_0+(\d+)/g, "_$1");

const normalize = (s?: string) =>
    (s || "")
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\u00A0/g, " ")
        .replace(/[\u200B-\u200F\u2060\uFEFF]/g, "")
        .replace(/\s+/g, " ")
        .toLocaleLowerCase();

export function CommandPalette({
    geojsonRef,
    onSelectFeature,
    mapContainer,
}: CommandPaletteProps) {
    const [cmdOpen, setCmdOpen] = useState(false);
    const [cmdQuery, setCmdQuery] = useState("");
    const [normalizedQuery, setNormalizedQuery] = useState("");

    // Long press detection
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

    // Keyboard shortcut handler
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCmdOpen((o) => !o);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    // Long press handler
    useEffect(() => {
        const container = mapContainer.current;
        if (!container) return;

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length !== 1) return;
            const touch = e.touches[0];
            touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

            longPressTimerRef.current = setTimeout(() => {
                setCmdOpen(true);
            }, 1000);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!touchStartPosRef.current || e.touches.length !== 1) {
                if (longPressTimerRef.current) {
                    clearTimeout(longPressTimerRef.current);
                    longPressTimerRef.current = null;
                }
                return;
            }

            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x);
            const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y);

            // Cancel long press if user moves more than 10px
            if (deltaX > 10 || deltaY > 10) {
                if (longPressTimerRef.current) {
                    clearTimeout(longPressTimerRef.current);
                    longPressTimerRef.current = null;
                }
            }
        };

        const handleTouchEnd = () => {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }
            touchStartPosRef.current = null;
        };

        container.addEventListener("touchstart", handleTouchStart);
        container.addEventListener("touchmove", handleTouchMove);
        container.addEventListener("touchend", handleTouchEnd);
        container.addEventListener("touchcancel", handleTouchEnd);

        return () => {
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchmove", handleTouchMove);
            container.removeEventListener("touchend", handleTouchEnd);
            container.removeEventListener("touchcancel", handleTouchEnd);
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
            }
        };
    }, [mapContainer]);

    return (
        <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
            <CommandInput
                placeholder="Search invaders by id..."
                value={cmdQuery}
                onValueChange={(v: string) => {
                    const trimmed = v.slice(0, 100); // Limit to 100 characters
                    setCmdQuery(trimmed);
                    setNormalizedQuery(normalize(trimmed));
                }}
            />
            <CommandList>
                <CommandEmpty>No invaders found.</CommandEmpty>
                <CommandGroup heading="Invaders">
                    {geojsonRef.current
                        .filter((f) => {
                            const rawId = f?.properties?.id;
                            if (!rawId) return false;
                            const q = normalizedQuery;
                            if (!q) return true;

                            const id = normalize(rawId);
                            const fallbackId = normalize(
                                rawId.replace(/_\d+$/, ""),
                            );

                            const qNorm = numericNormalize(q);
                            const idNorm = numericNormalize(id);
                            const fallbackNorm = numericNormalize(fallbackId);

                            return (
                                id.includes(q) ||
                                idNorm.includes(qNorm) ||
                                fallbackId.includes(q) ||
                                fallbackNorm.includes(qNorm)
                            );
                        })
                        .slice(0, 50) // limit results
                        .map((f) => (
                            <CommandItem
                                key={f.properties.id}
                                value={f.properties.id}
                                onSelect={() => {
                                    onSelectFeature(f);
                                    setCmdOpen(false);
                                    setCmdQuery("");
                                    setNormalizedQuery("");
                                }}
                            >
                                <Search className="mr-2" aria-hidden="true" />
                                <span>{f.properties.id}</span>
                            </CommandItem>
                        ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
