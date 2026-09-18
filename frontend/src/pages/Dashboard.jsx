import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import AlertBanner from '../components/AlertBanner';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/format';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [summaryRes, lowStockRes, expiringRes, salesRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/medicines/alerts/low-stock'),
        api.get('/medicines/alerts/expiring'),
        api.get('/sales'),
      ]);
      if (!active) return;
      setSummary(summaryRes.data.data);
      setLowStock(lowStockRes.data.data.slice(0, 5));
      setExpiring(expiringRes.data.data.slice(0, 5));
      setRecentSales(salesRes.data.data.slice(0, 6));
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loader label="Loading dashboard…" />;

  return (
    <div>
      <Topbar
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle="Here's how the pharmacy looks today."
      />

      <div className="stat-grid">
        <StatCard label="Medicines tracked" value={summary.totalMedicines} tone="primary" />
        <StatCard
          label="Low stock items"
          value={summary.lowStockCount}
          tone={summary.lowStockCount > 0 ? 'warning' : 'success'}
        />
        <StatCard
          label="Expiring soon"
          value={summary.expiringSoonCount}
          tone={summary.expiringSoonCount > 0 ? 'warning' : 'success'}
          hint={summary.expiredCount > 0 ? `${summary.expiredCount} already expired` : undefined}
        />
        <StatCard label="Today's revenue" value={formatCurrency(summary.todayRevenue)} tone="success" hint={`${summary.todaySalesCount} sale(s) today`} />
      </div>

      <div className="dashboard-columns">
        <div className="card dashboard-recent-sales">
          <div className="dashboard-section-header">
            <h2>Recent sales</h2>
            <Link to="/sales">View all</Link>
          </div>
          {recentSales.length === 0 ? (
            <p className="empty-state">No sales recorded yet. Head to the Sales page to log one.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Customer</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale._id}>
                      <td>{formatDate(sale.createdAt, true)}</td>
                      <td>{sale.items.length} item(s)</td>
                      <td>{sale.customerName}</td>
                      <td>{formatCurrency(sale.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-alerts">
          <AlertBanner
            title="Low stock"
            tone="warning"
            items={lowStock}
            emptyText="Nothing running low right now."
            renderItem={(m) => (
              <>
                <span>{m.name}</span>
                <span className="badge badge-warning">{m.quantityInStock} left</span>
              </>
            )}
          />
          <AlertBanner
            title="Expiring soon"
            tone="danger"
            items={expiring}
            emptyText="No medicines expiring soon."
            renderItem={(m) => (
              <>
                <span>{m.name}</span>
                <span className={`badge ${m.status === 'expired' ? 'badge-danger' : 'badge-warning'}`}>
                  {m.status === 'expired' ? 'Expired' : formatDate(m.expiryDate)}
                </span>
              </>
            )}
          />
          {(lowStock.length > 0 || expiring.length > 0) && (
            <Link to="/alerts" className="btn btn-outline dashboard-alerts-link">
              See all alerts
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
