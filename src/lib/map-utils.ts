export type MapView = { lng: number; lat: number; zoom: number };

export function isValidMapView(view: Partial<MapView>): view is MapView {
    const { lng, lat, zoom } = view;

    return (
        typeof lng === "number" &&
        typeof lat === "number" &&
        typeof zoom === "number" &&
        Number.isFinite(lng) &&
        Number.isFinite(lat) &&
        Number.isFinite(zoom) &&
        Math.abs(lng) <= 180 &&
        Math.abs(lat) <= 90 &&
        zoom >= 0 &&
        zoom <= 22
    );
}

export function getMapStyleUrl(isDark: boolean, apiKey: string): string {
    const style = isDark ? "streets-v4-dark" : "streets-v4";
    return `https://api.maptiler.com/maps/${style}/style.json?key=${apiKey}`;
}
