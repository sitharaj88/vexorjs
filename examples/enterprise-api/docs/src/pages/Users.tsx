import { EndpointCard } from '../components/EndpointCard';
import { Shield, UserCog } from 'lucide-react';

export function Users() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Users
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        User management endpoints with role-based access control.
      </p>

      {/* Role-Based Access */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Role-Based Access
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-purple-500" size={20} />
              <span className="font-semibold text-purple-800 dark:text-purple-200">Admin Role</span>
            </div>
            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <li>• List all users</li>
              <li>• View any user profile</li>
              <li>• Update any user (including role)</li>
              <li>• Delete/deactivate users</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <UserCog className="text-blue-500" size={20} />
              <span className="font-semibold text-blue-800 dark:text-blue-200">User Role</span>
            </div>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• View own profile only</li>
              <li>• Update own name and email</li>
              <li>• Cannot change own role</li>
              <li>• Cannot delete own account</li>
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
            path="/users"
            description="List all users with pagination and filtering"
            auth="required"
            role="Admin only"
            responseBody={`{
  "data": [
    {
      "id": 1,
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "email": "user@example.com",
      "name": "Regular User",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-15T10:35:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}`}
            parameters={[
              { name: 'page', type: 'number', description: 'Page number (default: 1)' },
              { name: 'limit', type: 'number', description: 'Items per page (default: 20, max: 100)' },
              { name: 'search', type: 'string', description: 'Search by name or email' },
              { name: 'role', type: 'string', description: 'Filter by role (admin, user)' },
              { name: 'isActive', type: 'boolean', description: 'Filter by active status' },
            ]}
          />

          <EndpointCard
            method="GET"
            path="/users/:id"
            description="Get user by ID (users can only view their own profile)"
            auth="required"
            responseBody={`{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isActive": true,
    "lastLoginAt": "2024-01-15T14:20:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:20:00.000Z"
  }
}`}
            parameters={[
              { name: 'id', type: 'number', required: true, description: 'User ID (path parameter)' },
            ]}
          />

          <EndpointCard
            method="PUT"
            path="/users/:id"
            description="Update user profile (users can update own name/email, admins can update any field)"
            auth="required"
            requestBody={`{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "role": "admin",
  "isActive": false
}`}
            responseBody={`{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "email": "newemail@example.com",
    "name": "Updated Name",
    "role": "admin",
    "isActive": false,
    "updatedAt": "2024-01-15T15:00:00.000Z"
  }
}`}
            parameters={[
              { name: 'id', type: 'number', required: true, description: 'User ID (path parameter)' },
              { name: 'name', type: 'string', description: 'New display name' },
              { name: 'email', type: 'string', description: 'New email address (must be unique)' },
              { name: 'role', type: 'string', description: 'New role (admin only can change)' },
              { name: 'isActive', type: 'boolean', description: 'Active status (admin only)' },
            ]}
          />

          <EndpointCard
            method="DELETE"
            path="/users/:id"
            description="Soft delete a user (deactivates the account)"
            auth="required"
            role="Admin only"
            responseBody={`{
  "message": "User deleted successfully"
}`}
            parameters={[
              { name: 'id', type: 'number', required: true, description: 'User ID (path parameter)' },
            ]}
          />

          <EndpointCard
            method="GET"
            path="/users/:id/orders"
            description="Get orders for a specific user"
            auth="required"
            responseBody={`{
  "data": [
    {
      "id": 1,
      "status": "delivered",
      "totalAmount": 299.99,
      "createdAt": "2024-01-10T09:00:00.000Z"
    },
    {
      "id": 2,
      "status": "pending",
      "totalAmount": 149.99,
      "createdAt": "2024-01-14T16:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}`}
            parameters={[
              { name: 'id', type: 'number', required: true, description: 'User ID (path parameter)' },
              { name: 'page', type: 'number', description: 'Page number (default: 1)' },
              { name: 'limit', type: 'number', description: 'Items per page (default: 20)' },
            ]}
          />
        </div>
      </section>

      {/* Notes */}
      <section className="p-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
          Important Notes
        </h3>
        <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
          <li>• Passwords are never returned in user objects</li>
          <li>• Deleting a user performs a soft delete (sets isActive to false)</li>
          <li>• Admins cannot delete their own account</li>
          <li>• Email changes require the new email to be unique</li>
        </ul>
      </section>
    </div>
  );
}
