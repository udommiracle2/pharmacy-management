import { useState } from 'react';
import Modal from './Modal';
import api from '../api/axios';

const emptyForm = {
  name: '',
  genericName: '',
  category: '',
  manufacturer: '',
  batchNumber: '',
  sku: '',
  unit: 'tablet',
  costPrice: '',
  sellingPrice: '',
  quantityInStock: '',
  reorderLevel: 10,
  expiryDate: '',
};

export default function MedicineFormModal({ medicine, onClose, onSaved }) {
  const isEdit = Boolean(medicine);
  const [form, setForm] = useState(() =>
    isEdit
      ? {
          ...emptyForm,
          ...medicine,
          expiryDate: medicine.expiryDate ? medicine.expiryDate.slice(0, 10) : '',
        }
      : emptyForm
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      ...form,
      costPrice: Number(form.costPrice),
      sellingPrice: Number(form.sellingPrice),
      quantityInStock: Number(form.quantityInStock),
      reorderLevel: Number(form.reorderLevel),
    };

    try {
      if (isEdit) {
        await api.put(`/medicines/${medicine._id}`, payload);
      } else {
        await api.post('/medicines', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this medicine. Check the fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit medicine' : 'Add medicine'} onClose={onClose} width="600px">
      <form onSubmit={handleSubmit}>
        {error && <p className="error-text">{error}</p>}

        <div className="field-row">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" value={form.name} onChange={handleChange('name')} required />
          </div>
          <div className="field">
            <label htmlFor="genericName">Generic name</label>
            <input id="genericName" value={form.genericName} onChange={handleChange('genericName')} />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              value={form.category}
              onChange={handleChange('category')}
              placeholder="e.g. Analgesic"
            />
          </div>
          <div className="field">
            <label htmlFor="manufacturer">Manufacturer</label>
            <input id="manufacturer" value={form.manufacturer} onChange={handleChange('manufacturer')} />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="batchNumber">Batch number</label>
            <input id="batchNumber" value={form.batchNumber} onChange={handleChange('batchNumber')} />
          </div>
          <div className="field">
            <label htmlFor="sku">SKU</label>
            <input id="sku" className="mono" value={form.sku} onChange={handleChange('sku')} />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="unit">Unit</label>
            <select id="unit" value={form.unit} onChange={handleChange('unit')}>
              <option value="tablet">Tablet</option>
              <option value="capsule">Capsule</option>
              <option value="bottle">Bottle</option>
              <option value="pack">Pack</option>
              <option value="sachet">Sachet</option>
              <option value="tube">Tube</option>
              <option value="vial">Vial</option>
              <option value="unit">Unit</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="expiryDate">Expiry date</label>
            <input
              id="expiryDate"
              type="date"
              value={form.expiryDate}
              onChange={handleChange('expiryDate')}
              required
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="costPrice">Cost price (₦)</label>
            <input
              id="costPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.costPrice}
              onChange={handleChange('costPrice')}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="sellingPrice">Selling price (₦)</label>
            <input
              id="sellingPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.sellingPrice}
              onChange={handleChange('sellingPrice')}
              required
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="quantityInStock">Quantity in stock</label>
            <input
              id="quantityInStock"
              type="number"
              min="0"
              value={form.quantityInStock}
              onChange={handleChange('quantityInStock')}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="reorderLevel">Low stock threshold</label>
            <input
              id="reorderLevel"
              type="number"
              min="0"
              value={form.reorderLevel}
              onChange={handleChange('reorderLevel')}
              required
            />
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add medicine'}
        </button>
      </form>
    </Modal>
  );
}
