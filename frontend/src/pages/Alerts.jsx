import { useEffect, useState } from 'react';
import api from '../api/axios';
import Topbar from '../components/Topbar';
import Loader from '../components/Loader';
import { formatCurrency, formatDate } from '../utils/format';
import './Alerts.css';

export default function Alerts() {
  const [lowStock, setLowStock] = useState([]);
  const [expiry, setExpiry] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [lowStockRes, expiryRes] = await Promise.all([
        api.get('/medicines/alerts/low-stock'),
        api.get('/medicines/alerts/expiring'),
      ]);
      setLowStock(lowStockRes.data.data);
      setExpiry(expiryRes.data.data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Loader label="Checking stock and expiry dates…" />;

  return (
    <div>
      <Topbar title="Alerts" subtitle="Everything that needs your attention right now." />

      <div className="alerts-section">
        <h2>Low stock ({lowStock.length})</h2>
        {lowStock.length === 0 ? (
          <div className="card empty-state">Every medicine is above its reorder level.</div>
        ) : (
          <div className="card alerts-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>In stock</th>
                  <th>Reorder level</th>
                  <th>Value at cost</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((m) => (
                  <tr key={m._id}>
                    <td>{m.name}</td>
                    <td>
                      <span className="badge badge-warning">
                        {m.quantityInStock} {m.unit}(s)
                      </span>
                    </td>
                    <td>{m.reorderLevel}</td>
                    <td>{formatCurrency(m.costPrice * m.quantityInStock)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="alerts-section">
        <h2>Expiring &amp; expired ({expiry.length})</h2>
        {expiry.length === 0 ? (
          <div className="card empty-state">Nothing is expired or expiring soon.</div>
        ) : (
          <div className="card alerts-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Expiry date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {expiry.map((m) => (
                  <tr key={m._id}>
                    <td>{m.name}</td>
                    <td className="mono">{m.batchNumber || '—'}</td>
                    <td>{formatDate(m.expiryDate)}</td>
                    <td>
                      <span className={`badge ${m.status === 'expired' ? 'badge-danger' : 'badge-warning'}`}>
                        {m.status === 'expired' ? 'Expired' : 'Expiring soon'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
