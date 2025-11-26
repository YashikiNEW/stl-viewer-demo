import type { STLError } from '../../types/error'
import './ErrorMessage.css'

interface ErrorMessageProps {
  error: STLError
  onRetry: () => void
}

/**
 * エラーメッセージを表示するコンポーネント
 */
export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  return (
    <div className="error-message" role="alert">
      <div className="error-icon" data-testid="error-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="error-title">{error.message}</h3>
      {error.details && <p className="error-details">{error.details}</p>}
      <button className="retry-button" onClick={onRetry}>
        再アップロード
      </button>
    </div>
  )
}
