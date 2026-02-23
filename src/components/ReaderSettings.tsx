import { useState, useEffect } from "react";
import { Minus, Plus, Settings, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface ReaderSettingsProps {
  fontSize: number;
  setFontSize: (size: number) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  theme: 'light' | 'sepia' | 'dark';
  setTheme: (theme: 'light' | 'sepia' | 'dark') => void;
  isAutoScrolling: boolean;
  setIsAutoScrolling: (v: boolean) => void;
  autoScrollSpeed: number;
  setAutoScrollSpeed: (speed: number) => void;
}

const ReaderSettings = ({
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  theme,
  setTheme,
  isAutoScrolling,
  setIsAutoScrolling,
  autoScrollSpeed,
  setAutoScrollSpeed,
}: ReaderSettingsProps) => {
  const [localSpeed, setLocalSpeed] = useState(autoScrollSpeed);

  useEffect(() => {
    setLocalSpeed(autoScrollSpeed);
  }, [autoScrollSpeed]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Appearance</h4>
            <p className="text-sm text-muted-foreground">
              Customize your reading experience
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Font Size</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setFontSize(Math.max(12, fontSize - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <div className="flex-1 text-center text-sm font-medium">
                {fontSize}px
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setFontSize(Math.min(32, fontSize + 1))}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Font Family</Label>
            <div className="flex gap-2">
              <Button
                variant={fontFamily === 'sans' ? "default" : "outline"}
                size="sm"
                className="flex-1 font-sans"
                onClick={() => setFontFamily('sans')}
              >
                Sans
              </Button>
              <Button
                variant={fontFamily === 'serif' ? "default" : "outline"}
                size="sm"
                className="flex-1 font-serif"
                onClick={() => setFontFamily('serif')}
              >
                Serif
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? "default" : "outline"}
                size="sm"
                className="flex-1 bg-white text-black border-slate-200 hover:bg-slate-50 hover:text-black"
                onClick={() => setTheme('light')}
              >
                Light
              </Button>
              <Button
                variant={theme === 'sepia' ? "default" : "outline"}
                size="sm"
                className="flex-1 bg-[#f4ecd8] text-[#5b4636] border-[#e3d7bf] hover:bg-[#e9dfc6] hover:text-[#5b4636]"
                onClick={() => setTheme('sepia')}
              >
                Sepia
              </Button>
              <Button
                variant={theme === 'dark' ? "default" : "outline"}
                size="sm"
                className="flex-1 bg-slate-900 text-white border-slate-800 hover:bg-slate-800 hover:text-white"
                onClick={() => setTheme('dark')}
              >
                Dark
              </Button>
            </div>
          </div>

          {/* Autoscroll Section - Di-hide sementara sesuai permintaan */}
          {/* <div className="border-t border-border pt-4">
            <div className="space-y-2 mb-3">
              <h4 className="font-medium leading-none">Autoscroll</h4>
              <p className="text-sm text-muted-foreground">
                Scroll page automatically
              </p>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label>Status</Label>
                <Button
                  variant={isAutoScrolling ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                >
                  {isAutoScrolling ? (
                    <>
                      <Pause className="h-3 w-3" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" /> Play
                    </>
                  )}
                </Button>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Speed</Label>
                  <span className="text-sm font-medium text-muted-foreground">
                    {localSpeed.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  value={[localSpeed]}
                  onValueChange={(v) => setLocalSpeed(v[0])}
                  onValueCommit={(v) => setAutoScrollSpeed(v[0])}
                  min={0.5}
                  max={7.5}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5x</span>
                  <span>5.0x</span>
                  <span>7.5x</span>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReaderSettings;
