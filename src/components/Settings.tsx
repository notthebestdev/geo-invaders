"use client";

import { Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { APP_VERSION, SERVER_MODE } from "@/lib/version";

interface SettingsProps {
    hideDamaged: boolean;
    hideDestroyed: boolean;
    onHideDamagedChange: (value: boolean) => void;
    onHideDestroyedChange: (value: boolean) => void;
}

export function Settings({
    hideDamaged,
    hideDestroyed,
    onHideDamagedChange,
    onHideDestroyedChange,
}: SettingsProps) {
    return (
        <div className="fixed top-4 right-4 z-50">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <SettingsIcon size={18} />
                        <span className="sr-only">Open settings</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="end" className="w-65 p-4">
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
                                <div className="text-sm">
                                    Hide Damaged Invaders
                                </div>
                                <Switch
                                    checked={hideDamaged}
                                    onCheckedChange={(v) =>
                                        onHideDamagedChange(Boolean(v))
                                    }
                                />
                            </label>
                            <div className="text-xs text-muted-foreground mt-1">
                                Removes invaders marked as &quot;damaged&quot;
                                from the map to reduce visual clutter while
                                keeping intact ones visible.
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
                                        onHideDestroyedChange(Boolean(v))
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

                    <div className="mt-4 pt-3 border-t border-border">
                        <div className="text-xs text-muted-foreground text-center">
                            v{APP_VERSION} •{" "}
                            {SERVER_MODE === "development"
                                ? "Development"
                                : "Production"}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
