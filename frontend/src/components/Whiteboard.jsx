import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Pencil, 
  Eraser, 
  Square, 
  Circle, 
  Minus,
  Save,
  Download,
  Trash2,
  Undo,
  Redo,
  Type,
  ArrowRight,
  Highlighter,
  StickyNote,
  Grid3x3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const Whiteboard = ({ workspaceId, isOpen, onClose, whiteboardId = null }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [canvasData, setCanvasData] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [whiteboardName, setWhiteboardName] = useState('Untitled Whiteboard');
  const [currentWhiteboardId, setCurrentWhiteboardId] = useState(whiteboardId);
  const [isSaving, setIsSaving] = useState(false);
  const [fillShape, setFillShape] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState(null);
  const [stickyNotes, setStickyNotes] = useState([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { user } = useAuth();

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008000', '#FFC0CB', '#A52A2A'
  ];

  useEffect(() => {
    if (isOpen && currentWhiteboardId) {
      loadWhiteboard();
    }
  }, [isOpen, currentWhiteboardId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }
    
    canvasData.forEach((item, index) => {
      drawItem(ctx, item);
      
      // Draw selection box around selected item
      if (index === selectedItemIndex && tool === 'select') {
        drawSelectionBox(ctx, item);
      }
    });
  }, [canvasData, showGrid, selectedItemIndex, tool]);

  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    const gridSize = 30;
    
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawSelectionBox = (ctx, item) => {
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    if (item.type === 'text') {
      ctx.font = `${item.fontSize || 20}px Arial`;
      const textWidth = ctx.measureText(item.text).width;
      const textHeight = item.fontSize || 20;
      ctx.strokeRect(item.x - 5, item.y - textHeight - 5, textWidth + 10, textHeight + 10);
    } else if (item.type === 'rectangle') {
      ctx.strokeRect(item.x - 5, item.y - 5, item.width + 10, item.height + 10);
    } else if (item.type === 'circle') {
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius + 5, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (item.type === 'line' || item.type === 'arrow') {
      const minX = Math.min(item.startX, item.endX) - 5;
      const minY = Math.min(item.startY, item.endY) - 5;
      const maxX = Math.max(item.startX, item.endX) + 5;
      const maxY = Math.max(item.startY, item.endY) + 5;
      ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    } else if (item.points && item.points.length > 0) {
      const xs = item.points.map(p => p.x);
      const ys = item.points.map(p => p.y);
      const minX = Math.min(...xs) - 5;
      const minY = Math.min(...ys) - 5;
      const maxX = Math.max(...xs) + 5;
      const maxY = Math.max(...ys) + 5;
      ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    }
    
    ctx.setLineDash([]);
  };

  const loadWhiteboard = async () => {
    try {
      const { data, error } = await supabase
        .from('whiteboards')
        .select('*')
        .eq('id', currentWhiteboardId)
        .single();

      if (!error && data) {
        setWhiteboardName(data.name);
        setCanvasData(data.canvas_data || []);
      }
    } catch (error) {
      console.error('Error loading whiteboard:', error);
    }
  };

  const saveWhiteboard = async () => {
    setIsSaving(true);
    
    const timeoutId = setTimeout(() => {
      console.error('TIMEOUT: Whiteboard save taking too long (10s)');
      alert('❌ Save timed out. Check if whiteboards table exists in Supabase.');
      setIsSaving(false);
    }, 10000);
    
    try {
      console.log('Saving whiteboard...', {
        currentWhiteboardId,
        workspaceId,
        userId: user?.id,
        dataLength: canvasData.length
      });
      
      if (currentWhiteboardId) {
        // Update existing whiteboard
        const { error } = await supabase
          .from('whiteboards')
          .update({ 
            canvas_data: canvasData,
            name: whiteboardName 
          })
          .eq('id', currentWhiteboardId);

        clearTimeout(timeoutId);
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
      } else {
        // Create new whiteboard
        const { data, error } = await supabase
          .from('whiteboards')
          .insert([{
            workspace_id: workspaceId,
            name: whiteboardName,
            canvas_data: canvasData,
            created_by: user.id
          }])
          .select()
          .single();

        clearTimeout(timeoutId);
        if (error) {
          console.error('Insert error:', error);
          console.error('Error code:', error.code);
          console.error('Error details:', error.details);
          throw error;
        }
        setCurrentWhiteboardId(data.id);
      }
      alert('✅ Whiteboard saved successfully!');
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error saving whiteboard:', error);
      alert(`❌ Failed to save whiteboard: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const drawItem = (ctx, item) => {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = item.lineWidth;
    ctx.globalAlpha = item.type === 'highlighter' ? 0.3 : 1;

    switch (item.type) {
      case 'pen':
      case 'eraser':
      case 'highlighter':
        ctx.strokeStyle = item.type === 'eraser' ? '#FFFFFF' : item.color;
        ctx.lineWidth = item.type === 'highlighter' ? item.lineWidth * 3 : item.lineWidth;
        ctx.beginPath();
        ctx.moveTo(item.points[0].x, item.points[0].y);
        item.points.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(item.startX, item.startY);
        ctx.lineTo(item.endX, item.endY);
        ctx.stroke();
        break;

      case 'arrow':
        ctx.beginPath();
        ctx.moveTo(item.startX, item.startY);
        ctx.lineTo(item.endX, item.endY);
        ctx.stroke();
        
        // Draw arrowhead
        const angle = Math.atan2(item.endY - item.startY, item.endX - item.startX);
        const arrowLength = 15;
        ctx.beginPath();
        ctx.moveTo(item.endX, item.endY);
        ctx.lineTo(
          item.endX - arrowLength * Math.cos(angle - Math.PI / 6),
          item.endY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(item.endX, item.endY);
        ctx.lineTo(
          item.endX - arrowLength * Math.cos(angle + Math.PI / 6),
          item.endY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;

      case 'rectangle':
        if (item.filled) {
          ctx.fillStyle = item.color;
          ctx.fillRect(item.x, item.y, item.width, item.height);
        }
        ctx.strokeRect(item.x, item.y, item.width, item.height);
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, 2 * Math.PI);
        if (item.filled) {
          ctx.fillStyle = item.color;
          ctx.fill();
        }
        ctx.stroke();
        break;
        
      case 'text':
        ctx.globalAlpha = 1;
        ctx.font = `${item.fontSize || 20}px Arial`;
        ctx.fillStyle = item.color;
        ctx.fillText(item.text, item.x, item.y);
        break;
    }
    
    ctx.globalAlpha = 1;
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (tool === 'select') {
      // Check if clicking on an existing item
      const clickedIndex = findItemAtPosition(x, y);
      if (clickedIndex !== -1) {
        setSelectedItemIndex(clickedIndex);
        setIsDragging(true);
        const item = canvasData[clickedIndex];
        // Calculate offset for smooth dragging
        if (item.type === 'text') {
          setDragOffset({ x: x - item.x, y: y - item.y });
        } else if (item.type === 'rectangle') {
          setDragOffset({ x: x - item.x, y: y - item.y });
        } else if (item.type === 'circle') {
          setDragOffset({ x: x - item.x, y: y - item.y });
        } else if (item.points) {
          setDragOffset({ x: x - item.points[0].x, y: y - item.points[0].y });
        } else {
          setDragOffset({ x: x - item.startX, y: y - item.startY });
        }
      } else {
        setSelectedItemIndex(null);
      }
      return;
    }

    if (tool === 'text') {
      setTextPosition({ x, y });
      return;
    }

    setIsDrawing(true);

    if (tool === 'pen' || tool === 'eraser' || tool === 'highlighter') {
      const newItem = {
        type: tool,
        color: color,
        lineWidth: lineWidth,
        points: [{ x, y }]
      };
      setCanvasData(prev => [...prev, newItem]);
    } else {
      const newItem = {
        type: tool,
        color: color,
        lineWidth: lineWidth,
        filled: fillShape,
        startX: x,
        startY: y,
        x: x,
        y: y
      };
      setCanvasData(prev => [...prev, newItem]);
    }
  };

  const findItemAtPosition = (x, y) => {
    // Search from end to start (top items first)
    for (let i = canvasData.length - 1; i >= 0; i--) {
      const item = canvasData[i];
      
      if (item.type === 'text') {
        const ctx = canvasRef.current.getContext('2d');
        ctx.font = `${item.fontSize || 20}px Arial`;
        const textWidth = ctx.measureText(item.text).width;
        const textHeight = item.fontSize || 20;
        if (x >= item.x && x <= item.x + textWidth && 
            y >= item.y - textHeight && y <= item.y) {
          return i;
        }
      } else if (item.type === 'rectangle') {
        if (x >= item.x && x <= item.x + item.width && 
            y >= item.y && y <= item.y + item.height) {
          return i;
        }
      } else if (item.type === 'circle') {
        const dx = x - item.x;
        const dy = y - item.y;
        if (Math.sqrt(dx * dx + dy * dy) <= item.radius) {
          return i;
        }
      } else if (item.type === 'line' || item.type === 'arrow') {
        // Check if point is near the line
        const dist = distanceToLine(x, y, item.startX, item.startY, item.endX, item.endY);
        if (dist < 10) {
          return i;
        }
      } else if (item.points) {
        // For pen/eraser/highlighter strokes
        for (let point of item.points) {
          const dx = x - point.x;
          const dy = y - point.y;
          if (Math.sqrt(dx * dx + dy * dy) < 10) {
            return i;
          }
        }
      }
    }
    return -1;
  };

  const distanceToLine = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq !== 0 ? dot / lenSq : -1;
    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const draw = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    // Handle dragging selected item
    if (tool === 'select' && isDragging && selectedItemIndex !== null) {
      setCanvasData(prev => {
        const newData = [...prev];
        const item = newData[selectedItemIndex];
        const newX = x - dragOffset.x;
        const newY = y - dragOffset.y;

        if (item.type === 'text') {
          item.x = newX;
          item.y = newY;
        } else if (item.type === 'rectangle') {
          item.x = newX;
          item.y = newY;
        } else if (item.type === 'circle') {
          item.x = newX;
          item.y = newY;
        } else if (item.type === 'line' || item.type === 'arrow') {
          const dx = newX - item.startX;
          const dy = newY - item.startY;
          item.startX = newX;
          item.startY = newY;
          item.endX += dx;
          item.endY += dy;
        } else if (item.points) {
          // Move all points for pen/eraser/highlighter
          const dx = newX - item.points[0].x;
          const dy = newY - item.points[0].y;
          item.points = item.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
        }

        return newData;
      });
      return;
    }

    if (!isDrawing) return;

    setCanvasData(prev => {
      const newData = [...prev];
      const currentItem = newData[newData.length - 1];

      if (tool === 'pen' || tool === 'eraser' || tool === 'highlighter') {
        currentItem.points.push({ x, y });
      } else if (tool === 'line' || tool === 'arrow') {
        currentItem.endX = x;
        currentItem.endY = y;
      } else if (tool === 'rectangle') {
        currentItem.width = x - currentItem.startX;
        currentItem.height = y - currentItem.startY;
      } else if (tool === 'circle') {
        const dx = x - currentItem.startX;
        const dy = y - currentItem.startY;
        currentItem.radius = Math.sqrt(dx * dx + dy * dy);
      }

      return newData;
    });
  }, [isDrawing, tool, zoom, isDragging, selectedItemIndex, dragOffset]);

  const stopDrawing = () => {
    if (isDrawing || isDragging) {
      setHistory(prev => [...prev.slice(0, historyStep + 1), [...canvasData]]);
      setHistoryStep(prev => prev + 1);
    }
    setIsDrawing(false);
    setIsDragging(false);
  };

  const handleTextSubmit = () => {
    if (textInput.trim() && textPosition) {
      const newItem = {
        type: 'text',
        text: textInput,
        x: textPosition.x,
        y: textPosition.y,
        color: color,
        fontSize: lineWidth * 5
      };
      setCanvasData(prev => [...prev, newItem]);
      setHistory(prev => [...prev.slice(0, historyStep + 1), [...canvasData, newItem]]);
      setHistoryStep(prev => prev + 1);
      setTextInput('');
      setTextPosition(null);
    }
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(prev => prev - 1);
      setCanvasData(history[historyStep - 1]);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(prev => prev + 1);
      setCanvasData(history[historyStep + 1]);
    }
  };

  const clearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the entire whiteboard?')) {
      setCanvasData([]);
      setHistory([[[]]]);
      setHistoryStep(0);
      setSelectedItemIndex(null);
    }
  };

  const deleteSelectedItem = () => {
    if (selectedItemIndex !== null) {
      const newData = canvasData.filter((_, i) => i !== selectedItemIndex);
      setCanvasData(newData);
      setHistory(prev => [...prev.slice(0, historyStep + 1), newData]);
      setHistoryStep(prev => prev + 1);
      setSelectedItemIndex(null);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${whiteboardName}.png`;
    link.href = url;
    link.click();
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
          <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <input
                type="text"
                value={whiteboardName}
                onChange={(e) => setWhiteboardName(e.target.value)}
                className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 max-w-md"
                placeholder="Whiteboard name"
              />
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveWhiteboard}
                disabled={isSaving}
                className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
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
          <div className="p-4 border-b bg-gray-50 flex items-center gap-4 flex-wrap">
            {/* Selection and Drawing Tools */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow">
              <button
                onClick={() => {
                  setTool('select');
                  setSelectedItemIndex(null);
                }}
                className={`p-2 rounded transition-colors ${tool === 'select' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                title="Select and Move"
              >
                <Move className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-300" />
              <button
                onClick={() => setTool('pen')}
                className={`p-2 rounded transition-colors ${tool === 'pen' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                title="Pen"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTool('highlighter')}
                className={`p-2 rounded transition-colors ${tool === 'highlighter' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                title="Highlighter"
              >
                <Highlighter className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`p-2 rounded transition-colors ${tool === 'eraser' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                title="Eraser"
              >
                <Eraser className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-300" />
              <button
                onClick={() => setTool('line')}
                className={`p-2 rounded transition-colors ${tool === 'line' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                title="Line"
              >
                <Minus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTool('arrow')}
                className={`p-2 rounded transition-colors ${tool === 'arrow' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                title="Arrow"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTool('rectangle')}
                className={`p-2 rounded transition-colors ${tool === 'rectangle' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                title="Rectangle"
              >
                <Square className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTool('circle')}
                className={`p-2 rounded transition-colors ${tool === 'circle' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                title="Circle"
              >
                <Circle className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-300" />
              <button
                onClick={() => setTool('text')}
                className={`p-2 rounded transition-colors ${tool === 'text' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                title="Text"
              >
                <Type className="w-5 h-5" />
              </button>
            </div>

            {/* Fill option for shapes */}
            {(tool === 'rectangle' || tool === 'circle') && (
              <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fillShape}
                    onChange={(e) => setFillShape(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Fill</span>
                </label>
              </div>
            )}

            {/* Colors */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    color === c ? 'border-purple-600 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow">
              <label className="text-sm font-medium text-gray-700">
                {tool === 'pen' && 'Pen Size:'}
                {tool === 'eraser' && 'Eraser Size:'}
                {tool === 'highlighter' && 'Highlighter:'}
                {tool === 'text' && 'Text Size:'}
                {!['pen', 'eraser', 'highlighter', 'text'].includes(tool) && 'Line Width:'}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="w-24"
                title={`Adjust ${tool} size`}
              />
              <span className="text-sm text-gray-600 w-8">{lineWidth}px</span>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow">
              <button
                onClick={undo}
                disabled={historyStep <= 0}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo"
              >
                <Undo className="w-5 h-5" />
              </button>
              <button
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo"
              >
                <Redo className="w-5 h-5" />
              </button>
              {selectedItemIndex !== null && (
                <>
                  <div className="w-px h-6 bg-gray-300" />
                  <button
                    onClick={deleteSelectedItem}
                    className="p-2 rounded hover:bg-red-100 text-red-600"
                    title="Delete Selected"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
              <div className="w-px h-6 bg-gray-300" />
              <button
                onClick={clearCanvas}
                className="p-2 rounded hover:bg-red-100 text-red-600"
                title="Clear All"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded transition-colors ${showGrid ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                title="Toggle Grid"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="p-2 rounded hover:bg-gray-100"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                className="p-2 rounded hover:bg-gray-100"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-2 rounded hover:bg-gray-100"
                title="Reset Zoom"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow">
              <button
                onClick={downloadImage}
                className="p-2 rounded hover:bg-gray-100"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-gray-100 p-4">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
              <canvas
                ref={canvasRef}
                width={1200}
                height={800}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className={`bg-white shadow-lg mx-auto rounded-lg ${
                  tool === 'select' ? 'cursor-move' :
                  tool === 'text' ? 'cursor-text' :
                  tool === 'eraser' ? 'cursor-cell' :
                  'cursor-crosshair'
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* Text Input Modal */}
        {textPosition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-6 z-50"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Text</h3>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTextSubmit();
                if (e.key === 'Escape') setTextPosition(null);
              }}
              placeholder="Type your text here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTextSubmit}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Text
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTextPosition(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Whiteboard;
