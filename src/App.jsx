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
  const savedDesignId = useRef(null) // To store the ID of the saved design

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

  const handleSaveDesign = useCallback(() => {
    // In a real application, this would send the designLayers data to your backend
    // and receive a unique design ID. For this example, we'll simulate it.
    const designData = JSON.stringify(designLayers);
    console.log('Design saved:', designData);

    // Simulate sending data to Wix Studio via postMessage
    // In a real scenario, you'd send the actual design data or a reference to it
    const newDesignId = `design_${Date.now()}`;
    savedDesignId.current = newDesignId; // Store the design ID

    if (window.parent) {
      window.parent.postMessage({
        type: 'designSaved',
        payload: {
          designId: newDesignId,
          designData: designData // In a real app, you might send a URL to the saved design
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

    // Simulate sending data to Wix Studio via postMessage for adding to cart
    if (window.parent) {
      window.parent.postMessage({
        type: 'addToCart',
        payload: {
          designId: savedDesignId.current,
          // You might also send a preview image or other relevant data
        }
      }, '*');
    }
    alert('Adding design to cart via Wix Studio...');
  }, []);

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
                <Save className="h-4 w-4 mr-2" /> {/* Using Save icon for now, can be changed */}
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
                  className={`flex items-center justify-between p-2 border rounded-md ${selectedLayer === layer.id ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                  onClick={() => setSelectedLayer(layer.id)}
                >
                  <span className="text-sm font-medium truncate">{layer.name}</span>
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
            className="relative bg-white shadow-lg border border-gray-200"
            style={{
              width: '500px',
              height: '500px',
              transform: `scale(${canvasZoom / 100})`,
              transformOrigin: 'center center'
            }}
          >
            <img src={selectedTemplate.image} alt="Mockup" className="w-full h-full object-contain" />
            {showGrid && (
              <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)' }}></div>
            )}
            {designLayers.map(layer => (
              <div
                key={layer.id}
                className={`absolute cursor-grab ${selectedLayer === layer.id && !layer.locked ? 'border-2 border-blue-500' : ''}`}
                style={{
                  left: `${layer.position.x}%`,
                  top: `${layer.position.y}%`,
                  width: `${layer.size}%`,
                  height: `${layer.size * (layer.type === 'text' ? 0.5 : 1)}%`, // Adjust height for text layers
                  transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`,
                  opacity: layer.opacity / 100,
                  zIndex: layer.id,
                  display: layer.visible ? 'block' : 'none'
                }}
                onClick={(e) => { e.stopPropagation(); setSelectedLayer(layer.id); }}
              >
                {layer.type === 'image' && (
                  <img src={layer.src} alt={layer.name} className="w-full h-full object-contain" />
                )}
                {layer.type === 'freepik-vector' && (
                  <img src={layer.src} alt={layer.name} className="w-full h-full object-contain" />
                )}
                {layer.type === 'text' && (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      fontFamily: layer.fontFamily,
                      fontSize: `${layer.size * 0.8}px`, // Adjust font size based on layer size
                      fontWeight: layer.fontWeight,
                      color: layer.color,
                      textAlign: layer.textAlign,
                      letterSpacing: `${layer.letterSpacing}px`,
                      lineHeight: layer.lineHeight,
                      textDecoration: layer.textDecoration,
                      textTransform: layer.textTransform,
                      whiteSpace: 'pre-wrap', // Preserve line breaks
                      wordBreak: 'break-word'
                    }}
                  >
                    {layer.content}
                  </div>
                )}
                {layer.type === 'shape' && (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: layer.fillColor,
                      border: `${layer.strokeWidth}px solid ${layer.strokeColor}`,
                      borderRadius: layer.shapeType === 'circle' ? '50%' : '0'
                    }}
                  ></div>
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
                <div>
                  <label className="block text-xs font-medium mb-1">Position X (%)</label>
                  <Input
                    type="number"
                    value={selectedLayerData.position.x}
                    onChange={(e) => updateSelectedLayer({ position: { ...selectedLayerData.position, x: parseFloat(e.target.value) } })}
                    className="w-full text-sm"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Position Y (%)</label>
                  <Input
                    type="number"
                    value={selectedLayerData.position.y}
                    onChange={(e) => updateSelectedLayer({ position: { ...selectedLayerData.position, y: parseFloat(e.target.value) } })}
                    className="w-full text-sm"
                    step="0.1"
                  />
                </div>
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
