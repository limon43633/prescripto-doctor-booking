const StatCard = ({
  label,
  value,
  footer,
  icon: Icon,
  variant = 'brand',
  isActive = false,
  onClick,
}) => {
  const iconVariants = {
    brand: 'bg-[#F0F2FF] text-[#5F6FFF]',
    success: 'bg-[#ECFDF3] text-[#12B76A]',
    danger: 'bg-[#FEF3F2] text-[#F04438]',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`w-full text-left bg-white rounded-[20px] p-5 sm:p-6 transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] border border-[#EAECF0] hover:border-[#D0D5DD] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5F6FFF]/20 ${
        isActive ? 'ring-2 ring-[#5F6FFF] border-transparent' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[14px] font-medium text-[#667085] truncate">
          {label}
        </span>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            iconVariants[variant] || iconVariants.brand
          }`}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="mt-3">
        <span className="text-[32px] leading-[40px] font-semibold text-[#101828] tabular-nums">
          {value}
        </span>
      </div>
      <div className="mt-4 pt-3.5 border-t border-[#F2F4F7] flex items-center justify-between text-[13px] text-[#667085]">
        <span className="truncate">{footer}</span>
      </div>
    </button>
  )
}

export default StatCard
