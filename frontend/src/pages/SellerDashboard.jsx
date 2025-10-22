import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import ListingCard from '../components/ListingCard';
import api from '../utils/api';
import { toast } from 'sonner';
import { Plus, Package, DollarSign, Eye, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const categories = ['Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Beauty', 'Toys', 'Services'];

const SellerDashboard = ({ user }) => {
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddListing, setShowAddListing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    images: '',
    stock: '1',
    type: 'product'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [listingsRes, ordersRes] = await Promise.all([
        api.get('/listings'),
        api.get('/orders')
      ]);
      
      const myListings = listingsRes.data.filter(p => p.seller_id === user.id);
      setListings(myListings);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddListing = async (e) => {
    e.preventDefault();
    
    try {
      const images = formData.images.split(',').map(img => img.trim()).filter(Boolean);
      if (images.length === 0) {
        images.push('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400');
      }

      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        images,
        tags: []
      };

      if (formData.type === 'product') {
        dataToSend.stock = parseInt(formData.stock);
      } else {
        delete dataToSend.stock; // Services don't have stock
      }

      await api.post('/listings', dataToSend);

      toast.success('Listing added successfully!');
      setShowAddListing(false);
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        images: '',
        stock: '1',
        type: 'product'
      });
      fetchData();
    } catch (error) {
      console.error('Error adding listing:', error);
      toast.error(error.response?.data?.detail || 'Failed to add listing');
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalViews = listings.reduce((sum, listing) => sum + (listing.reviews_count || 0), 0);

  // Chart data
  const chartData = [
    { day: 'Mon', sales: 1200, views: 4600 },
    { day: 'Tue', sales: 980, views: 5200 },
    { day: 'Wed', sales: 1400, views: 6100 },
    { day: 'Thu', sales: 900, views: 4300 },
    { day: 'Fri', sales: 1700, views: 7200 }
  ];

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}!</p>
          </div>
          <Dialog open={showAddListing} onOpenChange={setShowAddListing}>
            <DialogTrigger asChild>
              <Button data-testid="add-listing-button">
                <Plus size={18} className="mr-2" />
                Add Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Listing</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddListing} className="space-y-4" data-testid="add-listing-form">
                <div className="space-y-2">
                  <Label htmlFor="title">Listing Title*</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="listing-title-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description*</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    data-testid="listing-description-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD)*</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      data-testid="listing-price-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type*</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                      required
                    >
                      <SelectTrigger data-testid="listing-type-select">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.type === 'product' && (
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock*</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="1"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      data-testid="listing-stock-input"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="category">Category*</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger data-testid="listing-category-select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="images">Image URLs (comma-separated)</Label>
                  <Input
                    id="images"
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    data-testid="listing-images-input"
                  />
                  <p className="text-xs text-muted-foreground">Leave empty to use default image</p>
                </div>
                <Button type="submit" className="w-full" data-testid="submit-listing-button">
                  Add Listing
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="total-listings">{listings.length}</p>
                  <p className="text-sm text-muted-foreground">Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <DollarSign className="text-emerald-500" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="total-revenue">${totalRevenue.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="text-blue-500" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="total-orders">{orders.length}</p>
                  <p className="text-sm text-muted-foreground">Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Eye className="text-purple-500" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalViews}</p>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-semibold">Sales & Views Overview</h3>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: 6, right: 6 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(202 84% 38%)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(202 84% 38%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(202 84% 38%)"
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="listings">
          <TabsList>
            <TabsTrigger value="listings" data-testid="tab-listings">My Listings</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-6">
            {listings.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6" data-testid="listings-grid">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-10 pb-10 text-center">
                  <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No listings yet</p>
                  <p className="text-muted-foreground mb-4">Start selling by adding your first listing</p>
                  <Button onClick={() => setShowAddListing(true)}>Add Listing</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            {orders.length > 0 ? (
              <div className="space-y-4" data-testid="orders-list">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{order.listing_title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Order from: {order.buyer_name}
                          </p>
                        </div>
                        <Badge>{order.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-medium">{order.quantity}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Payment</p>
                          <p className="font-medium capitalize">{order.payment_status}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-10 pb-10 text-center">
                  <TrendingUp size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No orders yet</p>
                  <p className="text-muted-foreground">Orders will appear here once customers purchase your listings</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerDashboard;