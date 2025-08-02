import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  Search, Download, Heart, Eye, Filter, Grid, List,
  Palette, Shapes, Image as ImageIcon, Sparkles
} from 'lucide-react'

const FreepikSearch = ({ onSelectVector, apiKey }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    style: '',
    color: '',
    orientation: ''
  })
  const [viewMode, setViewMode] = useState('grid')

  const vectorStyles = [
    { id: 'flat', name: 'Flat', icon: Shapes },
    { id: 'cartoon', name: 'Cartoon', icon: Sparkles },
    { id: 'geometric', name: 'Geometric', icon: Grid },
    { id: 'gradient', name: 'Gradient', icon: Palette },
    { id: 'hand-drawn', name: 'Hand Drawn', icon: ImageIcon },
    { id: '3d', name: '3D', icon: Shapes },
    { id: 'watercolor', name: 'Watercolor', icon: Palette },
    { id: 'isometric', name: 'Isometric', icon: Grid }
  ]

  const colors = [
    { id: 'black', name: 'Black', hex: '#000000' },
    { id: 'blue', name: 'Blue', hex: '#3B82F6' },
    { id: 'red', name: 'Red', hex: '#EF4444' },
    { id: 'green', name: 'Green', hex: '#10B981' },
    { id: 'yellow', name: 'Yellow', hex: '#F59E0B' },
    { id: 'purple', name: 'Purple', hex: '#8B5CF6' },
    { id: 'orange', name: 'Orange', hex: '#F97316' },
    { id: 'pink', name: 'Pink', hex: '#EC4899' },
    { id: 'gray', name: 'Gray', hex: '#6B7280' },
    { id: 'white', name: 'White', hex: '#FFFFFF' }
  ]

  const orientations = [
    { id: 'square', name: 'Square' },
    { id: 'landscape', name: 'Landscape' },
    { id: 'portrait', name: 'Portrait' }
  ]

  const searchVectors = useCallback(async () => {
    if (!searchTerm.trim() || !apiKey) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        term: searchTerm,
        'filters[content_type][vector]': '1',
        limit: '20',
        order: 'relevance'
      })

      // Add style filter if selected
      if (selectedFilters.style) {
        params.append('filters[vector][style]', selectedFilters.style)
      }

      // Add color filter if selected
      if (selectedFilters.color) {
        params.append('filters[color]', selectedFilters.color)
      }

      // Add orientation filter if selected
      if (selectedFilters.orientation) {
        params.append(`filters[orientation][${selectedFilters.orientation}]`, '1')
      }

      const response = await fetch(`https://api.freepik.com/v1/resources?${params}`, {
        headers: {
          'x-freepik-api-key': apiKey,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      setSearchResults(data.data || [])
    } catch (error) {
      console.error('Error searching vectors:', error)
      alert('Error searching vectors. Please check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedFilters, apiKey])

  const handleFilterChange = useCallback((filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? '' : value
    }))
  }, [])

  const handleSelectVector = useCallback(async (vector) => {
    try {
      // In a real implementation, you would download the vector using the Freepik download API
      // For now, we'll use the preview URL
      const vectorData = {
        id: vector.id,
        title: vector.title,
        url: vector.image?.source?.url || '',
        author: vector.author?.name || 'Unknown',
        type: 'freepik-vector'
      }
      
      onSelectVector(vectorData)
    } catch (error) {
      console.error('Error selecting vector:', error)
      alert('Error adding vector to design')
    }
  }, [onSelectVector])

  return (
    <div className="h-full flex flex-col">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded">
            <Search className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-sm">Freepik Vectors</h3>
        </div>
        
        <div className="flex space-x-2">
          <Input
            placeholder="Search vectors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchVectors()}
            className="flex-1"
          />
          <Button onClick={searchVectors} disabled={loading} size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {!apiKey && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            Freepik API key required for vector search
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
            <TabsTrigger value="color" className="text-xs">Color</TabsTrigger>
            <TabsTrigger value="orientation" className="text-xs">Size</TabsTrigger>
          </TabsList>
          
          <TabsContent value="style" className="mt-3">
            <div className="grid grid-cols-2 gap-2">
              {vectorStyles.map((style) => (
                <Button
                  key={style.id}
                  variant={selectedFilters.style === style.id ? "default" : "outline"}
                  size="sm"
                  className="justify-start text-xs"
                  onClick={() => handleFilterChange('style', style.id)}
                >
                  <style.icon className="h-3 w-3 mr-1" />
                  {style.name}
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="color" className="mt-3">
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <Button
                  key={color.id}
                  variant={selectedFilters.color === color.id ? "default" : "outline"}
                  size="sm"
                  className="p-2 h-8"
                  onClick={() => handleFilterChange('color', color.id)}
                  title={color.name}
                >
                  <div 
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  />
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="orientation" className="mt-3">
            <div className="grid grid-cols-1 gap-2">
              {orientations.map((orientation) => (
                <Button
                  key={orientation.id}
                  variant={selectedFilters.orientation === orientation.id ? "default" : "outline"}
                  size="sm"
                  className="justify-start text-xs"
                  onClick={() => handleFilterChange('orientation', orientation.id)}
                >
                  {orientation.name}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Active Filters */}
        {(selectedFilters.style || selectedFilters.color || selectedFilters.orientation) && (
          <div className="mt-3 flex flex-wrap gap-1">
            {selectedFilters.style && (
              <Badge variant="secondary" className="text-xs">
                {vectorStyles.find(s => s.id === selectedFilters.style)?.name}
              </Badge>
            )}
            {selectedFilters.color && (
              <Badge variant="secondary" className="text-xs">
                {colors.find(c => c.id === selectedFilters.color)?.name}
              </Badge>
            )}
            {selectedFilters.orientation && (
              <Badge variant="secondary" className="text-xs">
                {orientations.find(o => o.id === selectedFilters.orientation)?.name}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Searching vectors...</p>
          </div>
        )}

        {!loading && searchResults.length === 0 && searchTerm && (
          <div className="p-4 text-center text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No vectors found</p>
          </div>
        )}

        {!loading && searchResults.length > 0 && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {searchResults.map((vector) => (
                <Card 
                  key={vector.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectVector(vector)}
                >
                  <CardContent className="p-2">
                    <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
                      {vector.image?.source?.url ? (
                        <img
                          src={vector.image.source.url}
                          alt={vector.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs font-medium truncate" title={vector.title}>
                      {vector.title}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 truncate">
                        {vector.author?.name}
                      </span>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Heart className="h-3 w-3" />
                        <span>{vector.stats?.likes || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!loading && !searchTerm && (
          <div className="p-4 text-center text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Search for vectors to get started</p>
            <p className="text-xs mt-1">Try searching for "logo", "icon", or "illustration"</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FreepikSearch

