import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/store/chat-store";

const MAX_TOKENS_LIMIT = 4096;

export function SettingsPanel() {
  const settings = useChatStore((state) => state.settings);
  const setSettings = useChatStore((state) => state.setSettings);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Temperature</span>
          <span className="text-xs text-muted-foreground">{settings.temperature.toFixed(2)}</span>
        </div>
        <Slider
          value={[settings.temperature]}
          min={0}
          max={1.5}
          step={0.05}
          onValueChange={([value]) => setSettings({ temperature: value })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Top P</span>
          <span className="text-xs text-muted-foreground">{settings.topP.toFixed(2)}</span>
        </div>
        <Slider
          value={[settings.topP]}
          min={0}
          max={1}
          step={0.05}
          onValueChange={([value]) => setSettings({ topP: value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Max Tokens</label>
        <Input
          type="number"
          min={16}
          max={MAX_TOKENS_LIMIT}
          value={settings.maxTokens ?? ""}
          placeholder="Auto"
          onChange={(event) => {
            const value = event.target.value;
            setSettings({ maxTokens: value ? Number(value) : undefined });
          }}
          className="mt-2"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Presence Penalty</p>
          <p className="text-xs text-muted-foreground">Encourage novel topics</p>
        </div>
        <Input
          type="number"
          step={0.1}
          className="w-24"
          value={settings.presencePenalty}
          onChange={(event) => setSettings({ presencePenalty: Number(event.target.value) })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Frequency Penalty</p>
          <p className="text-xs text-muted-foreground">Reduce repetition</p>
        </div>
        <Input
          type="number"
          step={0.1}
          className="w-24"
          value={settings.frequencyPenalty}
          onChange={(event) => setSettings({ frequencyPenalty: Number(event.target.value) })}
        />
      </div>
    </div>
  );
}
