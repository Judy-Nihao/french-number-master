import { NumberInput } from "../ui/Input";
import { Card } from "../ui/Card";
import { PronunciationButton } from "./PronunciationButton";
import { Search } from "lucide-react";
import type { PracticeController } from "../../hooks/useNumberPractice";

type LookupPanelProps = Pick<
  PracticeController,
  | "lookupValue"
  | "handleLookup"
  | "lookupResult"
  | "playLookupAudio"
  | "handleCompositionUpdate"
  | "dismissKeyboardHint"
  | "isPlaying"
>;

export const LookupPanel = ({
  lookupValue,
  handleLookup,
  lookupResult,
  playLookupAudio,
  isPlaying,
  handleCompositionUpdate,
  dismissKeyboardHint,
}: LookupPanelProps) => (
  <div
    id="lookup-panel"
    role="tabpanel"
    aria-labelledby="lookup-tab"
    tabIndex={0}
    className="flex flex-col gap-6 p-8 py-10"
  >
    <h2 className="text-center text-xl font-bold text-app-dark">
      Number → French
    </h2>
    <div className="relative">
      <NumberInput
        onCompositionUpdate={handleCompositionUpdate}
        onBlur={dismissKeyboardHint}
        id="lookup-number"
        aria-label="Enter a number"
        value={lookupValue}
        onChange={handleLookup}
        placeholder="Enter any number..."
        className="pr-12"
      />
      <Search
        size={20}
        aria-hidden="true"
        className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-app-dark/35"
      />
    </div>
    {lookupResult && (
      <Card variant="lookupResult" aria-live="polite">
        <div className="flex justify-between items-center gap-3">
          <div className="min-w-0 flex-1 flex flex-col gap-2">
            <div className="text-xl font-bold text-app-dark wrap-break-word">
              {lookupResult.word}
            </div>
            {lookupResult.ipa && (
              <div className="text-sm text-app-dark/80 wrap-break-word">
                {lookupResult.ipa}
              </div>
            )}
          </div>
          {lookupResult.ipa && (
            <PronunciationButton
              variant="lookup"
              onClick={playLookupAudio}
              isPlaying={isPlaying}
              aria-label="Play lookup pronunciation"
            />
          )}
        </div>
      </Card>
    )}
  </div>
);
