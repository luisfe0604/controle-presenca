interface Props {
  size?: number;
}

// Marca do sistema: quadrado teal com a linha central de quadra e a bolinha
// vermilion (flare). Usada na sidebar, no login e como base do favicon
// (src/app/icon.svg replica este mesmo desenho como SVG estático).
export function Logomark({ size = 36 }: Props) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center rounded-md bg-court"
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-y-1.5 left-1/2 w-px -translate-x-1/2 bg-chalk/70" />
      <span className="relative h-2 w-2 rounded-full bg-flare" />
    </span>
  );
}
