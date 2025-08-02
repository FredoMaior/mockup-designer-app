import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import FreepikSearch from './components/FreepikSearch.jsx'
import {
  Upload, Download, Palette, Shirt, Image as ImageIcon, Zap,
  Type, Square, Circle, RotateCw, Move, ZoomIn, ZoomOut,
  Layers, Eye, EyeOff, Lock, Unlock, Trash2, Copy,
  Settings, Save, Undo, Redo, Grid, AlignCenter, Search,
  Paintbrush, Droplet, Minus, Plus, MoreHorizontal,
  FlipHorizontal, FlipVertical, RotateCcw, Maximize,
  MousePointer, Hand, Crop, Filter, Sliders, Maximize2,
  AlertTriangle
} from 'lucide-react'
import './App.css'

// Import mockup templates
import flatLayTshirt from './assets/mockup_templates/flat_lay_tshirt_mockup.png'
import hangingTshirt from './assets/mockup_templates/hanging_tshirt_mockup.png'
import frontBackTshirt from './assets/mockup_templates/front_back_tshirt_mockup.png'
import modelWearingTshirt from './assets/mockup_templates/model_wearing_tshirt_mockup.png'
import hoodieFlat from './assets/mockup_templates/hoodie_flat_mockup.png'
import tankTop from './assets/mockup_templates/tank_top_mockup.png'
import poloShirt from './assets/mockup_templates/polo_shirt_mockup.png'
import longSleeve from './assets/mockup_templates/long_sleeve_mockup.png'

const mockupTemplates = [
  { 
    id: 'flat-tshirt', 
    name: 'Flat Lay T-Shirt', 
    image: flatLayTshirt, 
    category: 't-shirt', 
    aspectRatio: 1.0,
    printableArea: { x: 25, y: 30, width: 50, height: 40 } // Printable area as percentage of canvas
  },
  { 
    id: 'hanging-tshirt', 
    name: 'Hanging T-Shirt', 
    image: hangingTshirt, 
    category: 't-shirt', 
    aspectRatio: 0.8,
    printableArea: { x: 30, y: 25, width: 40, height: 50 }
  },
  { 
    id: 'front-back-tshirt', 
    name: 'Front & Back T-Shirt', 
    image: frontBackTshirt, 
    category: 't-shirt', 
    aspectRatio: 1.6,
    printableArea: { x: 15, y: 30, width: 30, height: 40 }
  },
  { 
    id: 'model-tshirt', 
    name: 'Model Wearing T-Shirt', 
    image: modelWearingTshirt, 
    category: 't-shirt', 
    aspectRatio: 0.75,
    printableArea: { x: 35, y: 35, width: 30, height: 30 }
  },
  { 
    id: 'hoodie-flat', 
    name: 'Flat Lay Hoodie', 
    image: hoodieFlat, 
    category: 'hoodie', 
    aspectRatio: 1.0,
    printableArea: { x: 25, y: 35, width: 50, height: 30 }
  },
  { 
    id: 'tank-top', 
    name: 'Tank Top', 
    image: tankTop, 
    category: 'tank-top', 
    aspectRatio: 0.9,
    printableArea: { x: 30, y: 30, width: 40, height: 40 }
  },
  { 
    id: 'polo-shirt', 
    name: 'Polo Shirt', 
    image: poloShirt, 
    category: 'polo', 
    aspectRatio: 0.85,
    printableArea: { x: 30, y: 35, width: 40, height: 30 }
  },
  { 
    id: 'long-sleeve', 
    name: 'Long Sleeve T-Shirt', 
    image: longSleeve, 
    category: 't-shirt', 
    aspectRatio: 0.9,
    printableArea: { x: 30, y: 30, width: 40, height: 40 }
  }
]

const productCategories = [
  { id: 't-shirt', name: 'T-Shirts', icon: Shirt },
  { id: 'hoodie', name: 'Hoodies', icon: Shirt },
  { id: 'tank-top', name: 'Tank Tops', icon: Shirt },
  { id: 'polo', name: 'Polo Shirts', icon: Shirt }
]

const fontFamilies = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
  'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Palatino'
]

const fontWeights = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
  { value: '300', label: 'Light' },
  { value: '600', label: 'Semi Bold' },
  { value: '900', label: 'Black' }
]

// Constants for actual t-shirt dimensions in cm
const TSHIRT_WIDTH_CM = 45
const TSHIRT_HEIGHT_CM = 55

function App() {
  const [selectedTemplate, setSelectedTemplate] = useState(mockupTemplates[0])
  const [selectedCategory, setSelectedCategory] = useState('t-shirt')
  const [uploadedDesign, setUploadedDesign] = useState(null)
  const [designLayers, setDesignLayers] = useState([])
  const [selectedLayer, setSelectedLayer] = useState(null)
  const [canvasZoom, setCanvasZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const [activeTool, setActiveTool] = useState('select') // Always set to 'select' by default
  const [freepikApiKey, setFreepikApiKey] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const fileInputRef = useRef(null)
  const savedDesignId = useRef(null)
  const canvasRef = useRef(null)

  // Advanced state for Lumise-like features
  const [textEditMode, setTextEditMode] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [dragLayerId, setDragLayerId] = useState(null)

  // Resize state
  const [isResizing, setIsResizing] = useState(false)
  const [resizeLayerId, setResizeLayerId] = useState(null)
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 })
  const [resizeStartSize, setResizeStartSize] = useState(0)

  // Image dimensions state for aspect ratio calculation
  const [imageDimensions, setImageDimensions] = useState({})

  // Printable area warning state
  const [showPrintableArea, setShowPrintableArea] = useState(true)
  const [outOfBoundsLayers, setOutOfBoundsLayers] = useState([])

  // Function to check if a layer is within printable area
  const isLayerInPrintableArea = useCallback((layer) => {
    const printableArea = selectedTemplate.printableArea
    
    // Calculate layer bounds
    const layerLeft = layer.position.x - (layer.size / 2)
    const layerRight = layer.position.x + (layer.size / 2)
    const layerTop = layer.position.y - (layer.size / 2)
    const layerBottom = layer.position.y + (layer.size / 2)
    
    // Check if layer is completely within printable area
    const withinBounds = 
      layerLeft >= printableArea.x &&
      layerRight <= printableArea.x + printableArea.width &&
      layerTop >= printableArea.y &&
      layerBottom <= printableArea.y + printableArea.height
    
    return withinBounds
  }, [selectedTemplate.printableArea])

  // Function to check all layers and update out of bounds list
  const checkLayerBounds = useCallback(() => {
    const outOfBounds = designLayers.filter(layer => 
      layer.visible && !isLayerInPrintableArea(layer)
    )
    setOutOfBoundsLayers(outOfBounds)
  }, [designLayers, isLayerInPrintableArea])

  // Function to calculate size in centimeters based on T-shirt dimensions
  const calculateSizeInCm = useCallback((sizePercent, dimensionType) => {
    const canvasWidth = 500; // Fixed canvas width in pixels
    const canvasHeight = Math.round(canvasWidth / selectedTemplate.aspectRatio); // Dynamic canvas height in pixels

    // Calculate the actual pixel size of the layer based on its percentage size
    const layerPixelWidth = (sizePercent / 100) * canvasWidth;
    
    // Convert pixel width to cm based on TSHIRT_WIDTH_CM
    const widthCm = (layerPixelWidth / canvasWidth) * TSHIRT_WIDTH_CM;

    if (dimensionType === 'width') {
      return widthCm.toFixed(1);
    } else if (dimensionType === 'height') {
      // For height, we need to consider the layer's aspect ratio
      const layer = designLayers.find(l => l.id === resizeLayerId || l.id === dragLayerId || l.id === selectedLayer);
      if (layer) {
        if (layer.type === 'image' || layer.type === 'freepik-vector') {
          const dimensions = imageDimensions[layer.id];
          if (dimensions) {
            const aspectRatio = dimensions.width / dimensions.height;
            return (widthCm / aspectRatio).toFixed(1);
          }
        } else if (layer.type === 'text') {
          // Approximate text height calculation: font size * line height
          const textHeightRatio = layer.lineHeight || 1.2;
          // This is a rough approximation, actual text height depends on content and font metrics
          return (widthCm * textHeightRatio * 0.6).toFixed(1); 
        } else if (layer.type === 'shape') {
          // For shapes, assume square for simplicity or adjust based on shapeType
          return widthCm.toFixed(1);
        }
      }
      // Fallback if layer not found or type not handled
      return widthCm.toFixed(1); // Default to square if aspect ratio unknown
    }
    return "0.0"; // Should not happen
  }, [selectedTemplate.aspectRatio, designLayers, resizeLayerId, dragLayerId, selectedLayer, imageDimensions]);

  // Function to calculate width and height based on aspect ratio
  const calculateDimensions = useCallback((layer) => {
    const widthCm = calculateSizeInCm(layer.size, 'width');
    let heightCm = calculateSizeInCm(layer.size, 'height'); // Use the height calculation from calculateSizeInCm

    // If it's an image or freepik vector, use its natural aspect ratio
    if (layer.type === 'image' || layer.type === 'freepik-vector') {
      const dimensions = imageDimensions[layer.id];
      if (dimensions) {
        const aspectRatio = dimensions.width / dimensions.height;
        heightCm = (parseFloat(widthCm) / aspectRatio).toFixed(1);
      }
    } else if (layer.type === 'text') {
      // For text, use the approximated height calculation
      const textHeightRatio = layer.lineHeight || 1.2;
      heightCm = (parseFloat(widthCm) * textHeightRatio * 0.6).toFixed(1); // 0.6 is an approximation factor
    }
    // For shapes, heightCm is already calculated as widthCm by default in calculateSizeInCm

    return { width: widthCm, height: heightCm };
  }, [calculateSizeInCm, imageDimensions]);

  // Function to load image dimensions
  const loadImageDimensions = useCallback((layer) => {
    if (layer.type === 'image' || layer.type === 'freepik-vector') {
      const img = new Image()
      img.onload = () => {
        setImageDimensions(prev => ({
          ...prev,
          [layer.id]: { width: img.naturalWidth, height: img.naturalHeight }
        }))
      }
      img.src = layer.src
    }
  }, [])

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newLayer = {
          id: Date.now(),
          type: 'image',
          name: file.name,
          src: e.target.result,
          visible: true,
          locked: false,
          position: { x: 50, y: 50 },
          size: 30,
          rotation: 0,
          opacity: 100,
          flipX: false,
          flipY: false
        }
        setDesignLayers(prev => [...prev, newLayer])
        setSelectedLayer(newLayer.id)
        setUploadedDesign(e.target.result)
        loadImageDimensions(newLayer)
        saveToHistory()
      }
      reader.readAsDataURL(file)
    }
  }, [loadImageDimensions])

  const handleFreepikVector = useCallback((vectorData) => {
    const newLayer = {
      id: Date.now(),
      type: 'freepik-vector',
      name: vectorData.title,
      src: vectorData.url,
      visible: true,
      locked: false,
      position: { x: 50, y: 50 },
      size: 25,
      rotation: 0,
      opacity: 100,
      flipX: false,
      flipY: false,
      freepikId: vectorData.id,
      author: vectorData.author
    }
    setDesignLayers(prev => [...prev, newLayer])
    setSelectedLayer(newLayer.id)
    loadImageDimensions(newLayer)
    saveToHistory()
  }, [loadImageDimensions])

  const handleTemplateSelect = useCallback((template) => {
    setSelectedTemplate(template)
  }, [])

  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategory(categoryId)
  }, [])

  const addTextLayer = useCallback(() => {
    const newLayer = {
      id: Date.now(),
      type: 'text',
      name: 'Text Layer',
      content: 'Your Text Here',
      visible: true,
      locked: false,
      position: { x: 50, y: 40 },
      size: 20,
      rotation: 0,
      opacity: 100,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: selectedColor,
      textAlign: 'center',
      letterSpacing: 0,
      lineHeight: 1.2,
      textDecoration: 'none',
      textTransform: 'none',
      flipX: false,
      flipY: false
    }
    setDesignLayers(prev => [...prev, newLayer])
    setSelectedLayer(newLayer.id)
    setTextEditMode(true)
    saveToHistory()
  }, [selectedColor])

  const addShape = useCallback((shapeType) => {
    const newLayer = {
      id: Date.now(),
      type: 'shape',
      name: `${shapeType} Shape`,
      shapeType: shapeType,
      visible: true,
      locked: false,
      position: { x: 50, y: 50 },
      size: 20,
      rotation: 0,
      opacity: 100,
      fillColor: selectedColor,
      strokeColor: '#000000',
      strokeWidth: 2,
      flipX: false,
      flipY: false
    }
    setDesignLayers(prev => [...prev, newLayer])
    setSelectedLayer(newLayer.id)
    saveToHistory()
  }, [selectedColor])

  const toggleLayerVisibility = useCallback((layerId) => {
    setDesignLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ))
    saveToHistory()
  }, [])

  const toggleLayerLock = useCallback((layerId) => {
    setDesignLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    ))
  }, [])

  const deleteLayer = useCallback((layerId) => {
    setDesignLayers(prev => prev.filter(layer => layer.id !== layerId))
    if (selectedLayer === layerId) {
      setSelectedLayer(null)
    }
    // Remove image dimensions for deleted layer
    setImageDimensions(prev => {
      const newDimensions = { ...prev }
      delete newDimensions[layerId]
      return newDimensions
    })
    saveToHistory()
  }, [selectedLayer])

  const duplicateLayer = useCallback((layerId) => {
    const layerToDuplicate = designLayers.find(layer => layer.id === layerId)
    if (layerToDuplicate) {
      const newLayer = {
        ...layerToDuplicate,
        id: Date.now(),
        name: `${layerToDuplicate.name} Copy`,
        position: {
          x: layerToDuplicate.position.x + 5,
          y: layerToDuplicate.position.y + 5
        }
      }
      setDesignLayers(prev => [...prev, newLayer])
      setSelectedLayer(newLayer.id)
      loadImageDimensions(newLayer)
      saveToHistory()
    }
  }, [designLayers, loadImageDimensions])

  const updateSelectedLayer = useCallback((updates) => {
    if (!selectedLayer) return
    setDesignLayers(prev => prev.map(layer =>
      layer.id === selectedLayer ? { ...layer, ...updates } : layer
    ))
  }, [selectedLayer])

  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.stringify(designLayers))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex, designLayers])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setDesignLayers(JSON.parse(history[newIndex]))
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setDesignLayers(JSON.parse(history[newIndex]))
    }
  }, [history, historyIndex])

  const handleDownload = useCallback(() => {
    alert('Mockup download functionality would be implemented here with API integration')
  }, [])

  const handleSaveDesign = useCallback(() => {
    const designData = JSON.stringify(designLayers);
    console.log('Design saved:', designData);

    const newDesignId = `design_${Date.now()}`;
    savedDesignId.current = newDesignId;

    if (window.parent) {
      window.parent.postMessage({
        type: 'designSaved',
        payload: {
          designId: newDesignId,
          designData: designData
        }
      }, '*');
    }
    alert('Design Saved! You can now add it to cart.');
  }, [designLayers]);

  const handleAddToCart = useCallback(() => {
    if (!savedDesignId.current) {
      alert('Please save your design first!');
      return;
    }

    if (window.parent) {
      window.parent.postMessage({
        type: 'addToCart',
        payload: {
          designId: savedDesignId.current,
        }
      }, '*');
    }
    alert('Adding design to cart via Wix Studio...');
  }, []);

  // Improved drag and drop handlers
  const handleLayerMouseDown = useCallback((e, layerId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const layer = designLayers.find(l => l.id === layerId);
    if (!layer || layer.locked) return;

    setSelectedLayer(layerId);
    setIsDragging(true);
    setDragLayerId(layerId);
    
    // Store initial mouse position
    setDragStartPos({
      x: e.clientX,
      y: e.clientY
    });
  }, [designLayers]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (isDragging && dragLayerId && canvasRef.current) {
      e.preventDefault();
      
      const canvas = canvasRef.current;
      const canvasRect = canvas.getBoundingClientRect();
      
      // Calculate mouse position relative to canvas
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      // Convert to percentage
      const newX = Math.max(0, Math.min(100, (mouseX / canvasRect.width) * 100));
      const newY = Math.max(0, Math.min(100, (mouseY / canvasRect.height) * 100));
      
      // Update layer position
      setDesignLayers(prev => prev.map(layer =>
        layer.id === dragLayerId 
          ? { ...layer, position: { x: newX, y: newY } }
          : layer
      ));
    }

    if (isResizing && resizeLayerId && canvasRef.current) {
      e.preventDefault();
      
      const canvas = canvasRef.current;
      const canvasRect = canvas.getBoundingClientRect();
      
      // Calculate distance from start position
      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;
      const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Convert to size change (adjust sensitivity)
      const sizeChange = (delta / canvasRect.width) * 100;
      const newSize = Math.max(5, Math.min(100, resizeStartSize + (deltaX > 0 ? sizeChange : -sizeChange)));
      
      // Update layer size
      setDesignLayers(prev => prev.map(layer =>
        layer.id === resizeLayerId 
          ? { ...layer, size: newSize }
          : layer
      ));
    }
  }, [isDragging, dragLayerId, isResizing, resizeLayerId, resizeStartPos, resizeStartSize]);

  const handleCanvasMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragLayerId(null);
      setDragStartPos({ x: 0, y: 0 });
      saveToHistory();
    }
    if (isResizing) {
      setIsResizing(false);
      setResizeLayerId(null);
      setResizeStartPos({ x: 0, y: 0 });
      setResizeStartSize(0);
      saveToHistory();
    }
  }, [isDragging, isResizing, saveToHistory]);

  // Resize handle mouse down
  const handleResizeMouseDown = useCallback((e, layerId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const layer = designLayers.find(l => l.id === layerId);
    if (!layer || layer.locked) return;

    setIsResizing(true);
    setResizeLayerId(layerId);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize(layer.size);
  }, [designLayers]);

  // Add event listeners for mouse events
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleCanvasMouseMove);
      document.addEventListener('mouseup', handleCanvasMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleCanvasMouseMove);
        document.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isDragging, isResizing, handleCanvasMouseMove, handleCanvasMouseUp]);

  // Load image dimensions for existing layers
  useEffect(() => {
    designLayers.forEach(layer => {
      if ((layer.type === 'image' || layer.type === 'freepik-vector') && !imageDimensions[layer.id]) {
        loadImageDimensions(layer)
      }
    })
  }, [designLayers, imageDimensions, loadImageDimensions])

  // Check layer bounds whenever layers change
  useEffect(() => {
    checkLayerBounds()
  }, [designLayers, selectedTemplate, checkLayerBounds])

  const filteredTemplates = mockupTemplates.filter(template =>
    selectedCategory === 'all' || template.category === selectedCategory
  )

  const selectedLayerData = designLayers.find(layer => layer.id === selectedLayer)

  // Calculate canvas dimensions based on selected template
  const canvasWidth = 500
  const canvasHeight = Math.round(canvasWidth / selectedTemplate.aspectRatio)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Shirt className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Product Designer Pro</h1>
                <p className="text-sm text-gray-600">Professional apparel customization tool with Freepik integration</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Input
                placeholder="Freepik API Key"
                value={freepikApiKey}
                onChange={(e) => setFreepikApiKey(e.target.value)}
                className="w-48 text-xs"
                type="password"
              />
              <Button 
                variant={showPrintableArea ? "default" : "outline"} 
                size="sm" 
                onClick={() => setShowPrintableArea(!showPrintableArea)}
              >
                <Grid className="h-4 w-4 mr-2" />
                Print Area
              </Button>
              <Button variant="outline" size="sm" onClick={handleSaveDesign}>
                <Save className="h-4 w-4 mr-2" />
                Save Design
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleAddToCart}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Dodaj do Koszyka
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
              >
                <Undo className="h-4 w-4 mr-2" />
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo className="h-4 w-4 mr-2" />
                Redo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Out of bounds warning */}
      {outOfBoundsLayers.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> {outOfBoundsLayers.length} element(s) are outside the printable area and may not appear on the final product.
              </p>
              <p className="text-xs text-red-600 mt-1">
                Elements outside the print area: {outOfBoundsLayers.map(layer => layer.name).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-80px)]">

        {/* Left Sidebar - Tools & Assets */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">

          {/* Tabs for different tools - removed the tool selection menu */}
          <div className="p-4 border-b border-gray-200">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="upload" className="text-xs">
                  <Upload className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="freepik" className="text-xs">
                  <Search className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="text" className="text-xs">
                  <Type className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="shapes" className="text-xs">
                  <Square className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="templates" className="text-xs">
                  <Shirt className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Upload Design</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload</p>
                      <p className="text-xs text-gray-500">PNG, JPG, SVG</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="freepik" className="mt-4">
                <FreepikSearch
                  onSelectVector={handleFreepikVector}
                  apiKey={freepikApiKey}
                />
              </TabsContent>

              <TabsContent value="text" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Text Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={addTextLayer} className="w-full">
                      <Type className="h-4 w-4 mr-2" />
                      Add Text Layer
                    </Button>

                    {selectedLayerData?.type === 'text' && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        <div>
                          <label className="block text-xs font-medium mb-1">Font Family</label>
                          <select
                            value={selectedLayerData.fontFamily}
                            onChange={(e) => updateSelectedLayer({ fontFamily: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            {fontFamilies.map(font => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Font Size</label>
                          <Input
                            type="number"
                            value={selectedLayerData.size}
                            onChange={(e) => updateSelectedLayer({ size: parseInt(e.target.value) })}
                            className="w-full text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Font Weight</label>
                          <select
                            value={selectedLayerData.fontWeight}
                            onChange={(e) => updateSelectedLayer({ fontWeight: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            {fontWeights.map(weight => (
                              <option key={weight.value} value={weight.value}>{weight.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Color</label>
                          <input
                            type="color"
                            value={selectedLayerData.color}
                            onChange={(e) => updateSelectedLayer({ color: e.target.value })}
                            className="w-full h-8 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Text Align</label>
                          <select
                            value={selectedLayerData.textAlign}
                            onChange={(e) => updateSelectedLayer({ textAlign: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Letter Spacing</label>
                          <Input
                            type="number"
                            value={selectedLayerData.letterSpacing}
                            onChange={(e) => updateSelectedLayer({ letterSpacing: parseFloat(e.target.value) })}
                            className="w-full text-sm"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Line Height</label>
                          <Input
                            type="number"
                            value={selectedLayerData.lineHeight}
                            onChange={(e) => updateSelectedLayer({ lineHeight: parseFloat(e.target.value) })}
                            className="w-full text-sm"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Text Decoration</label>
                          <select
                            value={selectedLayerData.textDecoration}
                            onChange={(e) => updateSelectedLayer({ textDecoration: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="none">None</option>
                            <option value="underline">Underline</option>
                            <option value="line-through">Line Through</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Text Transform</label>
                          <select
                            value={selectedLayerData.textTransform}
                            onChange={(e) => updateSelectedLayer({ textTransform: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="none">None</option>
                            <option value="uppercase">Uppercase</option>
                            <option value="lowercase">Lowercase</option>
                            <option value="capitalize">Capitalize</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shapes" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Shapes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={() => addShape('rect')} className="w-full">
                      <Square className="h-4 w-4 mr-2" />
                      Add Rectangle
                    </Button>
                    <Button onClick={() => addShape('circle')} className="w-full">
                      <Circle className="h-4 w-4 mr-2" />
                      Add Circle
                    </Button>
                    {selectedLayerData?.type === 'shape' && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        <div>
                          <label className="block text-xs font-medium mb-1">Fill Color</label>
                          <input
                            type="color"
                            value={selectedLayerData.fillColor}
                            onChange={(e) => updateSelectedLayer({ fillColor: e.target.value })}
                            className="w-full h-8 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Stroke Color</label>
                          <input
                            type="color"
                            value={selectedLayerData.strokeColor}
                            onChange={(e) => updateSelectedLayer({ strokeColor: e.target.value })}
                            className="w-full h-8 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Stroke Width</label>
                          <Input
                            type="number"
                            value={selectedLayerData.strokeWidth}
                            onChange={(e) => updateSelectedLayer({ strokeWidth: parseInt(e.target.value) })}
                            className="w-full text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="templates" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Product Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                      <Button
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory('all')}
                      >
                        All
                      </Button>
                      {productCategories.map(category => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {filteredTemplates.map(template => (
                        <div
                          key={template.id}
                          className={`border rounded-lg p-2 cursor-pointer ${selectedTemplate.id === template.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <img src={template.image} alt={template.name} className="w-full h-24 object-contain mb-2" />
                          <p className="text-xs text-center font-medium">{template.name}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>

          {/* Layer Management */}
          <div className="p-4 flex-grow overflow-y-auto">
            <h2 className="text-sm font-semibold mb-3">Layers</h2>
            <div className="space-y-2">
              {designLayers.map(layer => (
                <div
                  key={layer.id}
                  className={`flex items-center justify-between p-2 border rounded-md ${selectedLayer === layer.id ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'} ${!isLayerInPrintableArea(layer) && layer.visible ? 'border-red-300 bg-red-50' : ''}`}
                  onClick={() => setSelectedLayer(layer.id)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium truncate">{layer.name}</span>
                    {!isLayerInPrintableArea(layer) && layer.visible && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}>
                      {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}>
                      {layer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-grow flex items-center justify-center bg-gray-100 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="relative bg-white shadow-lg border border-gray-200"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              transform: `scale(${canvasZoom / 100})`,
              transformOrigin: 'center center'
            }}
          >
            <img src={selectedTemplate.image} alt="Mockup" className="w-full h-full object-contain" />
            
            {/* Printable area overlay */}
            {showPrintableArea && (
              <div
                className="absolute border-2 border-dashed border-blue-400 bg-blue-100 bg-opacity-20 pointer-events-none"
                style={{
                  left: `${selectedTemplate.printableArea.x}%`,
                  top: `${selectedTemplate.printableArea.y}%`,
                  width: `${selectedTemplate.printableArea.width}%`,
                  height: `${selectedTemplate.printableArea.height}%`,
                  zIndex: 1
                }}
              >
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                  Print Area
                </div>
              </div>
            )}
            
            {showGrid && (
              <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)' }}></div>
            )}
            {designLayers.map(layer => (
              <div
                key={layer.id}
                className={`absolute select-none cursor-move ${selectedLayer === layer.id && !layer.locked ? 'border-2 border-blue-500 border-dashed' : ''} ${!isLayerInPrintableArea(layer) && layer.visible ? 'border-2 border-red-500 border-dashed' : ''}`}
                style={{
                  left: `${layer.position.x}%`,
                  top: `${layer.position.y}%`,
                  width: `${layer.size}%`,
                  height: `${layer.size * (layer.type === 'text' ? 0.5 : 1)}%`,
                  transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`,
                  opacity: layer.opacity / 100,
                  zIndex: layer.id,
                  display: layer.visible ? 'block' : 'none',
                  pointerEvents: layer.locked ? 'none' : 'auto'
                }}
                onMouseDown={(e) => handleLayerMouseDown(e, layer.id)}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setSelectedLayer(layer.id); 
                }}
              >
                {layer.type === 'image' && (
                  <img 
                    src={layer.src} 
                    alt={layer.name} 
                    className="w-full h-full object-contain pointer-events-none" 
                    draggable={false}
                  />
                )}
                {layer.type === 'freepik-vector' && (
                  <img 
                    src={layer.src} 
                    alt={layer.name} 
                    className="w-full h-full object-contain pointer-events-none" 
                    draggable={false}
                  />
                )}
                {layer.type === 'text' && (
                  <div
                    className="w-full h-full flex items-center justify-center pointer-events-none"
                    style={{
                      fontFamily: layer.fontFamily,
                      fontSize: `${layer.size * 0.8}px`,
                      fontWeight: layer.fontWeight,
                      color: layer.color,
                      textAlign: layer.textAlign,
                      letterSpacing: `${layer.letterSpacing}px`,
                      lineHeight: layer.lineHeight,
                      textDecoration: layer.textDecoration,
                      textTransform: layer.textTransform,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {layer.content}
                  </div>
                )}
                {layer.type === 'shape' && (
                  <div
                    className="w-full h-full pointer-events-none"
                    style={{
                      backgroundColor: layer.fillColor,
                      border: `${layer.strokeWidth}px solid ${layer.strokeColor}`,
                      borderRadius: layer.shapeType === 'circle' ? '50%' : '0'
                    }}
                  ></div>
                )}
                
                {/* Resize handle - now also shows for text layers */}
                {selectedLayer === layer.id && !layer.locked && (
                  <div
                    className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize shadow-md hover:bg-blue-600 transition-colors"
                    style={{
                      transform: 'translate(50%, 50%)',
                      zIndex: 1000
                    }}
                    onMouseDown={(e) => handleResizeMouseDown(e, layer.id)}
                  >
                    <Maximize2 className="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold mb-3">Properties</h2>
            {!selectedLayerData ? (
              <p className="text-xs text-gray-500">Select a layer to edit its properties.</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Layer Name</label>
                  <Input
                    type="text"
                    value={selectedLayerData.name}
                    onChange={(e) => updateSelectedLayer({ name: e.target.value })}
                    className="w-full text-sm"
                  />
                </div>
                
                {/* Warning if layer is out of bounds */}
                {!isLayerInPrintableArea(selectedLayerData) && selectedLayerData.visible && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      <p className="text-xs text-red-700 font-medium">Outside Print Area</p>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      This element is outside the printable area and may not appear on the final product.
                    </p>
                  </div>
                )}
                
                {/* Size display in centimeters with width and height - now includes text */}
                {(selectedLayerData.type === 'image' || selectedLayerData.type === 'freepik-vector' || selectedLayerData.type === 'shape' || selectedLayerData.type === 'text') && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <label className="block text-xs font-medium mb-2 text-blue-800">Size on T-Shirt</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-900">
                          {calculateDimensions(selectedLayerData).width} cm
                        </div>
                        <p className="text-xs text-blue-600">Width</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-900">
                          {calculateDimensions(selectedLayerData).height} cm
                        </div>
                        <p className="text-xs text-blue-600">Height</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-medium mb-1">Size (%)</label>
                  <Input
                    type="number"
                    value={selectedLayerData.size}
                    onChange={(e) => updateSelectedLayer({ size: parseFloat(e.target.value) })}
                    className="w-full text-sm"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Rotation (deg)</label>
                  <Input
                    type="number"
                    value={selectedLayerData.rotation}
                    onChange={(e) => updateSelectedLayer({ rotation: parseFloat(e.target.value) })}
                    className="w-full text-sm"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Opacity (%)</label>
                  <Input
                    type="number"
                    value={selectedLayerData.opacity}
                    onChange={(e) => updateSelectedLayer({ opacity: parseFloat(e.target.value) })}
                    className="w-full text-sm"
                    min="0" max="100"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSelectedLayer({ flipX: !selectedLayerData.flipX })}
                    className="w-full"
                  >
                    <FlipHorizontal className="h-4 w-4 mr-2" />
                    Flip X
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSelectedLayer({ flipY: !selectedLayerData.flipY })}
                    className="w-full"
                  >
                    <FlipVertical className="h-4 w-4 mr-2" />
                    Flip Y
                  </Button>
                </div>
                {selectedLayerData.type === 'text' && (
                  <div>
                    <label className="block text-xs font-medium mb-1">Content</label>
                    <textarea
                      value={selectedLayerData.content}
                      onChange={(e) => updateSelectedLayer({ content: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm h-24"
                    ></textarea>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

