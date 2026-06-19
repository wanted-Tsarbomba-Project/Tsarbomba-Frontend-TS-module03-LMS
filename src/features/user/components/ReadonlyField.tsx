import { useId } from "react";
import { fieldBase, fieldLabel } from "./styles";

// 읽기 전용
export default function ReadonlyField({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <input
        id={id}
        className={`${fieldBase} bg-bg-gray-box${muted ? " text-text-placeholder" : ""}`}
        value={value}
        readOnly
      />
    </div>
  );
}
