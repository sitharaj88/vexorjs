import { EndpointCard } from '../components/EndpointCard';
import { Package, Tag, BarChart3 } from 'lucide-react';

export function Products() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Products
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        Product management endpoints with public read access and admin-only modifications.
      </p>

      {/* Access Levels */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Access Levels
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-2">
              <Package className="text-emerald-500" size={20} />
              <span className="font-semibold text-emerald-800 dark:text-emerald-200">Public</span>
            </div>
            <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
              <li>• List products</li>
              <li>• View categories</li>
              <li>• Get product details</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="text-blue-500" size={20} />
              <span className="font-semibold text-blue-800 dark:text-blue-200">Authenticated</span>
            </div>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• All public access</li>
              <li>• See inactive products (admin)</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="text-purple-500" size={20} />
              <span className="font-semibold text-purple-800 dark:text-purple-200">Admin Only</span>
            </div>
            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <li>• Create products</li>
              <li>• Update products</li>
              <li>• Delete products</li>
              <li>• Manage stock</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          Endpoints
        </h2>

        <div className="space-y-4">
          <EndpointCard
            method="GET"
            path="/products"
            description="List all products with filtering and pagination (public)"
            auth="optional"
            responseBody={`{
  "data": [
    {
      "id": 1,
      "name": "Wireless Headphones",
      "description": "High-quality wireless headphones",
      "price": 99.99,
      "stock": 50,
      "category": "Electronics",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}`}
            parameters={[
              { name: 'page', type: 'number', description: 'Page number (default: 1)' },
              { name: 'limit', type: 'number', description: 'Items per page (default: 20)' },
              { name: 'search', type: 'string', description: 'Search by name or description' },
              { name: 'category', type: 'string', description: 'Filter by category' },
              { name: 'minPrice', type: 'number', description: 'Minimum price filter' },
              { name: 'maxPrice', type: 'number', description: 'Maximum price filter' },
              { name: 'inStock', type: 'boolean', description: 'Only show in-stock products' },
            ]}
          />

          <EndpointCard
            method="GET"
            path="/products/categories"
            description="Get all product categories with counts (public)"
            responseBody={`{
  "categories": [
    { "category": "Electronics", "count": 25 },
    { "category": "Books", "count": 15 },
    { "category": "Clothing", "count": 42 }
  ]
}`}
          />

          <EndpointCard
            method="GET"
            path="/products/:id"
            description="Get a single product by ID (public)"
            auth="optional"
            responseBody={`{
  "product": {
    "id": 1,
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "price": 99.99,
    "stock": 50,
    "category": "Electronics",
    "isActive": true,
    "createdBy": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}`}
            parameters={[
              { name: 'id', type: 'number', required: true, description: 'Product ID (path parameter)' },
            ]}
          />

          <EndpointCard
            method="POST"
            path="/products"
            description="Create a new product"
            auth="required"
            role="Admin only"
            requestBody={`{
  "name": "New Product",
  "description": "Product description",
  "price": 49.99,
  "stock": 100,
  "category": "Electronics"
}`}
            responseBody={`{
  "message": "Product created successfully",
  "product": {
    "id": 4,
    "name": "New Product",
    "description": "Product description",
    "price": 49.99,
    "stock": 100,
    "category": "Electronics",
    "isActive": true,
    "createdBy": 1,
    "createdAt": "2024-01-15T16:00:00.000Z"
  }
}`}
            parameters={[
              { name: 'name', type: 'string', required: true, description: 'Product name' },
              { name: 'description', type: 'string', description: 'Product description' },
              { name: 'price', type: 'number', required: true, description: 'Product price (non-negative)' },
              { name: 'stock', type: 'number', description: 'Initial stock quantity (default: 0)' },
              { name: 'category', type: 'string', description: 'Product category' },
            ]}
          />

          <EndpointCard
            method="PUT"
            path="/products/:id"
            description="Update a product"
            auth="required"
            role="Admin only"
            requestBody={`{
  "name": "Updated Product Name",
  "price": 79.99,
  "stock": 75,
  "isActive": true
}`}
            responseBody={`{
  "message": "Product updated successfully",
  "product": {
    "id": 1,
    "name": "Updated Product Name",
    "price": 79.99,
    "stock": 75,
    "isActive": true,
    "updatedAt": "2024-01-15T17:00:00.000Z"
  }
}`}
            parameters={[
              { name: 'id', type: 'number', required: true, description: 'Product ID (path parameter)' },
              { name: 'name', type: 'string', description: 'New product name' },
              { name: 'description', type: 'string', description: 'New description' },
              { name: 'price', type: 'number', description: 'New price' },
              { name: 'stock', type: 'number', description: 'New stock quantity' },
              { name: 'category', type: 'string', description: 'New category' },
              { name: 'isActive', type: 'boolean', description: 'Active status' },
            ]}
          />

          <EndpointCard
            method="DELETE"
            path="/products/:id"
            description="Soft delete a product (sets isActive to false)"
            auth="required"
            role="Admin only"
            responseBody={`{
  "message": "Product deleted successfully"
}`}
            parameters={[
              { name: 'id', type: 'number', required: true, description: 'Product ID (path parameter)' },
            ]}
          />

          <EndpointCard
            method="PATCH"
            path="/products/:id/stock"
            description="Update product stock (adjustment or absolute value)"
            auth="required"
            role="Admin only"
            requestBody={`// Relative adjustment
{
  "adjustment": -10
}

// OR absolute value
{
  "absolute": 500
}`}
            responseBody={`{
  "message": "Stock updated successfully",
  "previousStock": 100,
  "newStock": 90
}`}
            parameters={[
              { name: 'id', type: 'number', required: true, description: 'Product ID (path parameter)' },
              { name: 'adjustment', type: 'number', description: 'Relative stock change (can be negative)' },
              { name: 'absolute', type: 'number', description: 'Set absolute stock value' },
            ]}
          />
        </div>
      </section>

      {/* Notes */}
      <section className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
          Notes
        </h3>
        <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <li>• Non-admin users only see active products (isActive = true)</li>
          <li>• Delete operation is a soft delete that sets isActive to false</li>
          <li>• Stock cannot go below 0 when using adjustment</li>
          <li>• Category is optional and can be used for filtering</li>
        </ul>
      </section>
    </div>
  );
}
