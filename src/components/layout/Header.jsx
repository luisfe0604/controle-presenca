import "./layout.css";

export default function Header({
  onMenuClick,
}) {
  return (
    <header className="header">
      <button
        className="menu-button"
        onClick={onMenuClick}
      >
        ☰
      </button>

      <h1>
        Controle de Vôlei
      </h1>
    </header>
  );
}