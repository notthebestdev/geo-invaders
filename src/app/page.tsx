"use client";
import { Settings } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

import { Search } from "lucide-react";
import maplibregl from "maplibre-gl";
import { siInstagram } from "simple-icons";
import { Button } from "@/components/ui/button";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

const INSTAGRAM_ICON = `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#FF0069"><path d="${siInstagram.path}"/></svg>`;

function getInitialView() {
    if (typeof window === "undefined")
        return { lng: 2.3522, lat: 48.8566, zoom: 10 };
    const params = new URLSearchParams(window.location.search);
    const lng = parseFloat(params.get("lng") || "2.3522");
    const lat = parseFloat(params.get("lat") || "48.8566");
    const zoom = parseFloat(params.get("zoom") || "10");
    return { lng, lat, zoom };
}

export default function Home() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const [hideDamaged, setHideDamaged] = useState(false);
    const [hideDestroyed, setHideDestroyed] = useState(false);

    // Store map instance and source for updates
    const mapRef = useRef<maplibregl.Map | null>(null);
    const geojsonRef = useRef<
        GeoJSON.Feature<
            GeoJSON.Point,
            { id: string; status: string; instagramUrl?: string }
        >[]
    >([]);

    const [cmdOpen, setCmdOpen] = useState(false);
    const [cmdQuery, setCmdQuery] = useState("");
    const [normalizedQuery, setNormalizedQuery] = useState("");

    // Long press detection
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

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
    }, []);

    const createInvaderPopup = useCallback(
        (id: string, coords: [number, number], instagramUrl?: string) => {
            const githubUrl = `https://raw.githubusercontent.com/CAAAB/download_files/refs/heads/main/images/${id}.png`;
            const fallbackId = id.replace(/_\d+$/, "");
            const fallbackUrl = `https://www.invader-spotter.art/grosplan/${fallbackId}/${id}-grosplan.png`;

            return new maplibregl.Popup().setLngLat(coords).setHTML(
                `<div style="text-align:center;">
              <div style="font-weight:bold; color:#000;">${id}</div>
              <img src="${githubUrl}" alt="${id}" style="max-width:200px;max-height:200px;margin-top:8px;"
                onerror="this.onerror=null;this.src='${fallbackUrl}';"
              />
              ${
                  instagramUrl
                      ? `<a href='${instagramUrl}' target='_blank' rel='noopener noreferrer' style='display:inline-block;margin-top:10px;color:#FF0069;' title='View on Instagram'>${INSTAGRAM_ICON}</a>`
                      : ""
              }
            </div>`,
            );
        },
        [],
    );

    const openFeatureOnMap = (
        feature: GeoJSON.Feature<
            GeoJSON.Point,
            { id: string; status: string; instagramUrl?: string }
        >,
    ) => {
        const map = mapRef.current;
        if (!map) return;
        const coords = feature.geometry.coordinates as [number, number];
        const { id, instagramUrl } = feature.properties;

        // Close all existing popups
        const popups = document.getElementsByClassName("maplibregl-popup");
        if (popups.length) {
            Array.from(popups).forEach((popup) => popup.remove());
        }

        map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 14) });
        createInvaderPopup(id, coords, instagramUrl).addTo(map);
    };

    useEffect(() => {
        if (!mapContainer.current) return;

        const initialView = getInitialView();

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
            center: [initialView.lng, initialView.lat],
            zoom: initialView.zoom,
        });
        mapRef.current = map;

        // Update URL on moveend
        map.on("moveend", () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            const params = new URLSearchParams(window.location.search);
            params.set("lng", center.lng.toFixed(5));
            params.set("lat", center.lat.toFixed(5));
            params.set("zoom", zoom.toFixed(2));
            window.history.replaceState(
                {},
                "",
                `${window.location.pathname}?${params.toString()}`,
            );
        });

        fetch(
            "https://corsproxy.io/?url=https://pnote.eu/projects/invaders/map/invaders.json",
        )
            .then((res) => res.json())
            .then((data) => {
                type Invader = {
                    id: string;
                    status: string;
                    instagramUrl?: string;
                    obf_lat: number;
                    obf_lng: number;
                };

                geojsonRef.current = (data as Invader[])
                    .filter(
                        (invader: Invader) =>
                            invader.obf_lat &&
                            invader.obf_lng &&
                            invader.status !== "hidden",
                    )
                    .map((invader: Invader) => ({
                        type: "Feature",
                        properties: {
                            id: invader.id,
                            status: invader.status,
                            instagramUrl: invader.instagramUrl,
                        },
                        geometry: {
                            type: "Point",
                            coordinates: [invader.obf_lng, invader.obf_lat],
                        },
                    }));

                const makeGeoJSON = (): GeoJSON.FeatureCollection<
                    GeoJSON.Point,
                    { id: string; status: string; instagramUrl?: string }
                > => ({
                    type: "FeatureCollection" as const,
                    features: geojsonRef.current.filter(
                        (
                            feature: GeoJSON.Feature<
                                GeoJSON.Point,
                                {
                                    id: string;
                                    status: string;
                                    instagramUrl?: string;
                                }
                            >,
                        ) => {
                            if (
                                hideDamaged &&
                                feature.properties.status === "damaged"
                            )
                                return false;
                            if (
                                hideDestroyed &&
                                feature.properties.status === "destroyed"
                            )
                                return false;
                            return true;
                        },
                    ),
                });

                map.on("load", () => {
                    map.addSource("invaders", {
                        type: "geojson",
                        data: makeGeoJSON(),
                        cluster: true,
                        clusterMaxZoom: 12,
                        clusterRadius: 30,
                    });

                    // Cluster circles
                    map.addLayer({
                        id: "clusters",
                        type: "circle",
                        source: "invaders",
                        filter: ["has", "point_count"],
                        paint: {
                            "circle-color": "#51bbd6",
                            "circle-radius": [
                                "step",
                                ["get", "point_count"],
                                20,
                                100,
                                30,
                                750,
                                40,
                            ],
                            "circle-stroke-width": 2,
                            "circle-stroke-color": "#fff",
                        },
                    });

                    // Cluster count labels
                    map.addLayer({
                        id: "cluster-count",
                        type: "symbol",
                        source: "invaders",
                        filter: ["has", "point_count"],
                        layout: {
                            "text-field": "{point_count_abbreviated}",
                            "text-font": [
                                "Open Sans Bold",
                                "Arial Unicode MS Bold",
                            ],
                            "text-size": 14,
                        },
                        paint: {
                            "text-color": "#fff",
                        },
                    });

                    // Unclustered points
                    map.addLayer({
                        id: "unclustered-point",
                        type: "circle",
                        source: "invaders",
                        filter: ["!", ["has", "point_count"]],
                        paint: {
                            "circle-color": [
                                "match",
                                ["get", "status"],
                                "OK",
                                "#2ecc40", // green
                                "damaged",
                                "#ffe066", // yellow
                                "destroyed",
                                "#ff4136", // red
                                "#cccccc", // fallback
                            ],
                            "circle-radius": 10,
                            "circle-stroke-width": 1,
                            "circle-stroke-color": "#fff",
                        },
                    });

                    // Popup on click
                    map.on("click", "unclustered-point", (e) => {
                        if (!e.features || e.features.length === 0) return;
                        const geometry = e.features[0]
                            .geometry as GeoJSON.Point;
                        const coordinates = geometry.coordinates.slice() as [
                            number,
                            number,
                        ];
                        const { id, instagramUrl } = e.features[0].properties;
                        createInvaderPopup(id, coordinates, instagramUrl).addTo(
                            map,
                        );
                    });

                    // Zoom into cluster on click
                    map.on("click", "clusters", async (e) => {
                        const features = map.queryRenderedFeatures(e.point, {
                            layers: ["clusters"],
                        });
                        const clusterId = features[0].properties.cluster_id;
                        const source = map.getSource(
                            "invaders",
                        ) as maplibregl.GeoJSONSource;
                        const zoom =
                            await source.getClusterExpansionZoom(clusterId);
                        // Typecast geometry to Point to access coordinates
                        const coordinates = (
                            features[0].geometry as GeoJSON.Point
                        ).coordinates as [number, number];
                        map.easeTo({
                            center: coordinates,
                            zoom,
                        });
                    });

                    // Change cursor on hover
                    map.on("mouseenter", "clusters", () => {
                        map.getCanvas().style.cursor = "pointer";
                    });
                    map.on("mouseleave", "clusters", () => {
                        map.getCanvas().style.cursor = "";
                    });
                });
            });

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [hideDamaged, hideDestroyed, createInvaderPopup]);

    // Update invaders source when toggles change
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        const source = map.getSource("invaders") as maplibregl.GeoJSONSource;
        if (!source || !geojsonRef.current) return;
        const filteredGeoJSON: GeoJSON.FeatureCollection<
            GeoJSON.Point,
            { id: string; status: string; instagramUrl?: string }
        > = {
            type: "FeatureCollection",
            features: geojsonRef.current.filter(
                (
                    feature: GeoJSON.Feature<
                        GeoJSON.Point,
                        { id: string; status: string; instagramUrl?: string }
                    >,
                ) => {
                    if (hideDamaged && feature.properties.status === "damaged")
                        return false;
                    if (
                        hideDestroyed &&
                        feature.properties.status === "destroyed"
                    )
                        return false;
                    return true;
                },
            ),
        };
        source.setData(filteredGeoJSON);
    }, [hideDamaged, hideDestroyed]);

    return (
        <>
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
                />
            </head>
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    width: "100vw",
                    height: "100vh",
                    overflow: "hidden",
                    touchAction: "none",
                }}
            >
                <div
                    ref={mapContainer}
                    style={{
                        width: "100%",
                        height: "100%",
                        touchAction: "none",
                    }}
                />
            </div>

            {/* Settings menu using shadcn Popover */}
            <div className="fixed top-4 right-4 z-50">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <Settings size={18} />
                            <span className="sr-only">Open settings</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        side="bottom"
                        align="end"
                        className="w-[260px] p-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <div className="text-sm font-medium">
                                    Settings
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Filter invaders on the map
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="text-sm">
                                        Hide Damaged Invaders
                                    </div>
                                    <Switch
                                        checked={hideDamaged}
                                        onCheckedChange={(v) =>
                                            setHideDamaged(Boolean(v))
                                        }
                                    />
                                </label>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Removes invaders marked as
                                    &quot;damaged&quot; from the map to reduce
                                    visual clutter while keeping intact ones
                                    visible.
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="text-sm">
                                        Hide Destroyed Invaders
                                    </div>
                                    <Switch
                                        checked={hideDestroyed}
                                        onCheckedChange={(v) =>
                                            setHideDestroyed(Boolean(v))
                                        }
                                    />
                                </label>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Hides invaders that are recorded as
                                    &quot;destroyed&quot; so you can focus on
                                    current, intact pieces.
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Command Palette for searching invaders */}
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
                                const fallbackNorm =
                                    numericNormalize(fallbackId);

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
                                        openFeatureOnMap(f);
                                        setCmdOpen(false);
                                        setCmdQuery("");
                                        setNormalizedQuery("");
                                    }}
                                >
                                    <Search
                                        className="mr-2"
                                        aria-hidden="true"
                                    />
                                    <span>{f.properties.id}</span>
                                </CommandItem>
                            ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
