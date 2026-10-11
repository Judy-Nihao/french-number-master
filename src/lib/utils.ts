import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Register semantic dimensions so color overrides preserve border widths and shadows.
const mergeClasses = extendTailwindMerge({
  extend: {
    classGroups: {
      "border-w": ["border-control", "border-surface"],
      "border-w-t": ["border-t-surface"],
      shadow: [
        {
          shadow: [
            "elevation-subtle",
            "elevation-control",
            "elevation-action",
            "elevation-panel",
          ],
        },
      ],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => mergeClasses(clsx(inputs));
