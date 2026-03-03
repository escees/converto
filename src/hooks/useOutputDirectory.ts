import { useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { useConversionStore } from "../stores/conversionStore";

export function useOutputDirectory() {
  const outputDirectory = useConversionStore(
    (s) => s.settings.outputDirectory
  );
  const setOutputDirectory = useConversionStore((s) => s.setOutputDirectory);

  const pickDirectory = useCallback(async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select Output Directory",
    });

    if (selected && typeof selected === "string") {
      setOutputDirectory(selected);
    }
  }, [setOutputDirectory]);

  return { outputDirectory, pickDirectory };
}
