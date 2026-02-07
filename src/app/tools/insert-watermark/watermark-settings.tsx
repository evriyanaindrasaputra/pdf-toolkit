import * as React from "react"
import { Settings, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface WatermarkSettingsProps {
  watermarkType: "text" | "image"
  setWatermarkType: (type: "text" | "image") => void
  text: string
  setText: (text: string) => void
  color: string
  setColor: (color: string) => void
  opacity: number
  setOpacity: (opacity: number) => void
  rotation: number
  setRotation: (rotation: number) => void
  size: number
  setSize: (size: number) => void
  applyToAll: boolean
  setApplyToAll: (apply: boolean) => void
  imageFile: File | null
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSave: () => void
  isProcessing: boolean
}

export function WatermarkSettings({
  watermarkType,
  setWatermarkType,
  text,
  setText,
  color,
  setColor,
  opacity,
  setOpacity,
  rotation,
  setRotation,
  size,
  setSize,
  applyToAll,
  setApplyToAll,
  imageFile,
  handleImageUpload,
  handleSave,
  isProcessing
}: WatermarkSettingsProps) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 font-semibold">
          <Settings className="h-4 w-4" />
          Settings
        </div>

        <Tabs defaultValue="text" value={watermarkType} onValueChange={(v) => setWatermarkType(v as "text" | "image")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label>Watermark Text</Label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="CONFIDENTIAL"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <div className="space-y-2">
              <Label>Upload Image</Label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer min-w-0">
                  <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 items-center gap-2 text-muted-foreground hover:bg-muted/50">
                    <Upload className="h-4 w-4 shrink-0" />
                    <span className="truncate min-w-0 block flex-1 text-left">
                      {imageFile ? imageFile.name : "Select Image..."}
                    </span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Size ({watermarkType === "image" ? "Width" : "Font"})</Label>
            <span className="text-xs text-muted-foreground">{size}px</span>
          </div>
          <Slider
            min={10}
            max={500}
            step={1}
            value={[size]}
            onValueChange={([v]) => setSize(v)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Opacity</Label>
            <span className="text-xs text-muted-foreground">{Math.round(opacity * 100)}%</span>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={[opacity]}
            onValueChange={([v]) => setOpacity(v)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Rotation</Label>
            <span className="text-xs text-muted-foreground">{rotation}°</span>
          </div>
          <Slider
            min={0}
            max={360}
            step={15}
            value={[rotation]}
            onValueChange={([v]) => setRotation(v)}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="all-pages">Apply to all pages</Label>
          <Switch id="all-pages" checked={applyToAll} onCheckedChange={setApplyToAll} />
        </div>

        <Button
          className="w-full mt-4"
          size="lg"
          onClick={handleSave}
          disabled={isProcessing || (watermarkType === "image" && !imageFile)}
        >
          {isProcessing ? "Saving..." : "Apply Watermark"}
        </Button>
      </CardContent>
    </Card>
  )
}
