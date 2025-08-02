import { useState, useRef, useCallback } from 'react'
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
  MousePointer, Hand, Crop, Filter, Sliders
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
  { id: 'flat-tshirt', name: 'Flat Lay T-Shirt', image: flatLayTshirt, category: 't-shirt' },
  { id: 'hanging-tshirt', name: 'Hanging T-Shirt', image: hangingTshirt, category: 't-shirt' },
  { id: 'front-back-tshirt', name: 'Front & Back T-Shirt', image: frontBackTshirt, category: 't-shirt' },
  { id: 'model-tshirt', name: 'Model Wearing T-Shirt', image: modelWearingTshirt, category: 't-shirt' },
  { id: 'hoodie-flat', name: 'Flat Lay Hoodie', image: hoodieFlat, category: 'hoodie' },
  { id: 'tank-top', name: 'Tank Top', image: tankTop, category: 'tank-top' },
  { id: 'polo-shirt', name: 'Polo Shirt', image: poloShirt, category: 'polo' },
  { id: 'long-sleeve', name: 'Long Sleeve T-Shirt', image: longSleeve, category: 't-shirt' }
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

function App() {
  const [selectedTemplate, setSelectedTemplate] = useState(mockupTemplates[0])
  const [selectedCategory, setSelectedCategory] = useState('t-shirt')
  const [uploadedDesign, setUploadedDesign] = useState(null)
  const [designLayers, setDesignLayers] = useState([])
  const [selectedLayer, setSelectedLayer] = useState(null)
  const [canvasZoom, setCanvasZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const [activeTool, setActiveTool] = useState('select')
  const [freepikApiKey, setFreepikApiKey] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const fileInputRef = useRef(null)

  // Advanced state for Lumise-like features
  const [textEditMode, setTextEditMode] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')

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
        saveToHistory()
      }
      reader.readAsDataURL(file)
    }
  }, [])

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
    saveToHistory()
  }, [])

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
      saveToHistory()
    }
  }, [designLayers])

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
              <Button variant="outline" size="sm" onClick={() => saveToHistory()}>
                <Save className="h-4 w-4 mr-2" />
                Save Design
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

      <div className="flex h-[calc(100vh-80px)]">
        
        {/* Left Sidebar - Tools & Assets */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          
          {/* Tool Selection */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-2 mb-4">
              <Button
                variant={activeTool === 'select' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTool('select')}
                className="p-2"
              >
                <MousePointer className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTool === 'move' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTool('move')}
                className="p-2"
              >
                <Hand className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTool === 'crop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTool('crop')}
                className="p-2"
              >
                <Crop className="h-4 w-4" />
              </Button>
              <Button
                variant={colorPickerOpen ? 'default' : 'outline'}
                size="sm"
                onClick={() => setColorPickerOpen(!colorPickerOpen)}
                className="p-2"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </div>

            {colorPickerOpen && (
              <div className="mb-4 p-3 border border-gray-200 rounded-lg">
                <label className="block text-xs font-medium mb-2">Color Picker</label>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded"
                />
              </div>
            )}

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
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {fontFamilies.map(font => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium mb-1">Font Weight</label>
                          <select
                            value={selectedLayerData.fontWeight}
                            onChange={(e) => updateSelectedLayer({ fontWeight: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {fontWeights.map(weight => (
                              <option key={weight.value} value={weight.value}>{weight.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1">Text Align</label>
                          <div className="grid grid-cols-3 gap-1">
                            {['left', 'center', 'right'].map(align => (
                              <Button
                                key={align}
                                variant={selectedLayerData.textAlign === align ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateSelectedLayer({ textAlign: align })}
                                className="text-xs"
                              >
                                {align}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1">Letter Spacing</label>
                          <input
                            type="range"
                            min="-2"
                            max="10"
                            step="0.1"
                            value={selectedLayerData.letterSpacing}
                            onChange={(e) => updateSelectedLayer({ letterSpacing: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="shapes" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Shape Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addShape('rectangle')}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addShape('circle')}
                      >
                        <Circle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addShape('line')}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="templates" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Product Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {productCategories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleCategorySelect(category.id)}
                        >
                          <category.icon className="h-4 w-4 mr-2" />
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Layers Panel */}
          <div className="flex-1 p-4">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Layers className="h-4 w-4 mr-2" />
                  Layers ({designLayers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {designLayers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`flex items-center justify-between p-2 rounded border cursor-pointer ${
                      selectedLayer === layer.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedLayer(layer.id)}
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLayerVisibility(layer.id)
                        }}
                      >
                        {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLayerLock(layer.id)
                        }}
                      >
                        {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                      </Button>
                      <span className="text-xs font-medium truncate flex-1">{layer.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateLayer(layer.id)
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteLayer(layer.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {designLayers.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">No layers yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-gray-100 flex flex-col">
          
          {/* Canvas Controls */}
          <div className="bg-white border-b border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                  className={showGrid ? 'bg-blue-50 border-blue-300' : ''}
                >
                  <Grid className="h-4 w-4 mr-1" />
                  Grid
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="outline" size="sm" onClick={() => setCanvasZoom(Math.max(25, canvasZoom - 25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[60px] text-center">{canvasZoom}%</span>
                <Button variant="outline" size="sm" onClick={() => setCanvasZoom(Math.min(200, canvasZoom + 25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="outline" size="sm">
                  <AlignCenter className="h-4 w-4 mr-1" />
                  Align
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{selectedTemplate.name}</Badge>
                <Button onClick={handleDownload} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Mockup
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div 
              className="relative bg-white rounded-lg shadow-lg overflow-hidden"
              style={{ transform: `scale(${canvasZoom / 100})` }}
            >
              {showGrid && (
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />
              )}
              
              <img 
                src={selectedTemplate.image} 
                alt={selectedTemplate.name}
                className="max-w-full h-auto"
                style={{ maxHeight: '500px', maxWidth: '500px' }}
              />
              
              {/* Design Layers Overlay */}
              {designLayers.map((layer) => (
                layer.visible && (
                  <div
                    key={layer.id}
                    className={`absolute cursor-move ${selectedLayer === layer.id ? 'ring-2 ring-blue-500' : ''}`}
                    style={{
                      left: `${layer.position.x}%`,
                      top: `${layer.position.y}%`,
                      transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) ${layer.flipX ? 'scaleX(-1)' : ''} ${layer.flipY ? 'scaleY(-1)' : ''}`,
                      opacity: layer.opacity / 100
                    }}
                  >
                    {layer.type === 'image' || layer.type === 'freepik-vector' ? (
                      <img
                        src={layer.src}
                        alt={layer.name}
                        style={{
                          width: `${layer.size * 4}px`,
                          height: 'auto',
                          maxWidth: '200px',
                          maxHeight: '200px',
                          objectFit: 'contain'
                        }}
                      />
                    ) : layer.type === 'text' ? (
                      <div
                        style={{
                          fontSize: `${layer.size}px`,
                          fontFamily: layer.fontFamily,
                          fontWeight: layer.fontWeight,
                          color: layer.color,
                          textAlign: layer.textAlign,
                          letterSpacing: `${layer.letterSpacing}px`,
                          lineHeight: layer.lineHeight,
                          textDecoration: layer.textDecoration,
                          textTransform: layer.textTransform,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {layer.content}
                      </div>
                    ) : layer.type === 'shape' ? (
                      <div
                        style={{
                          width: `${layer.size * 4}px`,
                          height: `${layer.size * 4}px`,
                          backgroundColor: layer.shapeType === 'circle' ? 'transparent' : layer.fillColor,
                          border: `${layer.strokeWidth}px solid ${layer.strokeColor}`,
                          borderRadius: layer.shapeType === 'circle' ? '50%' : '0',
                          background: layer.shapeType === 'circle' ? layer.fillColor : 'transparent'
                        }}
                      />
                    ) : null}
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties & Templates */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          
          {/* Properties Panel */}
          {selectedLayerData && (
            <div className="p-4 border-b border-gray-200">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Layer Properties</CardTitle>
                  <CardDescription className="text-xs">{selectedLayerData.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">X Position</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(selectedLayerData.position.x)}
                        onChange={(e) => updateSelectedLayer({ position: { ...selectedLayerData.position, x: parseInt(e.target.value) } })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Y Position</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(selectedLayerData.position.y)}
                        onChange={(e) => updateSelectedLayer({ position: { ...selectedLayerData.position, y: parseInt(e.target.value) } })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2">Size: {selectedLayerData.size}%</label>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={selectedLayerData.size}
                      onChange={(e) => updateSelectedLayer({ size: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2">Rotation: {selectedLayerData.rotation}°</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={selectedLayerData.rotation}
                      onChange={(e) => updateSelectedLayer({ rotation: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2">Opacity: {selectedLayerData.opacity}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedLayerData.opacity}
                      onChange={(e) => updateSelectedLayer({ opacity: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* Transform Controls */}
                  <div>
                    <label className="block text-xs font-medium mb-2">Transform</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSelectedLayer({ flipX: !selectedLayerData.flipX })}
                        className={selectedLayerData.flipX ? 'bg-blue-50' : ''}
                      >
                        <FlipHorizontal className="h-3 w-3 mr-1" />
                        Flip H
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSelectedLayer({ flipY: !selectedLayerData.flipY })}
                        className={selectedLayerData.flipY ? 'bg-blue-50' : ''}
                      >
                        <FlipVertical className="h-3 w-3 mr-1" />
                        Flip V
                      </Button>
                    </div>
                  </div>
                  
                  {selectedLayerData.type === 'text' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-2">Text Content</label>
                        <textarea
                          value={selectedLayerData.content}
                          onChange={(e) => updateSelectedLayer({ content: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          rows="2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-2">Text Color</label>
                        <input
                          type="color"
                          value={selectedLayerData.color}
                          onChange={(e) => updateSelectedLayer({ color: e.target.value })}
                          className="w-full h-8 border border-gray-300 rounded"
                        />
                      </div>
                    </>
                  )}

                  {selectedLayerData.type === 'shape' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-2">Fill Color</label>
                        <input
                          type="color"
                          value={selectedLayerData.fillColor}
                          onChange={(e) => updateSelectedLayer({ fillColor: e.target.value })}
                          className="w-full h-8 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-2">Stroke Color</label>
                        <input
                          type="color"
                          value={selectedLayerData.strokeColor}
                          onChange={(e) => updateSelectedLayer({ strokeColor: e.target.value })}
                          className="w-full h-8 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-2">Stroke Width: {selectedLayerData.strokeWidth}px</label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={selectedLayerData.strokeWidth}
                          onChange={(e) => updateSelectedLayer({ strokeWidth: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  {selectedLayerData.type === 'freepik-vector' && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        <strong>Source:</strong> Freepik
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Author:</strong> {selectedLayerData.author}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Templates Gallery */}
          <div className="flex-1 p-4">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Mockup Templates</CardTitle>
                <CardDescription className="text-xs">Choose a template style</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`cursor-pointer rounded-lg border-2 p-2 transition-all hover:shadow-md ${
                        selectedTemplate.id === template.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <img 
                        src={template.image} 
                        alt={template.name}
                        className="w-full h-16 object-cover rounded"
                      />
                      <p className="text-xs font-medium mt-1 text-center">{template.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

