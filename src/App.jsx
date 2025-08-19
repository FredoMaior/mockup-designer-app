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
    printableArea: { x: 25, y: 20, width: 50, height: 52 } // Zwiększone o 30% (40% -> 52%)
  },
  { 
    id: 'hanging-tshirt', 
    name: 'Hanging T-Shirt', 
    image: hangingTshirt, 
    category: 't-shirt',
    aspectRatio: 0.8,
    printableArea: { x: 30, y: 25, width: 40, height: 65 } // Zwiększone o 30% (50% -> 65%)
  },
  { 
    id: 'front-back-tshirt', 
    name: 'Front & Back T-Shirt', 
    image: frontBackTshirt, 
    category: 't-shirt',
    aspectRatio: 1.6,
    printableArea: { x: 25, y: 30, width: 50, height: 52 } // Zwiększone o 30% (40% -> 52%)
  },
  { 
    id: 'model-tshirt', 
    name: 'Model Wearing T-Shirt', 
    image: modelWearingTshirt, 
    category: 't-shirt',
    aspectRatio: 0.75,
    printableArea: { x: 35, y: 35, width: 30, height: 39 } // Zwiększone o 30% (30% -> 39%)
  },
  { 
    id: 'hoodie-flat', 
    name: 'Flat Lay Hoodie', 
    image: hoodieFlat, 
    category: 'hoodie',
    aspectRatio: 1.0,
    printableArea: { x: 25, y: 20, width: 50, height: 52 } // Zwiększone o 30%
  },
  { 
    id: 'tank-top', 
    name: 'Tank Top', 
    image: tankTop, 
    category: 'tank-top',
    aspectRatio: 0.8,
    printableArea: { x: 30, y: 25, width: 40, height: 65 } // Zwiększone o 30%
  },
  { 
    id: 'polo-shirt', 
    name: 'Polo Shirt', 
    image: poloShirt, 
    category: 'polo',
    aspectRatio: 0.8,
    printableArea: { x: 30, y: 25, width: 40, height: 65 } // Zwiększone o 30%
  },
  { 
    id: 'long-sleeve', 
    name: 'Long Sleeve T-Shirt', 
    image: longSleeve, 
    category: 't-shirt',
    aspectRatio: 1.0,
    printableArea: { x: 25, y: 20, width: 50, height: 52 } // Zwiększone o 30%
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

// Constants for size calculation - updated to real t-shirt dimensions
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
  const [showPrintArea, setShowPrintArea] = useState(true)
  const [activeTab, setActiveTab] = useState('upload')
  const [activeTool, setActiveTool] = useState('select') // Always set to 'select' by default
  const [freepikApiKey, setFreepikApiKey] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [imageDimensions, setImageDimensions] = useState({})
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

  // Rotation state
  const [isRotating, setIsRotating] = useState(false)
  const [rotateLayerId, setRotateLayerId] = useState(null)
  const [rotateStartPos, setRotateStartPos] = useState({ x: 0, y: 0 })
  const [rotateStartAngle, setRotateStartAngle] = useState(0)

  // T-shirt color and size selection
  const [selectedTshirtColor, setSelectedTshirtColor] = useState('white')
  const [selectedSizes, setSelectedSizes] = useState({
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0
  })

  // Available t-shirt colors
  const tshirtColors = [
    { id: 'black', name: 'Czarny', hex: '#000000' },
    { id: 'gray', name: 'Szary', hex: '#6B7280' },
    { id: 'white', name: 'Biały', hex: '#FFFFFF' },
    { id: 'red', name: 'Czerwony', hex: '#DC2626' },
    { id: 'blue', name: 'Niebieski', hex: '#2563EB' },
    { id: 'navy', name: 'Granatowy', hex: '#1E3A8A' },
    { id: 'green', name: 'Zielony', hex: '#16A34A' }
  ]

  // Function to update size quantity
  const updateSizeQuantity = useCallback((size, quantity) => {
    setSelectedSizes(prev => ({
      ...prev,
      [size]: Math.max(0, parseInt(quantity) || 0)
    }))
  }, [])

  // Multi-part design system
  const [currentPart, setCurrentPart] = useState('front')
  const [partDesigns, setPartDesigns] = useState({
    front: [],
    back: [],
    leftSleeve: [],
    rightSleeve: []
  })

  // T-shirt parts configuration
  const tshirtParts = [
    { id: 'front', name: 'Przód', icon: 'Shirt' },
    { id: 'back', name: 'Tył', icon: 'Shirt' },
    { id: 'leftSleeve', name: 'Lewy Rękaw', icon: 'Move' },
    { id: 'rightSleeve', name: 'Prawy Rękaw', icon: 'Move' }
  ]

  // Function to switch between t-shirt parts
  const switchToPart = useCallback((partId) => {
    // Save current design to current part
    setPartDesigns(prev => ({
      ...prev,
      [currentPart]: designLayers
    }))
    
    // Switch to new part and load its design
    setCurrentPart(partId)
    setDesignLayers(partDesigns[partId] || [])
    setSelectedLayer(null)
  }, [currentPart, designLayers, partDesigns])

  // Update designLayers when switching parts
  useEffect(() => {
    setDesignLayers(partDesigns[currentPart] || [])
  }, [currentPart, partDesigns])

  // Function to calculate dimensions in centimeters
  const calculateDimensions = useCallback((layer) => {
    const widthCm = (layer.size / 100) * TSHIRT_WIDTH_CM
    let heightCm = widthCm // Default to square

    if (layer.type === 'image' || layer.type === 'freepik-vector') {
      const imgDim = imageDimensions[layer.id]
      if (imgDim) {
        heightCm = widthCm * (imgDim.height / imgDim.width)
      }
    } else if (layer.type === 'text') {
      heightCm = widthCm * layer.lineHeight * 0.6 // Approximate text height
    }

    return {
      width: widthCm.toFixed(1),
      height: heightCm.toFixed(1)
    }
  }, [imageDimensions])

  // Function to load image dimensions
  const loadImageDimensions = useCallback((layerId, src) => {
    const img = new Image()
    img.onload = () => {
      setImageDimensions(prev => ({
        ...prev,
        [layerId]: { width: img.width, height: img.height }
      }))
    }
    img.src = src
  }, [])

  // Function to check image quality for print
  const checkImageQuality = useCallback((layer) => {
    if (layer.type !== 'image' && layer.type !== 'freepik-vector') {
      return { isGoodQuality: true, dpi: null, recommendation: null }
    }

    const imgDim = imageDimensions[layer.id]
    if (!imgDim) {
      return { isGoodQuality: true, dpi: null, recommendation: null }
    }

    const dimensions = calculateDimensions(layer)
    const widthCm = parseFloat(dimensions.width)
    const heightCm = parseFloat(dimensions.height)

    // Convert cm to inches (1 inch = 2.54 cm)
    const widthInches = widthCm / 2.54
    const heightInches = heightCm / 2.54

    // Calculate DPI (dots per inch)
    const dpiX = imgDim.width / widthInches
    const dpiY = imgDim.height / heightInches
    const avgDpi = Math.min(dpiX, dpiY) // Use the lower DPI as limiting factor

    // Quality thresholds
    const minDpi = 150 // Minimum for acceptable print quality
    const goodDpi = 300 // Recommended for high quality print

    let isGoodQuality = true
    let recommendation = null

    if (avgDpi < minDpi) {
      isGoodQuality = false
      recommendation = "Bardzo niska jakość! Obrazek będzie rozmazany po wydruku. Użyj obrazka o wyższej rozdzielczości."
    } else if (avgDpi < goodDpi) {
      isGoodQuality = false
      recommendation = "Niska jakość druku. Dla lepszego efektu użyj obrazka o wyższej rozdzielczości."
    }

    return {
      isGoodQuality,
      dpi: Math.round(avgDpi),
      recommendation
    }
  }, [imageDimensions, calculateDimensions])

  // Function to check if layer is in printable area
  const isLayerInPrintableArea = useCallback((layer) => {
    const printArea = selectedTemplate.printableArea
    const layerLeft = layer.position.x - (layer.size / 2)
    const layerRight = layer.position.x + (layer.size / 2)
    
    // Calculate height based on layer type
    let layerHeight = layer.size
    if (layer.type === 'text') {
      layerHeight = layer.size * 0.5 // Text has different height
    }
    
    const layerTop = layer.position.y - (layerHeight / 2)
    const layerBottom = layer.position.y + (layerHeight / 2)

    return (
      layerLeft >= printArea.x &&
      layerRight <= printArea.x + printArea.width &&
      layerTop >= printArea.y &&
      layerBottom <= printArea.y + printArea.height
    )
  }, [selectedTemplate])

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
        loadImageDimensions(newLayer.id, e.target.result)
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
    loadImageDimensions(newLayer.id, vectorData.url)
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
    // Clean up image dimensions
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
      // Copy image dimensions if they exist
      if (imageDimensions[layerId]) {
        setImageDimensions(prev => ({
          ...prev,
          [newLayer.id]: imageDimensions[layerId]
        }))
      }
      saveToHistory()
    }
  }, [designLayers, imageDimensions])

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
    // Save current design to current part before processing
    const updatedPartDesigns = {
      ...partDesigns,
      [currentPart]: designLayers
    }
    
    // Prepare complete design data for all parts
    const completeDesignData = {
      tshirtColor: selectedTshirtColor,
      sizes: selectedSizes,
      parts: updatedPartDesigns,
      template: selectedTemplate,
      timestamp: new Date().toISOString()
    }
    
    const designData = JSON.stringify(completeDesignData);
    console.log('Complete design saved:', designData);

    const newDesignId = `design_${Date.now()}`;
    savedDesignId.current = newDesignId;

    // Send email with design data (simulated)
    console.log('Sending email with design data...');
    console.log('Email content:', {
      designId: newDesignId,
      designData: completeDesignData,
      emailSubject: `Nowy projekt koszulki - ${newDesignId}`,
      emailBody: `
        Nowy projekt koszulki został utworzony:
        
        ID Projektu: ${newDesignId}
        Kolor koszulki: ${tshirtColors.find(c => c.id === selectedTshirtColor)?.name}
        Rozmiary: ${Object.entries(selectedSizes).filter(([_, qty]) => qty > 0).map(([size, qty]) => `${size}: ${qty}szt`).join(', ')}
        
        Części z projektami:
        - Przód: ${updatedPartDesigns.front.length} elementów
        - Tył: ${updatedPartDesigns.back.length} elementów  
        - Lewy rękaw: ${updatedPartDesigns.leftSleeve.length} elementów
        - Prawy rękaw: ${updatedPartDesigns.rightSleeve.length} elementów
        
        Dane projektu w załączniku.
      `
    });

    if (window.parent) {
      // Send design data to Wix
      window.parent.postMessage({
        type: 'designSaved',
        payload: {
          designId: newDesignId,
          designData: designData
        }
      }, '*');
      
      // Add to cart
      window.parent.postMessage({
        type: 'addToCart',
        payload: {
          designId: newDesignId,
          completeDesign: completeDesignData
        }
      }, '*');
    }
    
    alert('Projekt zapisany i dodany do koszyka! Email z plikami zostanie wysłany automatycznie.');
  }, [designLayers, partDesigns, currentPart, selectedTshirtColor, selectedSizes, selectedTemplate, tshirtColors]);

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

    if (isRotating && rotateLayerId && canvasRef.current) {
      e.preventDefault();
      
      const canvas = canvasRef.current;
      const canvasRect = canvas.getBoundingClientRect();
      
      // Calculate angle from center of element
      const layer = designLayers.find(l => l.id === rotateLayerId);
      if (layer) {
        const centerX = canvasRect.left + (layer.position.x / 100) * canvasRect.width;
        const centerY = canvasRect.top + (layer.position.y / 100) * canvasRect.height;
        
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const newRotation = Math.round(angle);
        
        // Update layer rotation
        setDesignLayers(prev => prev.map(l =>
          l.id === rotateLayerId 
            ? { ...l, rotation: newRotation }
            : l
        ));
      }
    }
  }, [isDragging, dragLayerId, isResizing, resizeLayerId, resizeStartPos, resizeStartSize, isRotating, rotateLayerId, designLayers]);

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
    if (isRotating) {
      setIsRotating(false);
      setRotateLayerId(null);
      setRotateStartPos({ x: 0, y: 0 });
      setRotateStartAngle(0);
      saveToHistory();
    }
  }, [isDragging, isResizing, isRotating, saveToHistory]);

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

  // Rotation handle mouse down
  const handleRotateMouseDown = useCallback((e, layerId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const layer = designLayers.find(l => l.id === layerId);
    if (!layer || layer.locked) return;

    setIsRotating(true);
    setRotateLayerId(layerId);
    setRotateStartPos({ x: e.clientX, y: e.clientY });
    setRotateStartAngle(layer.rotation || 0);
  }, [designLayers]);

  // Add event listeners for mouse events
  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      document.addEventListener('mousemove', handleCanvasMouseMove);
      document.addEventListener('mouseup', handleCanvasMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleCanvasMouseMove);
        document.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isDragging, isResizing, isRotating, handleCanvasMouseMove, handleCanvasMouseUp]);

  const filteredTemplates = mockupTemplates.filter(template =>
    selectedCategory === 'all' || template.category === selectedCategory
  )

  const selectedLayerData = designLayers.find(layer => layer.id === selectedLayer)

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
                <p className="text-sm text-gray-600">Professional apparel customization tool</p>
              </div>
            </div>
            
            {/* T-shirt parts selector */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              {tshirtParts.map(part => (
                <Button
                  key={part.id}
                  variant={currentPart === part.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => switchToPart(part.id)}
                  className="text-xs"
                >
                  <Shirt className="h-3 w-3 mr-1" />
                  {part.name}
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrintArea(!showPrintArea)}
                className={showPrintArea ? "bg-blue-100 text-blue-700" : ""}
              >
                <Grid className="h-4 w-4 mr-2" />
                Print Area
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
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Tools */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload" className="text-xs">
                  <Upload className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="text" className="text-xs">
                  <Type className="h-4 w-4" />
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
                          <label className="block text-xs font-medium mb-1">Content</label>
                          <textarea
                            value={selectedLayerData.content}
                            onChange={(e) => updateSelectedLayer({ content: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm h-24"
                            placeholder="Your text here"
                          ></textarea>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="templates" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Konfiguracja Produktu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Wybór koloru koszulki */}
                      <div>
                        <label className="block text-xs font-medium mb-2">Kolor Koszulki</label>
                        <div className="grid grid-cols-4 gap-2">
                          {tshirtColors.map(color => (
                            <button
                              key={color.id}
                              onClick={() => setSelectedTshirtColor(color.id)}
                              className={`p-2 rounded-lg border-2 transition-colors ${
                                selectedTshirtColor === color.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div
                                className="w-6 h-6 rounded-full mx-auto mb-1 border"
                                style={{ 
                                  backgroundColor: color.hex,
                                  borderColor: color.id === 'white' ? '#E5E7EB' : color.hex
                                }}
                              ></div>
                              <span className="text-xs">{color.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Wybór rozmiarów i ilości */}
                      <div>
                        <label className="block text-xs font-medium mb-2">Rozmiary i Ilość</label>
                        <div className="space-y-2">
                          {Object.keys(selectedSizes).map(size => (
                            <div key={size} className="flex items-center justify-between">
                              <span className="text-sm font-medium w-8">{size}</span>
                              <Input
                                type="number"
                                min="0"
                                value={selectedSizes[size]}
                                onChange={(e) => updateSizeQuantity(size, e.target.value)}
                                className="w-20 text-sm"
                                placeholder="0"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Łącznie: {Object.values(selectedSizes).reduce((sum, qty) => sum + qty, 0)} szt.
                        </div>
                      </div>

                      <Separator />

                      {/* Szablony produktów */}
                      <div>
                        <label className="block text-xs font-medium mb-2">Szablon Produktu</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Button
                            variant={selectedCategory === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleCategorySelect('all')}
                            className="text-xs"
                          >
                            All
                          </Button>
                          {productCategories.map(category => (
                            <Button
                              key={category.id}
                              variant={selectedCategory === category.id ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleCategorySelect(category.id)}
                              className="text-xs"
                            >
                              <category.icon className="h-3 w-3 mr-1" />
                              {category.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {filteredTemplates.map(template => (
                          <div
                            key={template.id}
                            className={`cursor-pointer rounded-lg border-2 transition-colors ${
                              selectedTemplate.id === template.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <img
                              src={template.image}
                              alt={template.name}
                              className="w-full h-20 object-cover rounded-t-lg"
                            />
                            <div className="p-2">
                              <p className="text-xs font-medium text-gray-900">{template.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Layers Panel */}
          <div className="flex-1 p-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Layers className="h-4 w-4 mr-2" />
                  Layers ({designLayers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {designLayers.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No layers yet. Add some content!</p>
                ) : (
                  designLayers.slice().reverse().map(layer => {
                    const isOutsidePrintArea = !isLayerInPrintableArea(layer)
                    return (
                      <div
                        key={layer.id}
                        className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          selectedLayer === layer.id
                            ? 'border-blue-500 bg-blue-50'
                            : isOutsidePrintArea
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedLayer(layer.id)}
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {layer.type === 'image' && <ImageIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                          {layer.type === 'freepik-vector' && <Zap className="h-4 w-4 text-purple-500 flex-shrink-0" />}
                          {layer.type === 'text' && <Type className="h-4 w-4 text-green-500 flex-shrink-0" />}
                          {layer.type === 'shape' && <Square className="h-4 w-4 text-orange-500 flex-shrink-0" />}
                          <span 
                            className="text-xs font-medium truncate" 
                            style={{ maxWidth: '120px' }}
                            title={layer.name}
                          >
                            {layer.name}
                          </span>
                          {isOutsidePrintArea && (
                            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleLayerVisibility(layer.id)
                            }}
                            className="h-6 w-6 p-0"
                          >
                            {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleLayerLock(layer.id)
                            }}
                            className="h-6 w-6 p-0"
                          >
                            {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicateLayer(layer.id)
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteLayer(layer.id)
                            }}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-100">
          <div
            ref={canvasRef}
            className="relative bg-white rounded-lg shadow-lg overflow-hidden"
            style={{
              width: '500px',
              height: `${500 * selectedTemplate.aspectRatio}px`,
              maxHeight: '600px'
            }}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          >
            <img src={selectedTemplate.image} alt="Mockup" className="w-full h-full object-contain" />
            
            {/* Print Area Overlay */}
            {showPrintArea && (
              <div
                className="absolute border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-20 pointer-events-none"
                style={{
                  left: `${selectedTemplate.printableArea.x}%`,
                  top: `${selectedTemplate.printableArea.y}%`,
                  width: `${selectedTemplate.printableArea.width}%`,
                  height: `${selectedTemplate.printableArea.height}%`
                }}
              />
            )}
            
            {showGrid && (
              <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)' }}></div>
            )}
            
            {designLayers.map(layer => {
              const isOutsidePrintArea = !isLayerInPrintableArea(layer)
              return (
                <div
                  key={layer.id}
                  className={`absolute select-none cursor-move ${
                    selectedLayer === layer.id && !layer.locked 
                      ? 'border-2 border-blue-500 border-dashed' 
                      : isOutsidePrintArea 
                      ? 'border-2 border-red-500 border-dashed' 
                      : ''
                  }`}
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
                  
                  {/* Resize handle - only show for selected layer */}
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
              )
            })}
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
                
                {/* Warning for elements outside print area */}
                {!isLayerInPrintableArea(selectedLayerData) && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-red-800">Outside Print Area</span>
                    </div>
                    <p className="text-xs text-red-600">
                      This element is outside the printable area. Move it inside the blue dashed area to ensure it will be printed correctly.
                    </p>
                  </div>
                )}
                
                {/* Size display in centimeters */}
                {selectedLayerData && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <label className="block text-xs font-medium mb-2 text-blue-800">Size on T-Shirt</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-blue-600">Width</span>
                        <div className="text-lg font-bold text-blue-900">
                          {calculateDimensions(selectedLayerData).width} cm
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-blue-600">Height</span>
                        <div className="text-lg font-bold text-blue-900">
                          {calculateDimensions(selectedLayerData).height} cm
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Image quality warning */}
                {selectedLayerData && (selectedLayerData.type === 'image' || selectedLayerData.type === 'freepik-vector') && (
                  (() => {
                    const qualityCheck = checkImageQuality(selectedLayerData)
                    if (!qualityCheck.isGoodQuality && qualityCheck.recommendation) {
                      return (
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                          <div className="flex items-center mb-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                            <span className="text-sm font-medium text-orange-800">Jakość Druku</span>
                          </div>
                          <p className="text-xs text-orange-600 mb-2">
                            {qualityCheck.recommendation}
                          </p>
                          <p className="text-xs text-orange-500">
                            Aktualne DPI: {qualityCheck.dpi} (zalecane: 300+ DPI)
                          </p>
                        </div>
                      )
                    }
                    return null
                  })()
                )}
                
                <div>
                  <label className="block text-xs font-medium mb-1">Rotation (deg)</label>
                  <Input
                    type="number"
                    value={selectedLayerData.rotation || 0}
                    onChange={(e) => updateSelectedLayer({ rotation: parseFloat(e.target.value) })}
                    className="w-full text-sm"
                    step="1"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSelectedLayer({ flipX: !selectedLayerData.flipX })}
                    className="w-full"
                  >
                    <FlipHorizontal className="h-4 w-4 mr-1" />
                    X
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSelectedLayer({ flipY: !selectedLayerData.flipY })}
                    className="w-full"
                  >
                    <FlipVertical className="h-4 w-4 mr-1" />
                    Y
                  </Button>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

