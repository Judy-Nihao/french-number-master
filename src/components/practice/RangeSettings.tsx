import { NumberInput } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Settings2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { PracticeController } from "../../hooks/useNumberPractice";

type RangeSettingsProps = Pick<
  PracticeController,
  | "mode"
  | "minRange"
  | "maxRange"
  | "tempMin"
  | "tempMax"
  | "setTempMin"
  | "setTempMax"
  | "handleRangeInput"
  | "handleUpdateRange"
>;

export const RangeSettings = ({
  mode,
  minRange,
  maxRange,
  tempMin,
  tempMax,
  setTempMin,
  setTempMax,
  handleRangeInput,
  handleUpdateRange,
}: RangeSettingsProps) => (
  <fieldset
    disabled={mode === "lookup"}
    aria-label="Practice range"
    className={cn(
      "min-w-0 border-0 p-0 transition-opacity",
      mode === "lookup" && "grayscale opacity-60",
    )}
  >
    <Card
      variant="range"
      className="grid grid-cols-1 sm:flex items-center gap-4 sm:gap-3"
    >
      <div className="flex items-center justify-center sm:justify-start gap-2 sm:shrink-0 sm:pl-2">
        <Settings2 size={18} className="text-app-dark/70" />
        <span className="text-xs font-bold text-app-dark/60 uppercase tracking-wider">
          Range
        </span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 sm:gap-2 min-w-0 sm:flex sm:flex-1 sm:justify-center">
        <NumberInput
          variant="range"
          aria-label="Minimum practice number"
          value={tempMin}
          onChange={handleRangeInput(setTempMin)}
          className="sm:w-20 sm:justify-self-center"
        />
        <span className="text-app-dark/30 text-xs font-bold">to</span>
        <NumberInput
          variant="range"
          aria-label="Maximum practice number"
          value={tempMax}
          onChange={handleRangeInput(setTempMax)}
          className="sm:w-20 sm:justify-self-center"
        />
      </div>
      <Button variant="update" onClick={handleUpdateRange}>
        Update
      </Button>
    </Card>
    <p
      aria-hidden={
        mode === "lookup" ||
        (minRange === Number(tempMin) && maxRange === Number(tempMax))
      }
      className={cn(
        "text-[10px] text-app-dark/70 mt-2 font-bold text-center h-4",
        mode === "test" &&
          (minRange !== Number(tempMin) || maxRange !== Number(tempMax))
          ? "animate-bounce"
          : "invisible",
      )}
    >
      Don't forget to update!
    </p>
  </fieldset>
);
