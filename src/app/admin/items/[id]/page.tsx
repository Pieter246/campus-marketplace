"use client";"use client";



import { useParams, useRouter } from "next/navigation";import { useParams, useRouter } from "next/navigation";

import { useEffect, useState } from "react";import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";

type Item = {

  id: string;type Item = {

  title: string;  id: string;

  description: string;  title: string;

  price: number;  description: string;

  condition: string;  price: number;

  status: string;  images: string[];

  category: string;  seller: {

  photos: string[];    name: string;

  sellerId: string;    email: string;

  sellerEmail: string;  };

  createdAt: string;};

};

export default function ItemReviewPage() {

export default function ItemReviewPage() {  const { id } = useParams();

  const { id } = useParams();  const router = useRouter();

  const router = useRouter();  const [item, setItem] = useState<Item | null>(null);

  const [item, setItem] = useState<Item | null>(null);  const [loading, setLoading] = useState(true);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState<string | null>(null);  useEffect(() => {

  const [error, setError] = useState<string | null>(null);    // Placeholder: replace with backend call

    setTimeout(() => {

  const fetchItem = async () => {      setItem({

    try {        id: id as string,

      setLoading(true);        title: "MacBook Pro 13” 2022",

      const response = await fetch(`/api/items/${id}`);        description:

                "Lightly used MacBook Pro in excellent condition. Perfect for students.",

      if (!response.ok) {        price: 1200,

        throw new Error('Failed to fetch item');        images: [

      }          "/test-photos/macbook.jpg",

                "/test-photos/macbook2.jpg",

      const data = await response.json();        ],

              seller: {

      if (data.success) {          name: "Alex Johnson",

        setItem(data.item);          email: "alex.johnson@university.edu",

      } else {        },

        throw new Error(data.error || 'Item not found');      });

      }      setLoading(false);

    } catch (err) {    }, 800);

      console.error('Error fetching item:', err);  }, [id]);

      setError(err instanceof Error ? err.message : 'Failed to load item');

    } finally {  if (loading) return <p>Loading item...</p>;

      setLoading(false);  if (!item) return <p>Item not found</p>;

    }

  };  return (

    <div>

  const handleAction = async (action: string) => {      <button

    if (!item) return;        onClick={() => router.back()}

            className="mb-4 text-sm hover:underline cursor-pointer"

    try {      >

      setActionLoading(action);        ← Back to Items

      const response = await fetch('/api/admin/items', {      </button>

        method: 'PUT',

        headers: {      <h1 className="text-2xl font-bold mb-4">{item.title}</h1>

          'Content-Type': 'application/json',

        },      {/* Images */}

        body: JSON.stringify({      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

          itemId: item.id,        {item.images.map((img, index) => (

          action: action          <img

        })            key={index}

      });            src={img}

            alt={item.title}

      const data = await response.json();            className="w-full h-64 object-cover rounded-lg shadow"

                />

      if (data.success) {        ))}

        // Update local item status      </div>

        setItem(prev => prev ? { ...prev, status: data.newStatus } : null);

        alert(`Item ${action}d successfully`);      {/* Item Details */}

              <div className="bg-white shadow rounded p-6 mb-6">

        // Optionally redirect back to items list        <h2 className="text-lg font-semibold mb-2">Description</h2>

        if (action === 'delete') {        <p className="text-gray-700 mb-4">{item.description}</p>

          router.push('/admin/items');

        }        <p className="text-lg font-bold text-primary mb-4">

      } else {          Price: ${item.price}

        throw new Error(data.error || `Failed to ${action} item`);        </p>

      }

    } catch (err) {        <div className="text-sm text-gray-600">

      console.error(`Error ${action}ing item:`, err);          <p>

      alert(err instanceof Error ? err.message : `Failed to ${action} item`);            <span className="font-medium">Seller:</span> {item.seller.name}

    } finally {          </p>

      setActionLoading(null);          <p>

    }            <span className="font-medium">Email:</span> {item.seller.email}

  };          </p>

        </div>

  useEffect(() => {      </div>

    if (id) {

      fetchItem();      {/* Admin Actions */}

    }      <div className="flex gap-2">

  }, [id]);        <Button

          type="button"

  const getStatusColor = (status: string) => {          className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 cursor-pointer"

    switch (status) {          variant="secondary"

      case 'approved': return 'text-green-600 bg-green-50 border-green-200';          onClick={() => router.push("/admin/items")}

      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';        >

      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';          Approve Item

      case 'suspended': return 'text-orange-600 bg-orange-50 border-orange-200';        </Button>

      default: return 'text-gray-600 bg-gray-50 border-gray-200';        <Button

    }          type="button"

  };          className="w-full py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 cursor-pointer"

          variant="secondary"

  if (loading) {          onClick={() => router.push("/admin/items")}

    return (        >

      <div>          Reject Item

        <button        </Button>

          onClick={() => router.back()}      </div>

          className="mb-4 text-sm hover:underline cursor-pointer text-primary"    </div>

        >  );

          ← Back to Items}

        </button>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading item...</span>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div>
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm hover:underline cursor-pointer text-primary"
        >
          ← Back to Items
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-700 text-sm mt-1">{error || 'Item not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm hover:underline cursor-pointer text-primary"
      >
        ← Back to Items
      </button>

      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold">{item.title}</h1>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status)}`}>
          {item.status}
        </div>
      </div>

      {/* Images */}
      {item.photos && item.photos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {item.photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`${item.title} - Image ${index + 1}`}
              className="w-full h-64 object-cover rounded-lg shadow"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center">
          <p className="text-gray-500">No images available</p>
        </div>
      )}

      {/* Item Details */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Item Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 mb-4">{item.description || 'No description provided'}</p>
            
            <div className="space-y-2">
              <p><span className="font-medium">Price:</span> <span className="text-primary font-bold">${item.price}</span></p>
              <p><span className="font-medium">Condition:</span> {item.condition}</p>
              <p><span className="font-medium">Category:</span> {item.category}</p>
              <p><span className="font-medium">Listed:</span> {new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Seller Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Email:</span> {item.sellerEmail}</p>
              <p><span className="font-medium">Seller ID:</span> {item.sellerId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Admin Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleAction('approve')}
            disabled={actionLoading !== null || item.status === 'approved'}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
          </button>
          
          <button
            onClick={() => handleAction('reject')}
            disabled={actionLoading !== null || item.status === 'rejected'}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
          </button>
          
          <button
            onClick={() => handleAction('suspend')}
            disabled={actionLoading !== null || item.status === 'suspended'}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading === 'suspend' ? 'Suspending...' : 'Suspend'}
          </button>
          
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                handleAction('delete');
              }
            }}
            disabled={actionLoading !== null}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading === 'delete' ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}