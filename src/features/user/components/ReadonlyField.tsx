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
  return (
    <div>
      <p className={fieldLabel}>{label}</p>
      <input
        className={`${fieldBase} bg-bg-gray-box${muted ? " text-text-placeholder" : ""}`}
        value={value}
        readOnly
      />
    </div>
  );
}
