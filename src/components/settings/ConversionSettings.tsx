import { FormatSelector } from "./FormatSelector";
import { QualitySlider } from "./QualitySlider";
import { MetadataToggle } from "./MetadataToggle";
import { ResizeSetting } from "./ResizeSetting";
import { AspectRatioSelector } from "./AspectRatioSelector";
import { OutputDirectory } from "./OutputDirectory";

export function ConversionSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-white/70">Settings</h2>
      <FormatSelector />
      <QualitySlider />
      <ResizeSetting />
      <AspectRatioSelector />
      <MetadataToggle />
      <OutputDirectory />
    </div>
  );
}
