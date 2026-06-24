"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  searchIngredients,
  type IngredientSuggestion,
} from "@/lib/ingredients/search-ingredients";
import { splitHighlightedName } from "@/utils/string-search";

type IngredientAutocompleteProps = {
  value: string;
  onChange: (name: string) => void;
  onSelect?: (ingredient: IngredientSuggestion) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  "aria-invalid"?: boolean;
};

const DEBOUNCE_MS = 300;

function SuggestionLabel({
  name,
  unit,
  searchTerm,
}: {
  name: string;
  unit: string | null;
  searchTerm: string;
}) {
  const segments = splitHighlightedName(name, searchTerm);
  const trimmedUnit = unit?.trim();

  return (
    <span className="min-w-0 truncate">
      {segments.map((segment, index) =>
        segment.highlight ? (
          <span key={`${segment.text}-${index}`} className="font-medium text-[var(--foreground)]">
            {segment.text}
          </span>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        ),
      )}
      {trimmedUnit ? (
        <span className="text-[var(--muted)]">{` — ${trimmedUnit}`}</span>
      ) : null}
    </span>
  );
}

export function IngredientAutocomplete({
  value,
  onChange,
  onSelect,
  disabled = false,
  placeholder,
  id,
  "aria-invalid": ariaInvalid,
}: IngredientAutocompleteProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listboxId = `${inputId}-suggestions`;

  const containerRef = useRef<HTMLDivElement>(null);
  const [debouncedTerm, setDebouncedTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<IngredientSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedTerm(value);
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value]);

  useEffect(() => {
    const trimmed = debouncedTerm.trim();

    if (trimmed.length < 1) {
      setSuggestions([]);
      setIsLoading(false);
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void searchIngredients(trimmed).then((results) => {
      if (cancelled) {
        return;
      }

      setSuggestions(results);
      setIsLoading(false);
      setIsOpen(results.length > 0);
      setHighlightedIndex(-1);
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedTerm]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  function handleSelect(ingredient: IngredientSuggestion) {
    onChange(ingredient.name);
    onSelect?.(ingredient);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (!isOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current < suggestions.length - 1 ? current + 1 : 0,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current > 0 ? current - 1 : suggestions.length - 1,
      );
      return;
    }

    if (event.key === "Enter" && highlightedIndex >= 0) {
      event.preventDefault();
      const selected = suggestions[highlightedIndex];
      if (selected) {
        handleSelect(selected);
      }
    }
  }

  const showDropdown = isOpen && (isLoading || suggestions.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <input
        id={inputId}
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-controls={showDropdown ? listboxId : undefined}
        aria-activedescendant={
          highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined
        }
        onChange={(event) => {
          onChange(event.target.value);
          if (event.target.value.trim().length > 0) {
            setIsOpen(true);
          }
        }}
        onFocus={() => {
          if (suggestions.length > 0 && value.trim().length > 0) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        className="input-field"
        autoComplete="off"
      />

      {showDropdown ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute top-full z-10 mt-1 max-h-48 w-full overflow-auto rounded-sm border border-[var(--border-hairline)] bg-[var(--surface)] py-1 shadow-[0_4px_12px_rgba(28,27,25,0.08)]"
        >
          {isLoading ? (
            <li className="text-caption px-3 py-2 text-[var(--muted)]">Recherche…</li>
          ) : (
            suggestions.map((suggestion, index) => (
              <li key={suggestion.id} role="presentation">
                <button
                  type="button"
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  className={`text-body flex min-h-[var(--touch-min)] w-full items-center px-3 py-2 text-left text-[var(--foreground)] hover:bg-[var(--surface-muted)] ${
                    highlightedIndex === index ? "bg-[var(--surface-muted)]" : ""
                  }`}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={() => handleSelect(suggestion)}
                >
                  <SuggestionLabel
                    name={suggestion.name}
                    unit={suggestion.unit}
                    searchTerm={debouncedTerm}
                  />
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
