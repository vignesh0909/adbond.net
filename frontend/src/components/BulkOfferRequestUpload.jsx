import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { offersAPI } from '../services/offers';
import { Upload, FileText, FileUp, Loader2 } from 'lucide-react';

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

export default function BulkOfferRequestUpload({ onUploadComplete }) {
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

      const response = await offersAPI.previewBulkOfferRequestUpload(formData);

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

      const response = await offersAPI.bulkOfferRequestUpload(formData);

      if (response.success) {
        const { fileProcessing, databaseSave } = response.results;

        toast.success(
          `Upload completed! ${databaseSave.successful} offer requests saved successfully.`
        );

        if (databaseSave.failed > 0) {
          toast.warning(
            `${databaseSave.failed} offer requests failed to save. Check the results for details.`
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
      const blob = await offersAPI.downloadOfferRequestTemplate();

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
      link.download = 'bulk_offer_requests_template.xlsx';

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
        className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-bold"
      >
        <Upload className="w-5 h-5" />
        Bulk Upload Offer Requests
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="modal-content bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/30 shadow-2xl animate-modal-in">
            <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-3xl z-10 shadow-sm"
              style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(168, 85, 247, 0.05) 50%, rgba(147, 51, 234, 0.05) 100%)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    📋
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Bulk Upload Offer Requests
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Upload multiple offer requests at once using our Excel template
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
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/30 animate-slide-up animate-delay-100">
                  <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">📝</span>
                    Instructions
                  </h4>
                  <ul className="text-purple-700 dark:text-purple-200 space-y-1 text-sm list-disc pl-5">
                    <li>Download the template file and fill in your offer request data</li>
                    <li>Ensure all required fields are completed</li>
                    <li>Use the exact column names from the template</li>
                    <li>File size limit: 10MB</li>
                    <li>Supported formats: .xlsx, .xls</li>
                  </ul>
                </div>

                {/* Template Download & File Upload - Side by Side on md+ */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Template Download */}
                  <div className="flex-1 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-pink-200/50 dark:border-pink-700/30 animate-slide-up animate-delay-200 text-center">
                    <div className="space-y-4">
                      <div>
                        <FileText className="mx-auto h-12 w-12 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Download Template</h3>
                        <p className="text-gray-500 dark:text-gray-400">Start with our Excel template</p>
                      </div>
                      <button
                        onClick={downloadTemplate}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-2 rounded-lg shadow-lg font-bold transition"
                      >
                        Download Excel Template
                      </button>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="flex-1 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/30 animate-slide-up animate-delay-300">
                    <div className="space-y-4">
                      <div className="text-center">
                        <FileUp className="mx-auto h-12 w-12 text-pink-400" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Upload Your File</h3>
                        <p className="text-gray-500 dark:text-gray-400">Choose your Excel file with offer request data</p>
                      </div>

                      <div className="flex justify-center">
                        <label className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg shadow-lg font-bold cursor-pointer transition">
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
                    className="flex-1 sm:flex-none sm:px-8 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {previewing && (
                      <Loader2 className="animate-spin h-4 w-4" />
                    )}
                    {previewing ? 'Validating...' : 'Preview & Validate'}
                  </button>
                </div>
              </div>
            )}

            {step === 'preview' && previewData && (
              <div className="space-y-6 p-4">
                {/* Preview Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{previewData.total}</div>
                    <div className="text-purple-800">Total Rows</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{previewData.valid}</div>
                    <div className="text-green-800">Valid Requests</div>
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

                {/* Sample Valid Requests */}
                {previewData.sampleRequests.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Sample Valid Offer Requests:</h3>
                    <div className="space-y-2">
                      {previewData.sampleRequests.map((request, index) => (
                        <div key={index} className="text-green-700 text-sm">
                          <strong>{request.title}</strong> - {request.vertical} - Traffic: {request.traffic_volume}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2 sm:justify-between items-stretch sm:items-center">
                  <button
                    onClick={() => setStep('upload')}
                    className="flex-1 sm:flex-none sm:px-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                  >
                    Back to Upload
                  </button>
                  <div className="flex flex-col sm:flex-row gap-4 flex-1 sm:flex-none">
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
                      onClick={handleUpload}
                      disabled={uploading || previewData.valid === 0}
                      className="flex-1 sm:flex-none sm:px-8 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {uploading && (
                        <Loader2 className="animate-spin h-4 w-4" />
                      )}
                      {uploading ? 'Uploading...' : `Upload ${previewData.valid} Valid Requests`}
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
