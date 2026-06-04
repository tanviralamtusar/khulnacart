import { useEffect, useState, useRef } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Package, Upload, X, Image as ImageIcon, Loader2, Play, CalendarIcon, Copy } from 'lucide-react';
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getAllCategories 
} from '@/services/adminService';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import BackButton from '@/components/ui/BackButton';

interface ProductVariation {
  id?: string;
  clientId: string; // local-only stable key for React lists
  name: string;
  price: number;
  original_price?: number;
  stock: number;
  sort_order: number;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  long_description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  stock: number;
  images: string[] | null;
  video_url: string | null;
  tags: string[] | null;
  is_featured: boolean | null;
  is_new: boolean | null;
  is_active: boolean | null;
  categories?: { id: string; name: string } | null;
  created_at?: string;
}

interface Category {
  id: string;
  name: string;
}

const initialFormState = {
  name: '',
  slug: '',
  description: '',
  short_description: '',
  long_description: '',
  price: 0,
  original_price: 0,
  category_id: '',
  stock: 0,
  images: '',
  video_url: '',
  tags: '',
  is_featured: false,
  is_new: false,
  is_active: true,
};

const defaultVariations: ProductVariation[] = [
  { clientId: crypto.randomUUID(), name: '', price: 0, stock: 100, sort_order: 1, is_active: true },
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  
  // Date filter state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // Variations state
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [hasVariations, setHasVariations] = useState(false);

  // Image upload state
  const [productImages, setProductImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
      ]);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadProductVariations = async (productId: string) => {
    const { data, error } = await supabase
      .from('product_variations')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order');

    if (error) {
      console.error('Failed to load variations:', error);
      setVariations([]);
      setHasVariations(false);
      return;
    }

    if (data && data.length > 0) {
      // Deduplicate by normalized name (a product should not show same size multiple times)
      const uniqueVariations = Array.from(
        new Map(
          data
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((v) => [String(v.name).trim().toLowerCase(), v])
        ).values()
      );

      setVariations(
        uniqueVariations.map((v) => ({
          id: v.id,
          clientId: v.id ?? crypto.randomUUID(),
          name: v.name,
          price: v.price,
          original_price: v.original_price || undefined,
          stock: v.stock,
          sort_order: v.sort_order || 0,
          is_active: v.is_active ?? true,
        }))
      );
      setHasVariations(true);
    } else {
      setVariations([]);
      setHasVariations(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    
    // Date filtering
    if (dateRange?.from) {
      const productDate = product.created_at ? new Date(product.created_at) : null;
      if (!productDate) return false;
      
      const start = startOfDay(dateRange.from);
      const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
      
      const withinRange = isWithinInterval(productDate, { start, end });
      return matchesSearch && withinRange;
    }
    
    return matchesSearch;
  });

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setVariations([]);
    setHasVariations(false);
    setProductImages([]);
    setIsDialogOpen(true);
  };

  const openEditDialog = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      short_description: product.short_description || '',
      long_description: product.long_description || '',
      price: product.price,
      original_price: product.original_price || 0,
      category_id: product.category_id || '',
      stock: product.stock,
      images: '',
      video_url: product.video_url || '',
      tags: product.tags?.join(', ') || '',
      is_featured: product.is_featured || false,
      is_new: product.is_new || false,
      is_active: product.is_active ?? true,
    });
    setProductImages(product.images || []);
    await loadProductVariations(product.id);
    setIsDialogOpen(true);
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    
    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('shop-assets')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('shop-assets')
          .getPublicUrl(fileName);

        setProductImages(prev => [...prev, urlData.publicUrl]);
        toast.success(`${file.name} uploaded successfully`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddImageUrl = () => {
    const url = formData.images.trim();
    if (url && url.startsWith('http')) {
      setProductImages(prev => [...prev, url]);
      setFormData({ ...formData, images: '' });
    }
  };

  const handleAddVariation = () => {
    setVariations([
      ...variations,
      {
        clientId: crypto.randomUUID(),
        name: '',
        price: 0,
        stock: 100,
        sort_order: variations.length + 1,
        is_active: true,
      },
    ]);
  };

  const handleAddDefaultVariations = () => {
    setVariations(defaultVariations.map((v) => ({ ...v, clientId: crypto.randomUUID() })));
    setHasVariations(true);
  };

  const handleRemoveVariation = (clientId: string) => {
    setVariations((prev) => prev.filter((v) => v.clientId !== clientId));
  };

  const handleVariationChange = (
    clientId: string,
    field: keyof ProductVariation,
    value: any
  ) => {
    setVariations((prev) =>
      prev.map((v) => (v.clientId === clientId ? { ...v, [field]: value } : v))
    );
  };

  const saveVariations = async (productId: string) => {
    // Delete existing variations (FK on order_items now SET NULL, cart_items CASCADE)
    const { error: deleteError } = await supabase
      .from('product_variations')
      .delete()
      .eq('product_id', productId);

    if (deleteError) {
      console.error('Failed to delete old variations:', deleteError);
      toast.error('সাইজ আপডেট করতে ব্যর্থ: ' + deleteError.message);
      throw deleteError;
    }

    // Insert new variations
    if (hasVariations && variations.length > 0) {
      const validVariations = variations.filter((v) => v.name && v.price > 0);

      // Dedupe by normalized name before saving (prevents accidental duplicates in UI)
      const uniqueValidVariations = Array.from(
        new Map(
          validVariations
            .map((v) => [String(v.name).trim().toLowerCase(), v])
        ).values()
      );

      if (uniqueValidVariations.length > 0) {
        const { error } = await supabase
          .from('product_variations')
          .insert(
            uniqueValidVariations.map((v, idx) => ({
              product_id: productId,
              name: v.name,
              price: v.price,
              original_price: v.original_price || null,
              stock: v.stock,
              sort_order: idx + 1,
              is_active: v.is_active,
            }))
          );
        
        if (error) {
          console.error('Failed to save variations:', error);
          toast.error('সাইজ সেভ করতে ব্যর্থ: ' + error.message);
          throw error;
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description || undefined,
        short_description: formData.short_description || undefined,
        long_description: formData.long_description || undefined,
        price: formData.price,
        original_price: formData.original_price || undefined,
        category_id: formData.category_id || undefined,
        stock: formData.stock,
        images: productImages.length > 0 ? productImages : [],
        video_url: formData.video_url || undefined,
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()) : [],
        is_featured: formData.is_featured,
        is_new: formData.is_new,
        is_active: formData.is_active,
      };

      let productId: string;

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        productId = editingProduct.id;
        toast.success('Product updated successfully');
      } else {
        const newProduct = await createProduct(productData);
        productId = newProduct.id;
        toast.success('Product created successfully');
      }


      // Save variations
      await saveVariations(productId);

      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      // Delete variations first
      await supabase.from('product_variations').delete().eq('product_id', id);
      await deleteProduct(id);
      toast.success('Product deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleDuplicate = async (product: Product) => {
    try {
      setSubmitting(true);
      
      // Create duplicated product data
      const duplicatedData = {
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Date.now()}`,
        description: product.description || undefined,
        short_description: product.short_description || undefined,
        long_description: product.long_description || undefined,
        price: product.price,
        original_price: product.original_price || undefined,
        category_id: product.category_id || undefined,
        stock: product.stock,
        images: product.images || [],
        video_url: product.video_url || undefined,
        tags: product.tags || [],
        is_featured: product.is_featured || false,
        is_new: product.is_new || false,
        is_active: false, // Set as inactive by default
      };

      // Create the new product
      const newProduct = await createProduct(duplicatedData);

      // Fetch and duplicate variations
      const { data: existingVariations } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', product.id)
        .order('sort_order');

      if (existingVariations && existingVariations.length > 0) {
        await supabase.from('product_variations').insert(
          existingVariations.map((v, idx) => ({
            product_id: newProduct.id,
            name: v.name,
            price: v.price,
            original_price: v.original_price || null,
            stock: v.stock,
            sort_order: idx + 1,
            is_active: v.is_active,
          }))
        );
      }

      toast.success('প্রোডাক্ট ডুপ্লিকেট হয়েছে');
      loadData();
    } catch (error) {
      console.error('Duplicate error:', error);
      toast.error('ডুপ্লিকেট করতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <BackButton fallbackPath="/admin" className="mb-2" />
          <h1 className="text-3xl font-display font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated if empty"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description (প্রোডাক্টের পাশে দেখাবে)</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  rows={3}
                  placeholder="প্রোডাক্ট ইমেজের পাশে সংক্ষিপ্ত বিবরণ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="long_description">Long Description (প্রোডাক্ট পেজের নিচে দেখাবে)</Label>
                <Textarea
                  id="long_description"
                  value={formData.long_description}
                  onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                  rows={6}
                  placeholder="বিস্তারিত বিবরণ - ফিচার, উপকরণ, ব্যবহার ইত্যাদি"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Base Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Images Section */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  প্রোডাক্ট ছবি (Product Images)
                </Label>
                
                {/* Image Preview Grid */}
                {productImages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {productImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Product ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="gap-2"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        আপলোড হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        ছবি আপলোড করুন
                      </>
                    )}
                  </Button>
                </div>

                {/* URL Input */}
                <div className="flex gap-2">
                  <Input
                    id="images"
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    placeholder="Or paste image URL here..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddImageUrl}
                    disabled={!formData.images.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Product Video Section */}
              <div className="space-y-2">
                <Label htmlFor="video_url" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  প্রোডাক্ট ভিডিও (Product Video)
                </Label>
                <Textarea
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="YouTube/Facebook লিংক অথবা Facebook Embed কোড (<iframe...>) পেস্ট করুন"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  সাপোর্টেড: YouTube, YouTube Shorts, Facebook Video, Facebook Reel, সরাসরি ভিডিও URL (.mp4), অথবা Facebook Embed Code
                </p>
                <p className="text-xs text-muted-foreground">
                  উদাহরণ: https://www.facebook.com/reel/123456789 অথবা সম্পূর্ণ &lt;iframe...&gt; কোড
                </p>
                {formData.video_url && (
                  <div className="mt-2 p-2 bg-muted rounded-lg flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <p className="text-sm text-muted-foreground">ভিডিও যুক্ত হয়েছে - ল্যান্ডিং পেজে স্বয়ংক্রিয়ভাবে সঠিক সাইজে দেখা যাবে</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="electronics, gadgets, new"
                />
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_new"
                    checked={formData.is_new}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                  />
                  <Label htmlFor="is_new">New</Label>
                </div>
              </div>

              {/* Size Variations Section */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">প্রোডাক্ট ভ্যারিয়েশন (Product Variations - Size, Kg, Ml etc.)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="hasVariations"
                      checked={hasVariations}
                      onCheckedChange={(checked) => {
                        setHasVariations(checked);
                        if (checked && variations.length === 0) {
                          handleAddDefaultVariations();
                        }
                      }}
                    />
                    <Label htmlFor="hasVariations" className="text-sm">Enable</Label>
                  </div>
                </div>

                {hasVariations && (
                  <div className="space-y-3 bg-muted/50 rounded-lg p-3 sm:p-4">
                    {/* Header: only show on tablet/desktop */}
                    <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground mb-2">
                      <div className="col-span-3">ভ্যারিয়েশন (Size/Kg/Ml)</div>
                      <div className="col-span-3">দাম (Price) ৳</div>
                      <div className="col-span-3">আগের দাম</div>
                      <div className="col-span-2">স্টক</div>
                      <div className="col-span-1"></div>
                    </div>
                    
                    {variations.map((variation) => (
                      <div key={variation.clientId} className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-2 p-3 sm:p-0 border sm:border-0 rounded-lg sm:rounded-none bg-background sm:bg-transparent items-start sm:items-center relative">
                        <div className="w-full sm:col-span-3">
                          <Label className="sm:hidden text-xs text-muted-foreground mb-1 block">ভ্যারিয়েশন (Size/Kg/Ml)</Label>
                          <Input
                            placeholder="যেমন: Size 36, 1kg, 500ml..."
                            value={variation.name}
                            onChange={(e) => handleVariationChange(variation.clientId, 'name', e.target.value)}
                          />
                        </div>
                        <div className="w-full sm:col-span-3">
                          <Label className="sm:hidden text-xs text-muted-foreground mb-1 block">দাম (Price) ৳</Label>
                          <Input
                            type="number"
                            placeholder="950"
                            value={variation.price || ''}
                            onChange={(e) =>
                              handleVariationChange(
                                variation.clientId,
                                'price',
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div className="w-full sm:col-span-3">
                          <Label className="sm:hidden text-xs text-muted-foreground mb-1 block">আগের দাম</Label>
                          <Input
                            type="number"
                            placeholder="Optional"
                            value={variation.original_price || ''}
                            onChange={(e) =>
                              handleVariationChange(
                                variation.clientId,
                                'original_price',
                                parseFloat(e.target.value) || undefined
                              )
                            }
                          />
                        </div>
                        <div className="w-full sm:col-span-2">
                          <Label className="sm:hidden text-xs text-muted-foreground mb-1 block">স্টক</Label>
                          <Input
                            type="number"
                            value={variation.stock}
                            onChange={(e) =>
                              handleVariationChange(
                                variation.clientId,
                                'stock',
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div className="absolute right-2 top-2 sm:static sm:col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveVariation(variation.clientId)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddVariation}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      আরো যোগ করুন
                    </Button>

                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:max-w-sm"
              />
            </div>
            
            {/* Date Range Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-full sm:w-[240px]",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>তারিখ অনুসারে ফিল্টার</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            {dateRange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateRange(undefined)}
                className="text-destructive w-fit self-start sm:self-auto"
              >
                <X className="h-4 w-4 mr-1" />
                ক্লিয়ার
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Mobile View: Cards */}
          <div className="md:hidden space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border border-border rounded-xl p-4 bg-card relative shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-20 w-20 rounded-xl object-cover border border-border shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-[#2563eb] text-base line-clamp-1 flex-1" title={product.name}>
                        {product.name}
                      </h3>
                      {product.created_at && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-1">
                          {format(new Date(product.created_at), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#3b82f6] font-medium mt-0.5 truncate" title={product.slug || ''}>
                      Slug: {product.slug}
                    </p>

                    {/* Details list, matching key-value pairs */}
                    <div className="mt-3 space-y-1 text-xs text-foreground">
                      <div className="flex">
                        <span className="w-20 text-muted-foreground">Category</span>
                        <span className="text-muted-foreground mr-2">:</span>
                        <span className="font-medium text-foreground">{product.categories?.name || '-'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-20 text-muted-foreground">Price</span>
                        <span className="text-muted-foreground mr-2">:</span>
                        <span className="font-semibold text-foreground">৳{product.price.toFixed(0)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20 text-muted-foreground">Stock</span>
                        <span className="text-muted-foreground mr-2">:</span>
                        <Badge variant={product.stock < 10 ? 'destructive' : 'secondary'} className="text-[10px] font-semibold px-2 py-0">
                          {product.stock}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <div>
                    <Badge variant={product.is_active ? 'default' : 'outline'} className={cn(
                      "text-xs font-semibold px-3 py-1 rounded-full",
                      product.is_active ? "bg-[#eab308] hover:bg-[#eab308]/90 text-white border-0" : ""
                    )}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(product)}
                      title="ডুপ্লিকেট করুন"
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(product)}
                      title="সম্পাদনা করুন"
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      title="ডিলিট করুন"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border rounded-xl bg-card">
                No products found
              </div>
            )}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3 max-w-[140px] sm:max-w-[250px] md:max-w-[350px]">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="font-medium truncate" title={product.name}>
                            {product.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate" title={product.slug || ''}>
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{product.categories?.name || '-'}</TableCell>
                    <TableCell>৳{product.price.toFixed(0)}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock < 10 ? 'destructive' : 'secondary'}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={product.is_active ? 'default' : 'outline'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(product)}
                          title="ডুপ্লিকেট করুন"
                          className="h-8 w-8 shrink-0"
                        >
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(product)}
                          className="h-8 w-8 shrink-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          className="h-8 w-8 shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
