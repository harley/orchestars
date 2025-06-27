'use client'

import React from 'react'
import './PayloadUIComponents.scss'

// PayloadCMS-compatible Card component
export const PayloadCard: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => <div className={`payload-card ${className}`}>{children}</div>

export const PayloadCardHeader: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <div className={`payload-card__header ${className}`}>{children}</div>
)

export const PayloadCardContent: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <div className={`payload-card__content ${className}`}>{children}</div>
)

export const PayloadCardTitle: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <h3 className={`payload-card__title ${className}`}>{children}</h3>
)

export const PayloadCardDescription: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <p className={`payload-card__description ${className}`}>{children}</p>
)

// PayloadCMS-compatible Badge component
export const PayloadBadge: React.FC<{
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger'
  className?: string
}> = ({ children, variant = 'default', className = '' }) => (
  <span
    className={`payload-badge payload-badge--${variant} ${className}`}
    style={{ borderRadius: '4px' }}
  >
    {children}
  </span>
)

// PayloadCMS-compatible Tabs components
export const PayloadTabs: React.FC<{
  children: React.ReactNode
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}> = ({ children, defaultValue, value, onValueChange, className = '' }) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue)

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue)
    onValueChange?.(newValue)
  }

  return (
    <div className={`payload-tabs ${className}`} data-active-tab={activeTab}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { activeTab, onTabChange: handleTabChange } as any)
          : child,
      )}
    </div>
  )
}

export const PayloadTabsList: React.FC<{
  children: React.ReactNode
  className?: string
  activeTab?: string
  onTabChange?: (value: string) => void
}> = ({ children, className = '', activeTab, onTabChange }) => (
  <div className={`payload-tabs__list ${className}`}>
    {React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? React.cloneElement(child, { activeTab, onTabChange } as any)
        : child,
    )}
  </div>
)

export const PayloadTabsTrigger: React.FC<{
  children: React.ReactNode
  value: string
  className?: string
  activeTab?: string
  onTabChange?: (value: string) => void
}> = ({ children, value, className = '', activeTab, onTabChange }) => (
  <button
    className={`payload-tabs__trigger ${activeTab === value ? 'payload-tabs__trigger--active' : ''} ${className}`}
    onClick={() => onTabChange?.(value)}
    type="button"
  >
    {children}
  </button>
)

export const PayloadTabsContent: React.FC<{
  children: React.ReactNode
  value: string
  className?: string
  activeTab?: string
}> = ({ children, value, className = '', activeTab }) => {
  if (activeTab !== value) return null

  return <div className={`payload-tabs__content ${className}`}>{children}</div>
}

// PayloadCMS-compatible Modal components
export const PayloadModal: React.FC<{
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  className?: string
}> = ({ children, isOpen, onClose, className = '' }) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={`payload-modal-overlay ${className}`} onClick={onClose}>
      <div className="payload-modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export const PayloadModalHeader: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <div className={`payload-modal-header ${className}`}>{children}</div>
)

export const PayloadModalTitle: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <h2 className={`payload-modal-title ${className}`}>{children}</h2>
)

export const PayloadModalBody: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <div className={`payload-modal-body ${className}`}>{children}</div>
)

export const PayloadModalFooter: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <div className={`payload-modal-footer ${className}`}>{children}</div>
)

// PayloadCMS-compatible Form components
export const PayloadFormGroup: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <div className={`payload-form-group ${className}`}>{children}</div>
)

export const PayloadLabel: React.FC<{
  children: React.ReactNode
  htmlFor?: string
  required?: boolean
  className?: string
}> = ({ children, htmlFor, required, className = '' }) => (
  <label className={`payload-label ${className}`} htmlFor={htmlFor}>
    {children}
    {required && <span className="payload-label-required">*</span>}
  </label>
)

export const PayloadDescription: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <p className={`payload-description ${className}`}>{children}</p>
)

export const PayloadInput: React.FC<{
  type?: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  min?: number
  max?: number
  step?: string
}> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  disabled,
  className = '',
  id,
  name,
  min,
  max,
  step,
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    className={`payload-input ${className}`}
    id={id}
    name={name}
    min={min}
    max={max}
    step={step}
  />
)

export const PayloadTextarea: React.FC<{
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  rows?: number
}> = ({ value, onChange, placeholder, required, disabled, className = '', id, name, rows = 3 }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    className={`payload-textarea ${className}`}
    id={id}
    name={name}
    rows={rows}
  />
)

export const PayloadSelect: React.FC<{
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  required?: boolean
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  style?: React.CSSProperties
  children: React.ReactNode
}> = ({ value, onChange, required, disabled, className = '', id, name, style, children }) => (
  <select
    value={value}
    onChange={onChange}
    required={required}
    disabled={disabled}
    className={`payload-select ${className}`}
    id={id}
    name={name}
    style={style}
  >
    {children}
  </select>
)

export const PayloadCheckbox: React.FC<{
  checked?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  className?: string
  id?: string
  name?: string
}> = ({ checked, onChange, disabled, className = '', id, name }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={onChange}
    disabled={disabled}
    className={`payload-checkbox ${className}`}
    id={id}
    name={name}
  />
)

export const PayloadMultiSelect: React.FC<{
  options: Array<{ label: string; value: string }>
  value: string[]
  onChange: (values: string[]) => void
  className?: string
  disabled?: boolean
}> = ({ options, value, onChange, className = '', disabled }) => {
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue])
    } else {
      onChange(value.filter((v) => v !== optionValue))
    }
  }

  return (
    <div className={`payload-multi-select ${className}`}>
      {options.map((option) => (
        <label key={option.value} className="payload-multi-select-option">
          <PayloadCheckbox
            checked={value.includes(option.value)}
            onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
            disabled={disabled}
          />
          {option.label}
        </label>
      ))}
    </div>
  )
}

// PayloadCMS-compatible Table components
export const PayloadTable: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <div className={`payload-table-wrapper ${className}`}>
    <table className="payload-table">{children}</table>
  </div>
)

export const PayloadTableHeader: React.FC<{
  children: React.ReactNode
}> = ({ children }) => <thead className="payload-table__header">{children}</thead>

export const PayloadTableBody: React.FC<{
  children: React.ReactNode
}> = ({ children }) => <tbody className="payload-table__body">{children}</tbody>

export const PayloadTableRow: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <tr className={`payload-table__row ${className}`}>{children}</tr>
)

export const PayloadTableHead: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <th className={`payload-table__head ${className}`}>{children}</th>
)

export const PayloadTableCell: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <td className={`payload-table__cell ${className}`}>{children}</td>
)

// PayloadCMS-compatible Grid components
export const PayloadGrid: React.FC<{
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ children, cols = 1, gap = 'md', className = '' }) => (
  <div className={`payload-grid payload-grid--cols-${cols} payload-grid--gap-${gap} ${className}`}>
    {children}
  </div>
)

export const PayloadGridItem: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <div className={`payload-grid__item ${className}`} style={{ overflow: 'visible' }}>
    {children}
  </div>
)
