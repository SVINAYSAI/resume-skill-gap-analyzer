import { useAnalysis } from '../hooks/useAnalysis.js'
import { useDocumentInput } from '../hooks/useDocumentInput.js'
import { analyzeFitVerdict } from '../api/analysisService.js'
import { isDocumentValid } from '../utils/validation.js'
import { formatError } from '../utils/formatError.js'
import { logError } from '../utils/logger.js'
import DocumentInputPanel from '../components/analysis/DocumentInputPanel.jsx'
import AnalyzeButton from '../components/analysis/AnalyzeButton.jsx'
import VerdictBadge from '../components/analysis/VerdictBadge.jsx'
import MatchPercentageRing from '../components/analysis/MatchPercentageRing.jsx'
import ReasonsList from '../components/analysis/ReasonsList.jsx'
import SkillChipList from '../components/analysis/SkillChipList.jsx'
import ResultsSkeleton from '../components/analysis/ResultsSkeleton.jsx'
import ErrorBanner from '../components/ui/ErrorBanner.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'

export default function FitVerdictPage() {
  const resume = useDocumentInput()
  const jd = useDocumentInput()
  const { data, loading, error, run, reset } = useAnalysis(analyzeFitVerdict)

  const canAnalyze = isDocumentValid(resume.normalizedValue) && isDocumentValid(jd.normalizedValue)

  const handleAnalyze = async () => {
    try {
      await run({
        resume: resume.normalizedValue,
        jd: jd.normalizedValue,
      })
    } catch (err) {
      logError('fit-verdict-analysis', err)
    }
  }

  const handleDismissError = () => {
    reset()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Fit Verdict</h1>
        <p className="text-sm text-slate-500 mt-1">
          Get an AI-powered verdict on how well your resume fits the job description, with clear reasons.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <DocumentInputPanel
          label="Resume"
          mode={resume.mode}
          onModeChange={resume.setMode}
          value={resume.value}
          onValueChange={resume.setValue}
          disabled={loading}
        />
        <DocumentInputPanel
          label="Job Description"
          mode={jd.mode}
          onModeChange={jd.setMode}
          value={jd.value}
          onValueChange={jd.setValue}
          disabled={loading}
        />
      </div>

      <div className="flex justify-center">
        <AnalyzeButton
          onClick={handleAnalyze}
          disabled={!canAnalyze || loading}
          loading={loading}
        />
      </div>

      <div className="space-y-6">
        {error && !loading && (
          <ErrorBanner
            message={formatError(error)}
            onDismiss={handleDismissError}
          />
        )}

        {loading && <ResultsSkeleton />}

        {!loading && !error && !data && (
          <EmptyState
            title="No verdict yet"
            description="Fill in both documents and run an analysis to see your fit verdict."
          />
        )}

        {!loading && data && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <VerdictBadge percentage={data.match_percentage} />
            </div>

            <div className="flex justify-center">
              <MatchPercentageRing percentage={data.match_percentage} />
            </div>

            <ReasonsList reasons={data.reasons} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkillChipList
                skills={data.matched_skills}
                variant="success"
                title="Matched skills"
                emptyText="No skills matched."
              />
              <SkillChipList
                skills={data.missing_skills}
                variant="danger"
                title="Missing skills"
                emptyText="No missing skills — great match!"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}