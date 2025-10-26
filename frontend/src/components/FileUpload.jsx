import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  File, 
  FileText, 
  Image as ImageIcon,
  Music,
  Video,
  Archive,
  Trash2,
  Download,
  Eye
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const FileUpload = ({ workspaceId, isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { user } = useAuth();

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
      return <ImageIcon className="w-6 h-6 text-blue-500" />;
    } else if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
      return <Music className="w-6 h-6 text-purple-500" />;
    } else if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) {
      return <Video className="w-6 h-6 text-red-500" />;
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <Archive className="w-6 h-6 text-yellow-500" />;
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
      return <FileText className="w-6 h-6 text-green-500" />;
    } else {
      return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let failedFiles = [];

    try {
      for (const fileObj of files) {
        try {
          // Convert file to base64
          const reader = new FileReader();
          const base64Promise = new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(fileObj.file);
          });

          const base64Data = await base64Promise;

          // Save file info to database
          const { data, error } = await supabase
            .from('uploaded_files')
            .insert([{
              workspace_id: workspaceId,
              user_id: user.id,
              file_name: fileObj.name,
              file_size: fileObj.size,
              file_type: fileObj.type,
              file_data: base64Data
            }])
            .select()
            .single();

          if (error) {
            console.error('Upload error for', fileObj.name, ':', error);
            failedFiles.push(fileObj.name);
          } else {
            successCount++;
          }
        } catch (error) {
          console.error('Upload error for', fileObj.name, ':', error);
          failedFiles.push(fileObj.name);
        }
      }

      setUploading(false);
      
      if (successCount > 0) {
        alert(`✅ ${successCount} file(s) uploaded successfully!${failedFiles.length > 0 ? '\n❌ Failed: ' + failedFiles.join(', ') : ''}`);
        setFiles([]);
        await loadUploadedFiles();
      } else {
        alert(`❌ Failed to upload files. Please try again.\nErrors: ${failedFiles.join(', ')}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      alert(`❌ Upload failed: ${error.message}`);
    }
  };

  const loadUploadedFiles = async () => {
    if (!workspaceId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUploadedFiles(data);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const { error } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId);

      if (!error) {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
        alert('✅ File deleted successfully!');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Failed to delete file');
    }
  };

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.file_data;
    link.download = file.file_name;
    link.click();
  };

  // Load files when component opens
  useEffect(() => {
    if (isOpen) {
      loadUploadedFiles();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-orange-600 to-amber-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Upload Documents</h2>
                  <p className="text-orange-100 text-sm">Upload and manage workspace files</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* Upload Area */}
            <div className="mb-6">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 hover:border-orange-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Drop files here or click to browse
                </h3>
                <p className="text-gray-600 mb-4">
                  Support for documents, images, videos, and more
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer font-medium"
                >
                  Browse Files
                </label>
              </div>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Selected Files ({files.length})
                  </h3>
                  <button
                    onClick={uploadFiles}
                    disabled={uploading}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload All
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-2">
                  {files.map((fileObj) => (
                    <div
                      key={fileObj.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getFileIcon(fileObj.name)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {fileObj.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(fileObj.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(fileObj.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Files */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Uploaded Files ({uploadedFiles.length})
                </h3>
                <button
                  onClick={loadUploadedFiles}
                  disabled={loading}
                  className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading files...</p>
                </div>
              ) : uploadedFiles.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <File className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No files uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getFileIcon(file.file_name)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {file.file_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatFileSize(file.file_size)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadFile(file)}
                          className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FileUpload;
