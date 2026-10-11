import { NumberInput } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Settings2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { PracticeController } from "../../hooks/useNumberPractice";

type RangeSettingsProps = Pick<
  PracticeController,
  | "handleCompositionUpdate"
  | "dismissKeyboardHint"
  | "mode"
  | "tempMin"
  | "tempMax"
  | "setTempMin"
  | "setTempMax"
  | "handleRangeInput"
  | "handleUpdateRange"
>;

export const RangeSettings = ({
  mode,
  tempMin,
  tempMax,
  setTempMin,
  setTempMax,
  handleRangeInput,
  handleUpdateRange,
  handleCompositionUpdate,
  dismissKeyboardHint,
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
      className="grid grid-cols-1 md:flex items-center gap-4 md:gap-3"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 md:gap-2 min-w-0 md:flex md:flex-1 md:justify-center">
        <NumberInput
          onCompositionUpdate={handleCompositionUpdate}
          onBlur={dismissKeyboardHint}
          variant="range"
          aria-label="Minimum practice number"
          value={tempMin}
          onChange={handleRangeInput(setTempMin)}
          className="md:w-20 md:justify-self-center"
        />
        <span className="text-app-dark/30 text-xs font-bold">to</span>
        <NumberInput
          onCompositionUpdate={handleCompositionUpdate}
          onBlur={dismissKeyboardHint}
          variant="range"
          aria-label="Maximum practice number"
          value={tempMax}
          onChange={handleRangeInput(setTempMax)}
          className="md:w-20 md:justify-self-center"
        />
      </div>
      <Button
        variant="update"
        onClick={handleUpdateRange}
        className="flex items-center justify-center gap-2"
      >
        <Settings2 size={16} aria-hidden="true" />
        Update Range
      </Button>
    </Card>
  </fieldset>
);
