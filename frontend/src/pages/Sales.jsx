import { useEffect, useState } from 'react';
import api from '../api/axios';
import Topbar from '../components/Topbar';
import Loader from '../components/Loader';
import { formatCurrency, formatDate } from '../utils/format';
import './Sales.css';

export default function Sales() {
  const [medicines, setMedicines] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]); // [{ medicineId, name, unitPrice, available, quantity }]
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadAll = async () => {
    setLoading(true);
    const [medsRes, salesRes] = await Promise.all([api.get('/medicines'), api.get('/sales')]);
    setMedicines(medsRes.data.data);
    setSales(salesRes.data.data);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const addToCart = () => {
    setError('');
    const medicine = medicines.find((m) => m._id === selectedMedicine);
    if (!medicine) {
      setError('Choose a medicine to add.');
      return;
    }
    const qty = Number(quantity);
    if (!qty || qty < 1) {
      setError('Quantity must be at least 1.');
      return;
    }
    const alreadyInCart = cart.find((c) => c.medicineId === medicine._id);
    const totalRequested = qty + (alreadyInCart ? alreadyInCart.quantity : 0);
    if (totalRequested > medicine.quantityInStock) {
      setError(`Only ${medicine.quantityInStock} ${medicine.unit}(s) of ${medicine.name} available.`);
      return;
    }

    if (alreadyInCart) {
      setCart((c) =>
        c.map((item) =>
          item.medicineId === medicine._id ? { ...item, quantity: totalRequested } : item
        )
      );
    } else {
      setCart((c) => [
        ...c,
        {
          medicineId: medicine._id,
          name: medicine.name,
          unit: medicine.unit,
          unitPrice: medicine.sellingPrice,
          available: medicine.quantityInStock,
          quantity: qty,
        },
      ]);
    }
    setSelectedMedicine('');
    setQuantity(1);
  };

  const removeFromCart = (medicineId) => {
    setCart((c) => c.filter((item) => item.medicineId !== medicineId));
  };

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleCompleteSale = async () => {
    setError('');
    if (cart.length === 0) {
      setError('Add at least one item before completing the sale.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/sales', {
        items: cart.map((item) => ({ medicine: item.medicineId, quantity: item.quantity })),
        customerName: customerName || undefined,
        paymentMethod,
      });
      setCart([]);
      setCustomerName('');
      setPaymentMethod('cash');
      setSuccessMsg('Sale recorded and stock updated.');
      setTimeout(() => setSuccessMsg(''), 3500);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not complete this sale.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading sales…" />;

  return (
    <div>
      <Topbar title="Sales" subtitle="Record a sale and stock is reduced automatically." />

      <div className="sales-columns">
        <div className="card sales-builder">
          <h2>New sale</h2>

          {error && <p className="error-text">{error}</p>}
          {successMsg && <p className="sales-success">{successMsg}</p>}

          <div className="field-row sales-picker">
            <div className="field" style={{ flex: 2 }}>
              <label htmlFor="medicine">Medicine</label>
              <select id="medicine" value={selectedMedicine} onChange={(e) => setSelectedMedicine(e.target.value)}>
                <option value="">Select a medicine…</option>
                {medicines.map((m) => (
                  <option key={m._id} value={m._id} disabled={m.quantityInStock === 0}>
                    {m.name} — {m.quantityInStock} {m.unit}(s) left {m.quantityInStock === 0 ? '(out of stock)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="quantity">Qty</label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-outline" onClick={addToCart} style={{ marginBottom: '1.2em' }}>
            Add to sale
          </button>

          {cart.length > 0 && (
            <div className="table-scroll">
              <table className="sales-cart-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.medicineId}>
                      <td>{item.name}</td>
                      <td>
                        {item.quantity} {item.unit}(s)
                      </td>
                      <td>{formatCurrency(item.unitPrice * item.quantity)}</td>
                      <td>
                        <button className="sales-remove" onClick={() => removeFromCart(item.medicineId)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="sales-total">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="customerName">Customer (optional)</label>
              <input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in customer"
              />
            </div>
            <div className="field">
              <label htmlFor="paymentMethod">Payment method</label>
              <select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleCompleteSale}
            disabled={submitting || cart.length === 0}
          >
            {submitting ? 'Recording…' : `Complete sale — ${formatCurrency(total)}`}
          </button>
        </div>

        <div className="card sales-history">
          <h2>Sales history</h2>
          {sales.length === 0 ? (
            <p className="empty-state">No sales recorded yet.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Customer</th>
                    <th>Payment</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale._id}>
                      <td>{formatDate(sale.createdAt, true)}</td>
                      <td>{sale.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}</td>
                      <td>{sale.customerName}</td>
                      <td style={{ textTransform: 'capitalize' }}>{sale.paymentMethod}</td>
                      <td>{formatCurrency(sale.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
