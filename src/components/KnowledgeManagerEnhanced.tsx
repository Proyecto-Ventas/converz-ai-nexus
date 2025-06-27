import React, { useState } from 'react';
import { Upload, FileText, Trash2, Eye, Plus, Search, Edit, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import FileUploadManager from './FileUploadManager';
import WebScrapingManager from './WebScrapingManager';

const CATEGORIES = [
  'Productos y Servicios',
  'Políticas de Empresa',
  'Procesos de Venta',
  'Objeciones Comunes',
  'Precios y Promociones',
  'Competencia',
  'Protocolos de Atención',
  'Documentación Técnica',
  'Materiales de Capacitación',
  'Otros'
];

const KnowledgeManagerEnhanced = () => {
  const { documents, loading, createDocument, updateDocument, deleteDocument } = useKnowledgeBase();
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newDocument, setNewDocument] = useState({
    title: '',
    content: '',
    document_type: 'Productos y Servicios',
    tags: '',
  });
  const { toast } = useToast();

  const handleAddDocument = async () => {
    if (!newDocument.title.trim() || !newDocument.content.trim()) {
      toast({
        title: "Error",
        description: "El título y contenido son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createDocument({
        title: newDocument.title,
        content: newDocument.content,
        document_type: newDocument.document_type,
        tags: newDocument.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });

      setNewDocument({ title: '', content: '', document_type: 'Productos y Servicios', tags: '' });
      setIsAddingDocument(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUpdateDocument = async () => {
    if (!editingDocument?.title?.trim() || !editingDocument?.content?.trim()) {
      toast({
        title: "Error",
        description: "El título y contenido son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateDocument(editingDocument.id, {
        title: editingDocument.title,
        content: editingDocument.content,
        document_type: editingDocument.document_type,
        tags: typeof editingDocument.tags === 'string' 
          ? editingDocument.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
          : editingDocument.tags || []
      });

      setEditingDocument(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
    } catch (error) {
      // Error handled in hook
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.document_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Cargando documentos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Archivos</span>
          </TabsTrigger>
          <TabsTrigger value="web" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Web Scraping</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Base de Conocimiento</span>
                </div>
                <Button onClick={() => setIsAddingDocument(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Documento
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar en documentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{documents.length}</div>
                  <div className="text-sm text-gray-600">Total Documentos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{new Set(documents.map(d => d.document_type)).size}</div>
                  <div className="text-sm text-gray-600">Categorías</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatFileSize(documents.reduce((total, doc) => total + (doc.content?.length || 0), 0))}
                  </div>
                  <div className="text-sm text-gray-600">Tamaño Total</div>
                </div>
              </div>

              {/* Documents List */}
              <div className="space-y-3">
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No se encontraron documentos</p>
                  </div>
                ) : (
                  filteredDocuments.map((doc) => (
                    <Card key={doc.id} variant="elevated" className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-purple-600" />
                              <div>
                                <h3 className="font-medium">{doc.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {doc.content?.substring(0, 150)}...
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 pt-2 mt-3 border-t border-gray-100">
                              <Badge variant="outline">{doc.document_type}</Badge>
                              <span className="text-xs text-gray-500">
                                {formatFileSize(doc.content?.length || 0)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(doc.updated_at || doc.created_at || '').toLocaleDateString()}
                              </span>
                              {(doc.tags || []).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedDocument(doc)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{doc.title}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="flex items-center space-x-4">
                                    <Badge>{doc.document_type}</Badge>
                                    <span className="text-sm text-gray-500">{formatFileSize(doc.content?.length || 0)}</span>
                                    <span className="text-sm text-gray-500">
                                      Modificado: {new Date(doc.updated_at || doc.created_at || '').toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="prose dark:prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                      {doc.content}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingDocument({
                                ...doc,
                                tags: Array.isArray(doc.tags) ? doc.tags.join(', ') : ''
                              })}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <FileUploadManager />
        </TabsContent>

        <TabsContent value="web">
          <WebScrapingManager />
        </TabsContent>
      </Tabs>

      {/* Add Document Dialog */}
      <Dialog open={isAddingDocument} onOpenChange={setIsAddingDocument}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={newDocument.title}
                onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del documento..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select 
                value={newDocument.document_type} 
                onValueChange={(value) => setNewDocument(prev => ({ ...prev, document_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Etiquetas (separadas por comas)</Label>
              <Input
                value={newDocument.tags}
                onChange={(e) => setNewDocument(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="ventas, productos, objeciones..."
              />
            </div>

            <div className="space-y-2">
              <Label>Contenido</Label>
              <Textarea
                value={newDocument.content}
                onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Contenido del documento..."
                rows={10}
              />
            </div>

            <div className="flex space-x-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddingDocument(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddDocument}>
                Guardar Documento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={!!editingDocument} onOpenChange={() => setEditingDocument(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
          </DialogHeader>
          {editingDocument && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={editingDocument.title}
                  onChange={(e) => setEditingDocument(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título del documento..."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select 
                  value={editingDocument.document_type} 
                  onValueChange={(value) => setEditingDocument(prev => ({ ...prev, document_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Etiquetas (separadas por comas)</Label>
                <Input
                  value={editingDocument.tags}
                  onChange={(e) => setEditingDocument(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="ventas, productos, objeciones..."
                />
              </div>

              <div className="space-y-2">
                <Label>Contenido</Label>
                <Textarea
                  value={editingDocument.content}
                  onChange={(e) => setEditingDocument(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Contenido del documento..."
                  rows={10}
                />
              </div>

              <div className="flex space-x-2 justify-end">
                <Button variant="outline" onClick={() => setEditingDocument(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateDocument}>
                  Actualizar Documento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeManagerEnhanced;
