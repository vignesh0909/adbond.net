import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { offersAPI } from '../services/offers';

// Error code to user-friendly message mapping
const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File is too large. Please select a file smaller than 10MB.',
  TOO_MANY_FILES: 'Please select only one file at a time.',
  UNEXPECTED_FIELD: 'File upload error. Please try uploading again.',
  UPLOAD_ERROR: 'File upload failed. Please check your file and try again.',
  INVALID_FILE_TYPE: 'Please select a valid Excel file (.xlsx or .xls).',
  INVALID_MIME_TYPE: 'Invalid file format. Please upload an Excel file.',
  NO_FILE: 'Please select a file before uploading.',
  EMPTY_FILE: 'The selected file is empty. Please choose a file with data.',
  RATE_LIMIT_EXCEEDED: 'Too many upload attempts. Please wait a few minutes before trying again.'
};

export default function BulkOfferUpload({ onUploadComplete }) {
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [step, setStep] = useState('upload'); // 'upload', 'preview', 'confirm'

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }

      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setPreviewing(true);
    setPreviewData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await offersAPI.previewBulkUpload(formData);

      if (response.success) {
        setPreviewData(response.preview);
        setStep('preview');
        toast.success('File validated successfully');
      } else {
        const errorMessage = ERROR_MESSAGES[response.code] || response.error || 'Failed to process file';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Preview error:', error);
      const errorMessage = error.response?.data?.code ?
        ERROR_MESSAGES[error.response.data.code] || error.response.data.error :
        'Failed to preview file. Please check the format.';
      toast.error(errorMessage);
    } finally {
      setPreviewing(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await offersAPI.bulkUpload(formData);

      if (response.success) {
        const { fileProcessing, databaseSave } = response.results;

        toast.success(
          `Upload completed! ${databaseSave.successful} offers saved successfully.`
        );

        if (databaseSave.failed > 0) {
          toast.warning(
            `${databaseSave.failed} offers failed to save. Check the results for details.`
          );
        }

        // Reset form
        setFile(null);
        setPreviewData(null);
        setStep('upload');
        setShowModal(false);

        // Notify parent component
        if (onUploadComplete) {
          onUploadComplete(response.results);
        }
      } else {
        // Handle specific error codes
        const errorMessage = ERROR_MESSAGES[response.code] || response.error || 'Upload failed';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.code ?
        ERROR_MESSAGES[error.response.data.code] || error.response.data.error :
        'Upload failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const blob = await offersAPI.downloadTemplate();

      // Verify the blob is valid
      if (!blob || blob.size === 0) {
        throw new Error('Downloaded file is empty or invalid');
      }

      // Check if it's actually an Excel file
      if (!blob.type.includes('sheet') && !blob.type.includes('excel')) {
        console.warn('Unexpected blob type:', blob.type);
        // Continue anyway, might still be valid
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bulk_offers_template.xlsx';

      // Append to body, click, and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('Failed to download template: ' + error.message);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewData(null);
    setStep('upload');
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-bold"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Bulk Upload Offers
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="modal-content bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/30 shadow-2xl animate-modal-in">
            <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-3xl z-10 shadow-sm"
              style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(34, 197, 94, 0.05) 50%, rgba(59, 130, 246, 0.05) 100%)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    📦
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                      Bulk Upload Offers
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Upload multiple offers at once using our Excel template
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                >
                  <span className="text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 text-lg">✕</span>
                </button>
              </div>
            </div>

            {step === 'upload' && (
              <div className="space-y-6 p-4">
                {/* Instructions */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/30 animate-slide-up animate-delay-100">
                  <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">📝</span>
                    Instructions
                  </h4>
                  <ul className="text-blue-700 dark:text-blue-200 space-y-1 text-sm list-disc pl-5">
                    <li>Download the template file and fill in your offer data</li>
                    <li>Ensure all required fields are completed</li>
                    <li>Use the exact column names from the template</li>
                    <li>File size limit: 10MB</li>
                    <li>Supported formats: .xlsx, .xls</li>
                  </ul>
                </div>


                {/* Template Download & File Upload - Side by Side on md+ */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Template Download */}
                  <div className="flex-1 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/30 animate-slide-up animate-delay-200 text-center">
                    <div className="space-y-4">
                      <div>
                        <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Download Template</h3>
                        <p className="text-gray-500 dark:text-gray-400">Start with our Excel template</p>
                      </div>
                      <button
                        onClick={downloadTemplate}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg shadow-lg font-bold transition"
                      >
                        Download Excel Template
                      </button>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="flex-1 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/30 animate-slide-up animate-delay-300">
                    <div className="space-y-4">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Upload Your File</h3>
                        <p className="text-gray-500 dark:text-gray-400">Choose your Excel file with offer data</p>
                      </div>

                      <div className="flex justify-center">
                        <label className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-6 py-2 rounded-lg shadow-lg font-bold cursor-pointer transition">
                          Choose Excel File
                          <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {file && (
                        <div className="text-center">
                          <p className="text-green-600 dark:text-green-400 font-medium">
                            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2 animate-slide-up animate-delay-400 sm:justify-end items-stretch sm:items-center">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 sm:flex-none sm:px-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePreview}
                    disabled={!file || previewing}
                    className="flex-1 sm:flex-none sm:px-8 bg-gradient-to-r from-blue-500 via-green-500 to-blue-600 hover:from-blue-600 hover:via-green-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {previewing && (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {previewing ? 'Validating...' : 'Preview & Validate'}
                  </button>
                </div>
              </div>
            )}

            {step === 'preview' && previewData && (
              <div className="space-y-6">
                {/* Preview Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{previewData.total}</div>
                    <div className="text-blue-800">Total Rows</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{previewData.valid}</div>
                    <div className="text-green-800">Valid Offers</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{previewData.invalid}</div>
                    <div className="text-red-800">Invalid Rows</div>
                  </div>
                </div>

                {/* Errors */}
                {previewData.errors.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">Validation Errors:</h3>
                    <div className="max-h-40 overflow-y-auto">
                      {previewData.errors.map((error, index) => (
                        <div key={index} className="text-red-700 text-sm mb-2">
                          <strong>Row {error.row}:</strong> {error.errors.join(', ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sample Valid Offers */}
                {previewData.sampleOffers.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Sample Valid Offers:</h3>
                    <div className="space-y-2">
                      {previewData.sampleOffers.map((offer, index) => (
                        <div key={index} className="text-green-700 text-sm">
                          <strong>{offer.title}</strong> - {offer.category} - {offer.payout_type}: ${offer.payout_value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep('upload')}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Back to Upload
                  </button>
                  <div className="space-x-4">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading || previewData.valid === 0}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {uploading && (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {uploading ? 'Uploading...' : `Upload ${previewData.valid} Valid Offers`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
