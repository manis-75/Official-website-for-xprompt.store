import React, { useState, useRef } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle, Paperclip, Image as ImageIcon, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportIssueModal({ isOpen, onClose }: ReportIssueModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Limit to 5 files total
      if (files.length + newFiles.length > 5) {
        setErrorMessage('You can only upload up to 5 files.');
        return;
      }
      
      // Check file sizes (10MB limit per file)
      const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setErrorMessage('Each file must be less than 10MB.');
        return;
      }

      setFiles(prev => [...prev, ...newFiles]);
      setErrorMessage('');
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (email) formData.append('email', email);
      
      files.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch('/api/report-issue', {
        method: 'POST',
        body: formData, // Fetch automatically sets the correct Content-Type with boundary for FormData
      });

      if (!response.ok) {
        throw new Error('Failed to send report');
      }

      setStatus('success');
      
      // Reset form after 3 seconds and close
      setTimeout(() => {
        setStatus('idle');
        setTitle('');
        setDescription('');
        setEmail('');
        setFiles([]);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error sending report:', error);
      setStatus('error');
      setErrorMessage('Failed to send report. Please try again later.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 shrink-0">
              <h2 className="text-lg font-semibold text-white">Report an Issue</h2>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar">
              {status === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Report Sent</h3>
                  <p className="text-zinc-400 text-sm">
                    Your report has been successfully sent to the Xprompt support team.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                  <div className="space-y-4 flex-1">
                    {status === 'error' && (
                      <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <p>{errorMessage}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-1.5">
                          Issue Title <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="title"
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Cannot upload image"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
                          Your Email <span className="text-zinc-500 font-normal">(Optional)</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="So we can follow up"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-1.5">
                        Description <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        id="description"
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please describe the issue in detail..."
                        rows={3}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                        Attachments <span className="text-zinc-500 font-normal">(Optional, up to 5 files)</span>
                      </label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-3 flex items-center justify-center gap-3 cursor-pointer transition-colors bg-zinc-950/30"
                      >
                        <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 flex gap-2">
                          <ImageIcon size={18} />
                          <Video size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-zinc-300 font-medium">Click to upload images or videos</p>
                          <p className="text-xs text-zinc-500">Max 10MB per file</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>

                      {files.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg py-1.5 px-2.5 max-w-[200px]">
                              <Paperclip size={12} className="text-zinc-400 shrink-0" />
                              <span className="text-xs text-zinc-300 truncate flex-1">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-zinc-500 hover:text-red-400 p-0.5 rounded-md hover:bg-zinc-700/50 transition-colors shrink-0 ml-1"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 mt-2 shrink-0">
                    <button
                      type="submit"
                      disabled={status === 'submitting' || !title.trim() || !description.trim()}
                      className="w-full bg-white text-black font-medium rounded-xl px-4 py-2.5 hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Submit Report</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
