interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  reset: number;
}

interface RateLimitWarningProps {
  rateLimit: RateLimitInfo;
  onDismiss?: () => void;
}

export default function RateLimitWarning({ rateLimit, onDismiss }: RateLimitWarningProps) {
  if (rateLimit.allowed) {
    return null; // Don't show warning if request is allowed
  }

  const resetDate = new Date(rateLimit.reset);
  const timeUntilReset = Math.max(0, Math.ceil((rateLimit.reset - Date.now()) / (1000 * 60))); // minutes

  return (
    <div className="rate-limit-warning" role="alert">
      <div className="rate-limit-warning-content">
        <div className="rate-limit-warning-icon">⚠️</div>
        <div className="rate-limit-warning-text">
          <h3>Rate Limit Reached</h3>
          <p>
            You've reached your daily limit for recipe generation. 
            {timeUntilReset > 0 ? (
              <> You can try again in {timeUntilReset} minute{timeUntilReset !== 1 ? 's' : ''}.</>
            ) : (
              <> Please try again later.</>
            )}
          </p>
          <div className="rate-limit-details">
            <span>Remaining: {rateLimit.remaining}</span>
            <span>Resets: {resetDate.toLocaleTimeString()}</span>
          </div>
        </div>
        {onDismiss && (
          <button 
            className="rate-limit-dismiss" 
            onClick={onDismiss}
            aria-label="Dismiss rate limit warning"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
