const Badge = ({ variant = 'neutral', children, className = '' }) => {
  const styles = {
    success: 'bg-[#ECFDF3] text-[#027A48]',
    warning: 'bg-[#FFFAEB] text-[#B54708]',
    danger: 'bg-[#FEF3F2] text-[#B42318]',
    brand: 'bg-[#F0F2FF] text-[#5F6FFF]',
    neutral: 'bg-[#F2F4F7] text-[#344054]',
  }

  const dotStyles = {
    success: 'bg-[#12B76A]',
    warning: 'bg-[#F79009]',
    danger: 'bg-[#F04438]',
    brand: 'bg-[#5F6FFF]',
    neutral: 'bg-[#98A2B3]',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[13px] font-medium leading-none select-none ${
        styles[variant] || styles.neutral
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant] || dotStyles.neutral}`}
        aria-hidden="true"
      />
      <span>{children}</span>
    </span>
  )
}

export default Badge
