const PageHeader = ({ title, subtitle, actions, children, className = '' }) => {
  return (
    <header className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 ${className}`}>
      <div>
        <h1 className="text-2xl sm:text-[30px] sm:leading-[38px] font-semibold tracking-[-0.02em] text-[#101828]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[15px] leading-6 text-[#667085] mt-1.5 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {(actions || children) && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {actions}
          {children}
        </div>
      )}
    </header>
  )
}

export default PageHeader
