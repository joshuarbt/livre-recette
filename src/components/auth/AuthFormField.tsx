type AuthFormFieldProps = {
  id: string;
  label: string;
  type: "email" | "password";
  name: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function AuthFormField({
  id,
  label,
  type,
  name,
  autoComplete,
  value,
  onChange,
  disabled = false,
}: AuthFormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="input-label">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="input-field mt-1.5"
      />
    </div>
  );
}
