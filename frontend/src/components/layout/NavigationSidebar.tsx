import { NavigationSidebarView } from "./NavigationSidebarView";
import { NavigationSettingsModal } from "./NavigationSettingsModal";
import { useNavigationSidebar } from "./hooks";
import type { NavigationSidebarProps } from "./types";

export type { Section } from "./types";

export function NavigationSidebar(props: NavigationSidebarProps) {
  const {
    navItems,
    isSettingsOpen,
    openSettings,
    closeSettings,
    feedback,
    statusLabel,
    statusColor,
    isRuntimeKey,
    isSavingKey,
    isClearingKey,
    inputRef,
    handleSaveApiKey,
    handleClearStoredApiKey,
  } = useNavigationSidebar(props);

  return (
    <>
      <NavigationSidebarView
        navItems={navItems}
        active={props.active}
        onSelect={props.onSelect}
        theme={props.theme}
        onThemeToggle={props.onThemeToggle}
        onOpenSettings={openSettings}
        statusLabel={statusLabel}
        statusColor={statusColor}
      />
      <NavigationSettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        apiKey={props.apiKey}
        onApiKeyChange={props.onApiKeyChange}
        feedback={feedback}
        statusLabel={statusLabel}
        statusColor={statusColor}
        isRuntimeKey={isRuntimeKey}
        isSavingKey={isSavingKey}
        isClearingKey={isClearingKey}
        inputRef={inputRef}
        onSubmit={handleSaveApiKey}
        onRemoveKey={handleClearStoredApiKey}
      />
    </>
  );
}
