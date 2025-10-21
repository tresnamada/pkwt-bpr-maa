'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { Employee } from '@/types/employee';
import { performanceService } from '@/lib/performanceService';
import { RatingLevel, PositionTemplate } from '@/types/performance';

interface PerformanceEvaluationModalProps {
  onClose: () => void;
  onSubmitted: () => void;
  employees: Employee[];
}

export default function PerformanceEvaluationModal({
  onClose,
  onSubmitted,
  employees
}: PerformanceEvaluationModalProps) {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useAlert();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [template, setTemplate] = useState<PositionTemplate | null>(null);
  const [questionRatings, setQuestionRatings] = useState<Record<string, RatingLevel | null>>({});
  const [overallNotes, setOverallNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const positionTemplates = performanceService.getAllPositionTemplates();
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  useEffect(() => {
    if (selectedPosition) {
      const tmpl = performanceService.getPositionTemplate(selectedPosition);
      setTemplate(tmpl || null);
      
      if (tmpl) {
        // Initialize question ratings
        const ratings: Record<string, RatingLevel | null> = {};
        tmpl.questions.forEach(question => {
          ratings[question.id] = null;
        });
        setQuestionRatings(ratings);
      }
    }
  }, [selectedPosition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee || !template || !user?.email) {
      showWarning('Mohon lengkapi semua data');
      return;
    }

    // Validate all questions have ratings
    const allQuestionsRated = template.questions.every(question => questionRatings[question.id]);
    if (!allQuestionsRated) {
      showWarning('Mohon berikan penilaian untuk semua pertanyaan');
      return;
    }

    try {
      setSubmitting(true);

      const evaluationData = {
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        position: selectedPosition,
        unit: selectedEmployee.unit,
        questions: template.questions.map(question => ({
          questionId: question.id,
          question: question.question,
          rating: questionRatings[question.id] as RatingLevel
        })),
        overallNotes
      };

      await performanceService.createEvaluation(evaluationData, user.email);
      showSuccess('Evaluasi berhasil disimpan!');
      onSubmitted();
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      showError('Gagal menyimpan evaluasi. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (rating: RatingLevel) => {
    const labels: Record<RatingLevel, string> = {
      'kurang': 'Kurang',
      'cukup': 'Cukup',
      'baik': 'Baik',
      'mahir': 'Mahir'
    };
    return labels[rating];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto text-slate-900">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Evaluasi Kinerja Karyawan</h2>
                <p className="text-sm text-red-100">Isi formulir penilaian kinerja</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Employee Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pilih Karyawan <span className="text-red-600">*</span>
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="">-- Pilih Karyawan --</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Position Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Jabatan <span className="text-red-600">*</span>
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="">-- Pilih Jabatan --</option>
              {positionTemplates.map(tmpl => (
                <option key={tmpl.position} value={tmpl.position}>
                  {tmpl.position}
                </option>
              ))}
            </select>
          </div>

          {/* Questions Rating */}
          {template && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Penilaian Kinerja
              </h3>
              <div className="space-y-4">
                {template.questions.map((question) => (
                  <div key={question.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-900">{question.question}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['kurang', 'cukup', 'baik', 'mahir'] as RatingLevel[]).map((rating) => (
                        <label
                          key={rating}
                          className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            questionRatings[question.id] === rating
                              ? 'border-red-600 bg-red-50 text-red-900'
                              : 'border-gray-300 hover:border-red-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={rating}
                            checked={questionRatings[question.id] === rating}
                            onChange={(e) => setQuestionRatings({
                              ...questionRatings,
                              [question.id]: e.target.value as RatingLevel
                            })}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{getRatingLabel(rating)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overall Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catatan Keseluruhan
            </label>
            <textarea
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              placeholder="Tambahkan catatan atau komentar tambahan..."
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedEmployeeId || !selectedPosition}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </span>
              ) : (
                'Simpan Evaluasi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
