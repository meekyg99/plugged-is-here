import { useParams, useLocation } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductForm from '../../components/admin/ProductForm';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '../../hooks/useNavigate';

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isNewProduct = location.pathname.includes('/new');

  const handleSuccess = () => {
    navigate('/admin/products');
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  return (
    <AdminLayout activePage="products">
      <div className="p-8">
        <button
          onClick={() => navigate('/admin/products')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="uppercase tracking-wider text-sm">Back to Products</span>
        </button>

        <h1 className="text-3xl tracking-wider uppercase font-light mb-8">
          {isNewProduct ? 'Create New Product' : 'Edit Product'}
        </h1>

        <ProductForm
          productId={isNewProduct ? undefined : id}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </AdminLayout>
  );
}
