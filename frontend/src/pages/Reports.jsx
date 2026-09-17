import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/axios';
import Topbar from '../components/Topbar';
import Loader from '../components/Loader';
import { formatCurrency } from '../utils/format';
import './Reports.css';

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export default function Reports() {
  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(today());
  const [salesReport, setSalesReport] = useState(null);
  const [stockReport, setStockReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [salesRes, stockRes] = await Promise.all([
      api.get('/reports/sales', { params: { from, to } }),
      api.get('/reports/stock'),
    ]);
    setSalesReport(salesRes.data.data);
    setStockReport(stockRes.data.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = (e) => {
    e.preventDefault();
    load();
  };

  const chartData = salesReport?.dailyTotals.map((d) => ({
    date: d.date.slice(5),
    revenue: d.totalRevenue,
  })) || [];

  return (
    <div>
      <Topbar title="Reports" subtitle="Sales trends, top sellers and current stock value." />

      <form className="reports-filter card" onSubmit={handleApply}>
        <div className="field">
          <label htmlFor="from">From</label>
          <input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="to">To</label>
          <input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit">
          Apply
        </button>
      </form>

      {loading ? (
        <Loader label="Building your report…" />
      ) : (
        <>
          <div className="card reports-chart-card">
            <h2>Revenue by day</h2>
            {chartData.length === 0 ? (
              <p className="empty-state">No sales in this date range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="reports-columns">
            <div className="card">
              <h2>Top sellers</h2>
              {salesReport.topSellers.length === 0 ? (
                <p className="empty-state">No sales in this date range.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Units sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesReport.topSellers.map((s) => (
                      <tr key={s._id}>
                        <td>{s.name}</td>
                        <td>{s.quantitySold}</td>
                        <td>{formatCurrency(s.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card">
              <h2>Stock value by category</h2>
              <p className="reports-total-stock">
                Total stock value: <strong>{formatCurrency(stockReport.totalStockValue)}</strong>
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Items</th>
                    <th>Units</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {stockReport.byCategory.map((c) => (
                    <tr key={c.category}>
                      <td>{c.category}</td>
                      <td>{c.itemCount}</td>
                      <td>{c.totalUnits}</td>
                      <td>{formatCurrency(c.stockValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
