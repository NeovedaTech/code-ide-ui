// AssesmentSubmitted.tsx
"use client";

import { CheckCircle, Download, Mail } from "lucide-react";

export default function AssesmentSubmitted() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-12 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Assessment Submitted!</h1>
          <p className="text-green-100">Your answers have been successfully recorded</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Confirmation Message */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-gray-800">
              Thank you for completing the assessment. Your submission has been received and is now being evaluated. You will receive your results and feedback shortly.
            </p>
          </div>

          {/* Submission Details */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Submission Details</h2>
            <div className="grid gap-3">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded border border-gray-200">
                <span className="text-gray-700 font-medium">Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-full text-sm">Completed</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded border border-gray-200">
                <span className="text-gray-700 font-medium">Submitted At</span>
                <span className="text-gray-900 font-semibold">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">What's Next?</h2>
            <div className="space-y-3">
              <div className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Email Confirmation</h3>
                  <p className="text-blue-800 text-sm mt-1">
                    A confirmation email has been sent to your registered email address with your submission details.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Download className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Results & Feedback</h3>
                  <p className="text-blue-800 text-sm mt-1">
                    Your results will be available within 24-48 hours. You'll receive a notification once they're ready.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="bg-gray-50 -mx-8 -mb-8 px-8 py-6 flex gap-3">
            <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}