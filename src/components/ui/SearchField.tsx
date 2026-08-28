import { Icon } from "@/components/ui/Icon";
import { actionIcons } from "@/lib/icons";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onClear?: () => void;
  "aria-label"?: string;
};

export function SearchField({
  value,
  onChange,
  placeholder = "Rechercher…",
  disabled = false,
  onClear,
  "aria-label": ariaLabel = "Rechercher",
}: SearchFieldProps) {
  const showClear = value.length > 0 && !disabled;

  function handleClear() {
    if (onClear) {
      onClear();
    } else {
      onChange("");
    }
  }

  return (
    <div className="search-field">
      <Icon icon={actionIcons.search} size="sm" className="search-field__icon" />
      <input
        type="search"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        enterKeyHint="search"
        className="search-field__input"
      />
      {showClear ? (
        <button
          type="button"
          onClick={handleClear}
          className="search-field__clear"
          aria-label="Effacer la recherche"
        >
          <Icon icon={actionIcons.close} size="sm" />
        </button>
      ) : null}
    </div>
  );
}
