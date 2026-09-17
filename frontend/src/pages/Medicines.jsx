import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Topbar from '../components/Topbar';
import Loader from '../components/Loader';
import MedicineFormModal from '../components/MedicineFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency, formatDate, daysUntil } from '../utils/format';
import './Medicines.css';

function StockBadge({ medicine }) {
  if (medicine.quantityInStock <= medicine.reorderLevel) {
    return <span className="badge badge-warning">Low stock</span>;
  }
  return <span className="badge badge-success">In stock</span>;
}

function ExpiryBadge({ medicine }) {
  const days = daysUntil(medicine.expiryDate);
  if (days < 0) return <span className="badge badge-danger">Expired</span>;
  if (days <= 30) return <span className="badge badge-warning">Expires in {days}d</span>;
  return null;
}

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');

  const loadMedicines = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get('/medicines', { params: q ? { q } : {} });
      setMedicines(res.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  useEffect(() => {
    const timeout = setTimeout(() => loadMedicines(search), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSaved = () => {
    setShowForm(false);
    setEditingMedicine(null);
    loadMedicines(search);
  };

  const handleDelete = async () => {
    setError('');
    try {
      await api.delete(`/medicines/${deleteTarget._id}`);
      setDeleteTarget(null);
      loadMedicines(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this medicine.');
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <Topbar
        title="Medicines"
        subtitle="Add, edit and track every medicine in stock."
        actions={
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingMedicine(null);
              setShowForm(true);
            }}
          >
            + Add medicine
          </button>
        }
      />

      <div className="medicines-search">
        <input
          type="search"
          placeholder="Search by name, generic name, SKU or manufacturer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <Loader label="Loading medicines…" />
      ) : medicines.length === 0 ? (
        <div className="card empty-state">No medicines match your search yet.</div>
      ) : (
        <div className="card medicines-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Expiry</th>
                <th>Price</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div className="medicine-name">{m.name}</div>
                    {m.genericName && <div className="medicine-generic">{m.genericName}</div>}
                  </td>
                  <td>{m.category}</td>
                  <td>
                    {m.quantityInStock} {m.unit}
                    {m.quantityInStock === 1 ? '' : 's'}
                  </td>
                  <td>{formatDate(m.expiryDate)}</td>
                  <td>{formatCurrency(m.sellingPrice)}</td>
                  <td>
                    <div className="medicine-badges">
                      <StockBadge medicine={m} />
                      <ExpiryBadge medicine={m} />
                    </div>
                  </td>
                  <td className="medicine-actions">
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        setEditingMedicine(m);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => setDeleteTarget(m)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <MedicineFormModal
          medicine={editingMedicine}
          onClose={() => {
            setShowForm(false);
            setEditingMedicine(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete medicine"
          message={`Remove "${deleteTarget.name}" from inventory? This can't be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
