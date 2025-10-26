/**
 * ============================================================================
 * DOCUMENT EDITOR COMPONENT
 * ============================================================================
 * Rich text document editor with collaborative features
 * 
 * Features:
 * - Real-time rich text editing
 * - Document saving to Supabase database
 * - Export to HTML format
 * - Formatting toolbar (headings, lists, styling)
 * - Font size control
 * - Background color options
 * - Undo/redo functionality
 * - Link and image insertion
 * 
 * Props:
 * - workspaceId (string): Parent workspace ID
 * - isOpen (boolean): Modal visibility state
 * - onClose (Function): Close modal callback
 * - documentId (string): Existing document ID (optional)
 * ============================================================================
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  Download,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  Strikethrough,
  Undo,
  Redo,
  Type
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Document Editor Component
 * Rich text editor with collaborative document management
 * 
 * @param {Object} props
 * @param {string} props.workspaceId - Parent workspace ID
 * @param {boolean} props.isOpen - Modal visibility state
 * @param {Function} props.onClose - Close modal callback
 * @param {string} [props.documentId] - Existing document ID (optional)
 */
const DocumentEditor = ({ workspaceId, isOpen, onClose, documentId = null }) => {
  // ==================== REFS ====================

  /**
   * Reference to the contentEditable div element
   * Used for direct DOM manipulation of editor content
   */
  const editorRef = useRef(null);

  // ==================== STATE MANAGEMENT ====================

  // Document properties
  const [documentName, setDocumentName] = useState('Untitled Document'); // Document title
  const [currentDocumentId, setCurrentDocumentId] = useState(documentId); // Current document ID

  // UI states
  const [isSaving, setIsSaving] = useState(false);     // Save operation status
  const [content, setContent] = useState('');          // Document content (HTML)
  const [fontSize, setFontSize] = useState('16');      // Current font size in pixels
  const [isContentLoaded, setIsContentLoaded] = useState(false); // Content loading status

  // Authentication context
  const { user } = useAuth();

  // ==================== EFFECTS ====================

  /**
   * Effect: Load document when modal opens
   * Handles both new and existing documents
   */
  useEffect(() => {
    if (isOpen && currentDocumentId) {
      loadDocument();
    } else if (isOpen && !currentDocumentId) {
      // New document - clear editor
      setIsContentLoaded(false);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  }, [isOpen, currentDocumentId]);

  // ==================== DOCUMENT OPERATIONS ====================

  /**
   * Load existing document from database
   * Populates editor with saved content
   */
  const loadDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', currentDocumentId)
        .single();

      if (!error && data) {
        setDocumentName(data.name);
        const htmlContent = data.content?.html || '';
        setContent(htmlContent);
        if (editorRef.current) {
          editorRef.current.innerHTML = htmlContent;
        }
        setIsContentLoaded(true);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    }
  };

  /**
   * Save document to database
   * Either creates new document or updates existing one
   */
  const saveDocument = async () => {
    setIsSaving(true);
    try {
      const documentContent = {
        html: editorRef.current?.innerHTML || content,
        text: editorRef.current?.innerText || ''
      };

      if (currentDocumentId) {
        // Update existing document
        const { error } = await supabase
          .from('documents')
          .update({ 
            content: documentContent,
            name: documentName 
          })
          .eq('id', currentDocumentId);

        if (error) throw error;
      } else {
        // Create new document
        const { data, error } = await supabase
          .from('documents')
          .insert([{
            workspace_id: workspaceId,
            name: documentName,
            content: documentContent,
            created_by: user.id
          }])
          .select()
          .single();

        if (error) throw error;
        setCurrentDocumentId(data.id);
      }
      alert('✅ Document saved successfully!');
    } catch (error) {
      console.error('Error saving document:', error);
      alert('❌ Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== TEXT FORMATTING FUNCTIONS ====================

  /**
   * Apply text formatting using document.execCommand
   * 
   * @param {string} command - Formatting command (e.g., 'bold', 'italic')
   * @param {string} [value] - Command value (e.g., color, font size)
   */
  const formatText = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  /**
   * Insert hyperlink at cursor position
   * Prompts user for URL and creates link
   */
  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      formatText('createLink', url);
    }
  }, [formatText]);

  /**
   * Insert image at cursor position
   * Prompts user for image URL and inserts image
   */
  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) {
      formatText('insertImage', url);
    }
  }, [formatText]);

  /**
   * Insert blockquote formatting
   * Wraps selected text in blockquote element
   */
  const insertBlockquote = useCallback(() => {
    formatText('formatBlock', 'blockquote');
  }, [formatText]);

  /**
   * Change font size for selected text
   * Uses CSS styling for precise control
   * 
   * @param {string} size - Font size in pixels
   */
  const changeFontSize = useCallback((size) => {
    setFontSize(size);
    formatText('fontSize', '7'); // Use size 7 (largest) and control via CSS
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size + 'px';
      range.surroundContents(span);
    }
  }, [formatText]);

  /**
   * Apply background color to selected text
   * 
   * @param {string} color - Background color in hex format
   */
  const applyBackgroundColor = useCallback((color) => {
    if (color) {
      formatText('backColor', color);
    }
  }, [formatText]);

  /**
   * Clear all formatting from selected text
   * Resets to default paragraph styling
   */
  const clearFormatting = useCallback(() => {
    formatText('removeFormat');
    formatText('formatBlock', 'p');
  }, [formatText]);

  // ==================== EXPORT FUNCTIONS ====================

  /**
   * Download document as HTML file
   * Creates downloadable HTML with basic styling
   */
  const downloadDocument = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${documentName}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; line-height: 1.6; }
          h1, h2, h3 { color: #333; }
          a { color: #7c3aed; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${editorRef.current?.innerHTML || content}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${documentName}.html`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 max-w-md"
                placeholder="Document name"
              />
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveDocument}
                disabled={isSaving}
                className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadDocument}
                className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
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

          {/* Toolbar */}
          <div className="p-3 border-b bg-gray-50 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => formatText('formatBlock', 'h1')}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Heading 1"
              >
                <Heading1 className="w-5 h-5" />
              </button>
              <button
                onClick={() => formatText('formatBlock', 'h2')}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Heading 2"
              >
                <Heading2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => formatText('formatBlock', 'h3')}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Heading 3"
              >
                <Heading3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => formatText('formatBlock', 'p')}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-sm font-medium"
                title="Normal Paragraph"
              >
                P
              </button>
            </div>

            <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => formatText('bold')}
                className="p-2 rounded hover:bg-gray-100 transition-colors font-bold"
                title="Bold"
              >
                <Bold className="w-5 h-5" />
              </button>
              <button
                onClick={() => formatText('italic')}
                className="p-2 rounded hover:bg-gray-100 transition-colors italic"
                title="Italic"
              >
                <Italic className="w-5 h-5" />
              </button>
              <button
                onClick={() => formatText('underline')}
                className="p-2 rounded hover:bg-gray-100 transition-colors underline"
                title="Underline"
              >
                <Underline className="w-5 h-5" />
              </button>
              <button
                onClick={() => formatText('strikeThrough')}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Strikethrough"
              >
                <Strikethrough className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => formatText('justifyLeft')}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Align Left"
              >
                <AlignLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => formatText('justifyCenter')}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Align Center"
              >
                <AlignCenter className="w-5 h-5" />
              </button>
              <button
                onClick={() => formatText('justifyRight')}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Align Right"
              >
                <AlignRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => formatText('insertUnorderedList')}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Bullet List"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => formatText('insertOrderedList')}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Numbered List"
              >
                <ListOrdered className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={insertLink}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Insert Link"
              >
                <LinkIcon className="w-5 h-5" />
              </button>
              <button
                onClick={insertImage}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Insert Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => formatText('formatBlock', 'pre')}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Code Block"
              >
                <Code className="w-5 h-5" />
              </button>
              <button
                onClick={insertBlockquote}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Quote"
              >
                <Quote className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
              <label className="text-sm font-medium text-gray-700 px-2">Text:</label>
              <input
                type="color"
                onChange={(e) => formatText('foreColor', e.target.value)}
                className="w-10 h-8 rounded cursor-pointer border border-gray-300"
                title="Text Color"
                defaultValue="#000000"
              />
              <label className="text-sm font-medium text-gray-500 px-2">BG (Optional):</label>
              <input
                type="color"
                onChange={(e) => applyBackgroundColor(e.target.value)}
                className="w-10 h-8 rounded cursor-pointer border border-gray-300 opacity-60 hover:opacity-100"
                title="Background Color (Optional) - Click to apply"
              />
              <button
                onClick={() => formatText('backColor', 'transparent')}
                className="text-xs px-2 py-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Remove background color"
              >
                Clear BG
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
              <label className="text-sm font-medium text-gray-700 px-2">Size:</label>
              <select
                value={fontSize}
                onChange={(e) => changeFontSize(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Font Size"
              >
                <option value="12">12px</option>
                <option value="14">14px</option>
                <option value="16">16px</option>
                <option value="18">18px</option>
                <option value="20">20px</option>
                <option value="24">24px</option>
                <option value="28">28px</option>
                <option value="32">32px</option>
                <option value="36">36px</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => formatText('undo')}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Undo"
              >
                <Undo className="w-5 h-5" />
              </button>
              <button
                onClick={() => formatText('redo')}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Redo"
              >
                <Redo className="w-5 h-5" />
              </button>
              <button
                onClick={clearFormatting}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-xs font-bold"
                title="Clear Formatting"
              >
                <Type className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-auto bg-gray-100 p-6">
            <style>{`
              .editor-content h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
              .editor-content h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
              .editor-content h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
              .editor-content blockquote { 
                border-left: 4px solid #e5e7eb; 
                padding-left: 1em; 
                margin: 1em 0; 
                color: #6b7280; 
                font-style: italic; 
              }
              .editor-content pre { 
                background-color: #f3f4f6; 
                padding: 1em; 
                border-radius: 0.5em; 
                overflow-x: auto; 
                font-family: 'Courier New', monospace; 
              }
              .editor-content ul { list-style-type: disc; padding-left: 2em; }
              .editor-content ol { list-style-type: decimal; padding-left: 2em; }
              .editor-content a { color: #3b82f6; text-decoration: underline; }
              .editor-content img { max-width: 100%; height: auto; border-radius: 0.5em; }
            `}</style>
            <div
              ref={editorRef}
              contentEditable
              className="editor-content bg-white shadow-lg mx-auto p-12 min-h-[600px] max-w-4xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                fontSize: '16px',
                lineHeight: '1.6',
                fontFamily: 'Georgia, serif'
              }}
              onInput={(e) => setContent(e.currentTarget.innerHTML)}
              suppressContentEditableWarning
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DocumentEditor;
