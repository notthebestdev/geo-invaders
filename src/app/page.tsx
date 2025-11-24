"use client";
import { useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

// Added imports for the command/search palette
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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

  // New: state for command dialog and input
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");

  // New: keyboard shortcut to toggle command dialog (Cmd/Ctrl+J)
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

  // Helper to open popup + center map for a given feature
  const openFeatureOnMap = (feature: GeoJSON.Feature<
    GeoJSON.Point,
    { id: string; status: string; instagramUrl?: string }
  >) => {
    const map = mapRef.current;
    if (!map) return;
    const coords = feature.geometry.coordinates as [number, number];
    const { id, instagramUrl } = feature.properties;
    const githubUrl = `https://raw.githubusercontent.com/CAAAB/download_files/refs/heads/main/images/${id}.png`;
    const fallbackId = id.replace(/_\d+$/, "");
    const fallbackUrl = `https://www.invader-spotter.art/grosplan/${fallbackId}/${id}-grosplan.png`;
    const instagramIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram-icon lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`;

    // center & zoom
    map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 14) });

    // show popup
    new maplibregl.Popup()
      .setLngLat(coords)
      .setHTML(
        `<div style="text-align:center;">
          <div style="font-weight:bold; color:#000;">${id}</div>
          <img src="${githubUrl}" alt="${id}" style="max-width:200px;max-height:200px;margin-top:8px;"
            onerror="this.onerror=null;this.src='${fallbackUrl}';"
          />
          ${
            instagramUrl
              ? `<a href='${instagramUrl}' target='_blank' rel='noopener noreferrer' style='display:inline-block;margin-top:10px;color:#E1306C;' title='View on Instagram'>${instagramIcon}</a>`
              : ""
          }
        </div>`,
      )
      .addTo(map);
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
              invader.obf_lat && invader.obf_lng && invader.status !== "hidden",
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
                { id: string; status: string; instagramUrl?: string }
              >,
            ) => {
              if (hideDamaged && feature.properties.status === "damaged")
                return false;
              if (hideDestroyed && feature.properties.status === "destroyed")
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
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
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
            const geometry = e.features[0].geometry as GeoJSON.Point;
            const coordinates = geometry.coordinates.slice() as [
              number,
              number,
            ];
            const { id, instagramUrl } = e.features[0].properties;
            const githubUrl = `https://raw.githubusercontent.com/CAAAB/download_files/refs/heads/main/images/${id}.png`;
            const fallbackId = id.replace(/_\d+$/, "");
            const fallbackUrl = `https://www.invader-spotter.art/grosplan/${fallbackId}/${id}-grosplan.png`;

            const instagramIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram-icon lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`;
            new maplibregl.Popup()
              .setLngLat(coordinates)
              .setHTML(
                `<div style="text-align:center;">
                  <div style="font-weight:bold; color:#000;">${id}</div>
                  <img src="${githubUrl}" alt="${id}" style="max-width:200px;max-height:200px;margin-top:8px;"
                    onerror="this.onerror=null;this.src='${fallbackUrl}';"
                  />
                  ${
                    instagramUrl
                      ? `<a href='${instagramUrl}' target='_blank' rel='noopener noreferrer' style='display:inline-block;margin-top:10px;color:#E1306C;' title='View on Instagram'>${instagramIcon}</a>`
                      : ""
                  }
                </div>`,
              )
              .addTo(map);
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
            const zoom = await source.getClusterExpansionZoom(clusterId);
            // Typecast geometry to Point to access coordinates
            const coordinates = (features[0].geometry as GeoJSON.Point)
              .coordinates as [number, number];
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
  }, [hideDamaged, hideDestroyed]);

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
          if (hideDestroyed && feature.properties.status === "destroyed")
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
          <PopoverContent side="bottom" align="end" className="w-[260px] p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium">Settings</div>
                <div className="text-xs text-muted-foreground">
                  Filter invaders on the map
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="text-sm">Hide Damaged Invaders</div>
                  <Switch
                    checked={hideDamaged}
                    onCheckedChange={(v) => setHideDamaged(Boolean(v))}
                  />
                </label>
                <div className="text-xs text-muted-foreground mt-1">
                  Removes invaders marked as "damaged" from the map to reduce
                  visual clutter while keeping intact ones visible.
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="text-sm">Hide Destroyed Invaders</div>
                  <Switch
                    checked={hideDestroyed}
                    onCheckedChange={(v) => setHideDestroyed(Boolean(v))}
                  />
                </label>
                <div className="text-xs text-muted-foreground mt-1">
                  Hides invaders that are recorded as "destroyed" so you can
                  focus on current, intact pieces.
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Command / Search dialog (hidden shortcut: Cmd/Ctrl+J) */}
      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput
          placeholder="Search invaders by id..."
          value={cmdQuery}
          onValueChange={(v: string) => setCmdQuery(v)}
        />
        <CommandList>
          <CommandEmpty>No invaders found.</CommandEmpty>
          <CommandGroup heading="Invaders">
            {geojsonRef.current
              .filter((f) =>
                f.properties.id
                  .toLowerCase()
                  .includes(cmdQuery.trim().toLowerCase()),
              )
              .slice(0, 50) // limit results
              .map((f) => (
                <CommandItem
                  key={f.properties.id}
                  onSelect={() => {
                    openFeatureOnMap(f);
                    setCmdOpen(false);
                    setCmdQuery("");
                  }}
                >
                  <Search className="mr-2" />
                  <span>{f.properties.id}</span>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
