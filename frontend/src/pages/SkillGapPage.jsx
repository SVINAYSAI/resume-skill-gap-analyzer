import { useState } from 'react'
import { useAnalysis } from '../hooks/useAnalysis.js'
import { useDocumentInput } from '../hooks/useDocumentInput.js'
import { analyzeSkillGap } from '../api/analysisService.js'
import { isDocumentValid } from '../utils/validation.js'
import { formatError } from '../utils/formatError.js'
import { logError } from '../utils/logger.js'
import DocumentInputPanel from '../components/analysis/DocumentInputPanel.jsx'
import AnalyzeButton from '../components/analysis/AnalyzeButton.jsx'
import MatchPercentageRing from '../components/analysis/MatchPercentageRing.jsx'
import SkillChipList from '../components/analysis/SkillChipList.jsx'
import ResultsSkeleton from '../components/analysis/ResultsSkeleton.jsx'
import ErrorBanner from '../components/ui/ErrorBanner.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'

export default function SkillGapPage() {
  const resume = useDocumentInput()
  const jd = useDocumentInput()
  const { data, loading, error, run, reset } = useAnalysis(analyzeSkillGap)
  const [showRaw, setShowRaw] = useState(false)

  const canAnalyze = isDocumentValid(resume.normalizedValue) && isDocumentValid(jd.normalizedValue)

  const handleAnalyze = async () => {
    try {
      await run({
        resume: resume.normalizedValue,
        jd: jd.normalizedValue,
      })
    } catch (err) {
      logError('skill-gap-analysis', err)
    }
  }

  const handleDismissError = () => {
    reset()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Skill Gap Analysis</h1>
        <p className="text-sm text-slate-500 mt-1">
          Compare your resume against a job description to see which skills match and which are missing.
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
            title="No results yet"
            description="Fill in both documents and run an analysis to see results here."
          />
        )}

        {!loading && data && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <MatchPercentageRing percentage={data.match_percentage} />
            </div>

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

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowRaw((s) => !s)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span className="text-sm font-semibold text-slate-800">View extracted skills</span>
                <span className="text-xs text-slate-500">{showRaw ? 'Hide' : 'Show'}</span>
              </button>
              {showRaw && (
                <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
                  <div>
                    <h5 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                      Resume skills ({data.resume_skills?.length || 0})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {(data.resume_skills || []).map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border bg-slate-100 text-slate-700 border-slate-200 break-words"
                        >
                          {s}
                        </span>
                      ))}
                      {(data.resume_skills || []).length === 0 && (
                        <p className="text-sm text-slate-400">No skills extracted.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                      JD skills ({data.jd_skills?.length || 0})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {(data.jd_skills || []).map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border bg-slate-100 text-slate-700 border-slate-200 break-words"
                        >
                          {s}
                        </span>
                      ))}
                      {(data.jd_skills || []).length === 0 && (
                        <p className="text-sm text-slate-400">No skills extracted.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}