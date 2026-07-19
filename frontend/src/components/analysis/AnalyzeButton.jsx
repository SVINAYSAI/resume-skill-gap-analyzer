import Button from '../ui/Button.jsx'

export default function AnalyzeButton({ onClick, disabled, loading }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      className="w-full sm:w-auto"
    >
      {loading ? 'Analyzing…' : 'Analyze'}
    </Button>
  )
}