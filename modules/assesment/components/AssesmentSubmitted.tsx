// AssesmentSubmitted.tsx
"use client";

import { CheckCircle, Award, Copy, ExternalLink, Check, Mail, FileText, Download } from "lucide-react";
import { useState } from "react";
import { ASSESMENT_ROUTES } from "@/constants/ApiRoutes";

interface AssesmentSubmittedProps {
  solutionId: string;
}

export default function AssesmentSubmitted({ solutionId }: AssesmentSubmittedProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCert, setCopiedCert] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const previewLink = `${origin}/assessment/preview/${solutionId}`;
  const certId = `KAI-${solutionId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(previewLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCertId = () => {
    navigator.clipboard.writeText(certId);
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center ring-2 ring-white/30">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Assessment Submitted!</h1>
          <p className="text-blue-200 text-sm">Your answers have been successfully recorded</p>
        </div>

        <div className="bg-slate-900 p-8 space-y-6">

          {/* Certificate ID card */}
          <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-sm tracking-wide uppercase">Certificate ID</span>
            </div>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-white font-mono text-sm bg-black/30 rounded-lg px-4 py-3 break-all">
                {certId}
              </code>
              <button
                onClick={handleCopyCertId}
                className="px-4 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
              >
                {copiedCert ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
              </button>
            </div>
            <p className="text-slate-400 text-xs mt-2">Your certificate will be emailed once results are evaluated.</p>
            <a
              href={ASSESMENT_ROUTES.GET_CERTIFICATE(solutionId)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full px-4 py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <Download className="w-4 h-4" />
              Download Certificate PDF
            </a>
          </div>

          {/* Preview link */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-semibold text-sm tracking-wide uppercase">Response Preview</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-300 overflow-x-auto">
                <code className="break-all">{previewLink}</code>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
              >
                {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
              </button>
            </div>
            <button
              onClick={() => window.open(`/assessment/preview/${solutionId}`, "_blank")}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              View Full Report
            </button>
          </div>

          {/* Submission details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Status</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Submitted
              </span>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Submitted At</p>
              <p className="text-white text-sm font-semibold">{new Date().toLocaleString()}</p>
            </div>
          </div>

          {/* What's next */}
          <div className="flex gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold text-sm">Certificate via Email</p>
              <p className="text-slate-400 text-sm mt-0.5">
                Once evaluated, your official PDF certificate will be sent to your registered email with your Certificate ID.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}