import "./PageContainer.css";

export default function PageContainer({
  title,
  children,
  actions,
}) {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          {title}
        </h1>

        {actions && (
          <div className="page-actions">
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}