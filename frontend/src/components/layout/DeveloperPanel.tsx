import { DeveloperPanelView } from "./DeveloperPanelView";
import { useDeveloperPanel } from "./hooks";
import type { DeveloperPanelProps } from "./types";

export function DeveloperPanel(props: DeveloperPanelProps) {
  const { isRightAligned, openIcon, closeIcon, title, subtitle, providerMeta, selectedModelMeta } =
    useDeveloperPanel(props);

  return (
    <DeveloperPanelView
      isOpen={props.isOpen}
      onToggle={props.onToggle}
      isRightAligned={isRightAligned}
      openIcon={openIcon}
      closeIcon={closeIcon}
      title={title}
      subtitle={subtitle}
      providerMeta={providerMeta}
      selectedModelMeta={selectedModelMeta}
      models={props.models}
      section={props.section}
    />
  );
}
