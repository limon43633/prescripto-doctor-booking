import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IconWarning, IconSpinner } from './Icons'

const ConfirmDialog = ({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}) => {
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)
  const cancelBtnRef = useRef(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement

    const timer = setTimeout(() => {
      cancelBtnRef.current?.focus()
    }, 20)

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (!loading) {
          e.preventDefault()
          onClose?.()
        }
        return
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus()
      }
    }
  }, [onClose, loading])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/40 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose?.()
        }
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        className="w-full max-w-md bg-white rounded-[20px] shadow-[0_24px_48px_-12px_rgba(16,24,40,0.24)] border border-[#EAECF0] p-6 sm:p-7 animate-admin-modal text-left"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
              danger
                ? 'bg-[#FEF3F2] text-[#F04438]'
                : 'bg-[#F0F2FF] text-[#5F6FFF]'
            }`}
          >
            <IconWarning className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="confirm-dialog-title" className="text-[18px] leading-[26px] font-semibold text-[#101828]">
              {title}
            </h2>
            <div id="confirm-dialog-desc" className="text-[14px] text-[#667085] mt-1 leading-relaxed">
              {description}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            ref={cancelBtnRef}
            type="button"
            disabled={loading}
            onClick={onClose}
            className="h-11 px-5 rounded-[12px] border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB] font-medium text-[14px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5F6FFF]/15"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`h-11 px-5 rounded-[12px] font-medium text-[14px] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2 focus:outline-none focus-visible:ring-4 ${
              danger
                ? 'bg-[#B42318] hover:bg-[#912018] text-white focus-visible:ring-[#B42318]/20'
                : 'bg-[#5F6FFF] hover:bg-[#4F5EEB] text-white focus-visible:ring-[#5F6FFF]/20'
            }`}
          >
            {loading && <IconSpinner className="w-4 h-4 text-white" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmDialog
