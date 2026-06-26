import { useState, useEffect } from 'react';
import { Download, Zap, Timer, BarChart4, CreditCard, RefreshCw, AlertCircle } from 'lucide-react';
import { aiMonitoringApi } from '../../services/aiMonitoringApi';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import html2pdf from 'html2pdf.js';

function StatCard({ title, value, subtitle, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[116px] animate-pulse">
        <div className="w-24 h-3 bg-gray-100 rounded mb-3" />
        <div className="w-16 h-6 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[116px] transition-all hover:shadow-md">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#66767b]">{title}</p>
        <h3 className="mt-3 text-[18px] font-medium leading-none text-[#151515] tabular-nums">{value}</h3>
      </div>
      {subtitle && (
        <div className="mt-4 text-[13px] font-medium text-[#66767b]">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export default function AdminAIMonitor() {
  const [timeFilter, setTimeFilter] = useState('24h');
  const [overview, setOverview] = useState(null);
  const [tokenUsage, setTokenUsage] = useState([]);
  const [featureUsage, setFeatureUsage] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, tokenUsageData, featureUsageData, systemStatusData, recentLogsData] = await Promise.all([
        aiMonitoringApi.getOverview(timeFilter),
        aiMonitoringApi.getTokenUsage(timeFilter),
        aiMonitoringApi.getFeatureUsage(timeFilter),
        aiMonitoringApi.getSystemStatus(),
        aiMonitoringApi.getRecentLogs(1, 10)
      ]);

      setOverview(overviewData);
      setTokenUsage(tokenUsageData);
      setFeatureUsage(featureUsageData);
      setSystemStatus(systemStatusData);
      setRecentLogs(recentLogsData.items || []);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi kết nối với máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeFilter]);

  const exportAiMonitoringReportToPdf = () => {
    if (!overview || !recentLogs) {
      alert("Chưa có dữ liệu để xuất báo cáo.");
      return;
    }

    setIsExporting(true);

    try {
      // Wrapper ẩn: overflow:hidden + left ra ngoài màn hình
      // Giúp html2canvas vẫn render được (khác với top:-9999px bị bỏ qua)
      const hiddenWrapper = document.createElement('div');
      hiddenWrapper.style.position = 'fixed';
      hiddenWrapper.style.top = '0';
      hiddenWrapper.style.left = '-2000px';
      hiddenWrapper.style.width = '1000px';
      hiddenWrapper.style.height = 'auto';
      hiddenWrapper.style.overflow = 'hidden';
      hiddenWrapper.style.zIndex = '-1';
      hiddenWrapper.style.pointerEvents = 'none';

      const printableContainer = document.createElement('div');
      printableContainer.id = 'temp-pdf-export-container';
      printableContainer.style.width = '1000px';
      printableContainer.style.background = '#ffffff';
      printableContainer.style.color = '#111827';
      printableContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      printableContainer.style.padding = '40px';
      printableContainer.style.boxSizing = 'border-box';

      const rangeText = timeFilter === '24h' ? '24 Giờ' : timeFilter === '7d' ? '7 Ngày' : '30 Ngày';
      const formattedDate = new Date().toLocaleDateString('vi-VN');
      const formattedTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      printableContainer.innerHTML = `
        <!-- Header -->
        <div style="border-bottom: 3px solid #1d4ed8; padding-bottom: 20px; margin-bottom: 25px;">
          <div style="font-size: 14px; font-weight: bold; color: #1d4ed8; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">
            Nền tảng Phỏng vấn IT Thông minh
          </div>
          <h1 style="font-size: 28px; font-weight: 900; color: #111827; margin: 0;">
            Báo cáo Giám sát hệ thống AI
          </h1>
        </div>

        <!-- Metadata -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
          <div>
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong style="color: #0f172a;">Khoảng thời gian thống kê:</strong> ${rangeText}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong style="color: #0f172a;">Người xuất báo cáo:</strong> Admin</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong style="color: #0f172a;">Ngày xuất báo cáo:</strong> ${formattedDate}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong style="color: #0f172a;">Giờ xuất báo cáo:</strong> ${formattedTime}</p>
          </div>
        </div>

        <!-- General Stats -->
        <h2 style="font-size: 18px; font-weight: 800; color: #1e3a8a; border-left: 4px solid #3b82f6; padding-left: 10px; margin-bottom: 15px;">Thống kê tổng quan</h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 12px; font-weight: bold; color: #64748b; margin-bottom: 5px; text-transform: uppercase;">Tổng AI Requests</div>
            <div style="font-size: 22px; font-weight: 900; color: #0f172a;">${overview?.totalRequests?.toLocaleString() ?? '0'}</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 12px; font-weight: bold; color: #64748b; margin-bottom: 5px; text-transform: uppercase;">Phản hồi trung bình</div>
            <div style="font-size: 22px; font-weight: 900; color: #0f172a;">${overview?.averageResponseTimeText ?? '0s'}</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 12px; font-weight: bold; color: #64748b; margin-bottom: 5px; text-transform: uppercase;">Token đã dùng</div>
            <div style="font-size: 22px; font-weight: 900; color: #0f172a;">${overview?.totalTokens?.toLocaleString() ?? '0'}</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 12px; font-weight: bold; color: #64748b; margin-bottom: 5px; text-transform: uppercase;">Chi phí ước tính</div>
            <div style="font-size: 22px; font-weight: 900; color: #16a34a;">$${overview?.estimatedCost?.toFixed(4) ?? '0.0000'}</div>
          </div>
        </div>

        <!-- System Status & Features -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #1e3a8a; border-left: 4px solid #3b82f6; padding-left: 10px; margin-bottom: 15px;">Tình trạng hệ thống</h2>
            <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; background: #ffffff;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="font-size: 14px; color: #475569;">API Gateway Status:</span>
                <span style="font-size: 14px; font-weight: bold; color: ${systemStatus?.apiGatewayStatus === 'Active' ? '#16a34a' : '#dc2626'};">${systemStatus?.apiGatewayStatus === 'Active' ? 'Hoạt động' : 'Ngoại tuyến'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="font-size: 14px; color: #475569;">AI Service Status:</span>
                <span style="font-size: 14px; font-weight: bold; color: ${systemStatus?.fastApiStatus === 'Active' ? '#16a34a' : '#dc2626'};">${systemStatus?.fastApiStatus === 'Active' ? 'Hoạt động' : 'Ngoại tuyến'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="font-size: 14px; color: #475569;">GPT Limit Used:</span>
                <span style="font-size: 14px; font-weight: bold; color: #0f172a;">${systemStatus?.gptLimitUsedPercent ?? 0}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="font-size: 14px; color: #475569;">Độ trễ trung bình:</span>
                <span style="font-size: 14px; font-weight: bold; color: #0f172a;">${systemStatus?.averageLatencyMs?.toLocaleString() ?? 0} ms</span>
              </div>
            </div>
          </div>

          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #1e3a8a; border-left: 4px solid #3b82f6; padding-left: 10px; margin-bottom: 15px;">Top tính năng dùng AI</h2>
            <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; background: #ffffff;">
              ${featureUsage.length === 0 ? '<p style="font-size: 14px; color: #94a3b8; text-align: center;">Không có dữ liệu</p>' :
          featureUsage.slice(0, 4).map(feat => `
                  <div style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; color: #475569; margin-bottom: 4px;">
                      <span>${feat.featureDisplayName}</span>
                      <span>${feat.requestCount} requests (${feat.percentage}%)</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden;">
                      <div style="width: ${feat.percentage}%; height: 100%; background: #3b82f6; border-radius: 3px;"></div>
                    </div>
                  </div>
                `).join('')
        }
            </div>
          </div>
        </div>

        <!-- Recent Logs -->
        <h2 style="font-size: 18px; font-weight: 800; color: #1e3a8a; border-left: 4px solid #3b82f6; padding-left: 10px; margin-bottom: 15px;">Nhật ký request gần đây</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px;">
          <thead>
            <tr style="background: #1e3a8a; color: #ffffff; text-align: left;">
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Người dùng</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Tính năng</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Trạng thái</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Token</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Phản hồi</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            ${recentLogs.length === 0 ? '<tr><td colspan="6" style="padding: 20px; text-align: center; color: #94a3b8;">Không có logs nào</td></tr>' :
          recentLogs.slice(0, 10).map(log => {
            let safeStatus = log.statusText;
            if (log.status !== 'Success') {
              safeStatus = log.status === 'Timeout' ? 'Timeout' : 'Lỗi API';
            }
            return `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${log.userName || 'Hệ thống'}</td>
                    <td style="padding: 8px 10px; border: 1px solid #e2e8f0; color: #334155;">${log.featureDisplayName}</td>
                    <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">
                      <span style="padding: 2px 6px; font-size: 11px; font-weight: bold; border-radius: 4px; ${log.status === 'Success' ? 'background: #dcfce7; color: #15803d;' : 'background: #fee2e2; color: #b91c1c;'
              }">
                        ${safeStatus}
                      </span>
                    </td>
                    <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: bold;">${log.totalTokens?.toLocaleString() ?? 0}</td>
                    <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #334155;">${log.responseTimeText}</td>
                    <td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: right; color: #64748b;">${log.createdAtText}</td>
                  </tr>
                `;
          }).join('')
        }
          </tbody>
        </table>

        <!-- Footer -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 12px; color: #94a3b8; font-weight: bold;">
          Generated by InterviewPro Admin • Nền tảng Phỏng vấn IT Thông minh
        </div>
      `;

      hiddenWrapper.appendChild(printableContainer);
      document.body.appendChild(hiddenWrapper);

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `ai-monitoring-report-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 1000,
          width: 1000
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf()
        .set(opt)
        .from(printableContainer)
        .save()
        .then(() => {
          document.body.removeChild(hiddenWrapper);
          setIsExporting(false);
          alert("Xuất báo cáo PDF thành công.");
        })
        .catch((err) => {
          console.error(err);
          if (document.body.contains(hiddenWrapper)) {
            document.body.removeChild(hiddenWrapper);
          }
          setIsExporting(false);
          alert("Không thể xuất báo cáo PDF. Vui lòng thử lại.");
        });
    } catch (e) {
      console.error(e);
      setIsExporting(false);
      alert("Không thể xuất báo cáo PDF. Vui lòng thử lại.");
    }
  };

  const handleExportReport = () => {
    exportAiMonitoringReportToPdf();
  };

  return (
    <div id="ai-monitor-dashboard" className="animate-fade-in max-w-[1180px] mx-auto pb-10 px-4 md:px-0">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#333333]">Giám sát hệ thống AI</h1>
          <p className="mt-2 text-[15px] font-semibold text-[#96939a]">Theo dõi hiệu năng và chi phí vận hành mô hình ngôn ngữ lớn (LLM) trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex bg-white border border-[#dfe4e7] rounded-xl p-1 shadow-sm mr-2">
            <button
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${timeFilter === '24h' ? 'bg-[#333333] text-white' : 'text-[#151515] hover:bg-[#f8f8f8]'}`}
              onClick={() => setTimeFilter('24h')}
            >
              24 Giờ
            </button>
            <button
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${timeFilter === '7d' ? 'bg-[#333333] text-white' : 'text-[#151515] hover:bg-[#f8f8f8]'}`}
              onClick={() => setTimeFilter('7d')}
            >
              7 Ngày
            </button>
            <button
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${timeFilter === '30d' ? 'bg-[#333333] text-white' : 'text-[#151515] hover:bg-[#f8f8f8]'}`}
              onClick={() => setTimeFilter('30d')}
            >
              30 Ngày
            </button>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#dfe4e7] text-[#151515] text-xs font-semibold rounded-lg hover:bg-[#f8f8f8] transition-all shadow-sm disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#333333] hover:bg-black text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Đang xuất...' : 'Xuất báo cáo'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Có lỗi xảy ra</h4>
            <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng AI Requests"
          value={overview?.totalRequests?.toLocaleString() ?? '0'}
          icon={Zap}
          subtitle={`Tỉ lệ lỗi: ${overview?.errorRate ?? 0}%`}
          loading={loading}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Thời gian phản hồi TB"
          value={overview?.averageResponseTimeText ?? '0s'}
          icon={Timer}
          subtitle="Stopwatch ms"
          loading={loading}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Token đã dùng"
          value={overview?.totalTokens?.toLocaleString() ?? '0'}
          icon={BarChart4}
          subtitle={`Tỉ lệ t.công: ${overview?.successRate ?? 0}%`}
          loading={loading}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Chi phí ước tính"
          value={`$${overview?.estimatedCost?.toFixed(4) ?? '0.00'}`}
          icon={CreditCard}
          subtitle="Ước tính (USD)"
          loading={loading}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50"
        />
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              Lưu lượng Token ({timeFilter === '24h' ? 'theo giờ' : 'theo ngày'})
            </h3>
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>Input</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-300"></div>Output</div>
            </div>
          </div>

          <div className="flex-1 w-full flex items-center justify-center">
            {loading ? (
              <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gray-50/50 rounded-xl animate-pulse">
                <span className="text-sm font-bold text-gray-400">Đang tải biểu đồ...</span>
              </div>
            ) : tokenUsage.length === 0 ? (
              <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <BarChart4 className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-500">Chưa có dữ liệu AI request trong khoảng thời gian này.</p>
              </div>
            ) : (
              <div className="w-full h-full min-h-[300px] mt-2">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={tokenUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#93c5fd" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" dataKey="inputTokens" name="Input Tokens" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorInput)" />
                    <Area type="monotone" dataKey="outputTokens" name="Output Tokens" stroke="#93c5fd" strokeWidth={2} fillOpacity={1} fill="url(#colorOutput)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status & Top Features */}
        <div className="flex flex-col gap-6">
          {/* Status Box */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-sm shadow-blue-200">
            <h3 className="text-lg font-bold mb-6">Tình trạng hệ thống</h3>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="w-full h-8 bg-blue-500/50 rounded-lg" />
                <div className="w-full h-8 bg-blue-500/50 rounded-lg" />
                <div className="w-full h-8 bg-blue-500/50 rounded-lg" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-blue-500/50 pb-4">
                    <span className="text-blue-100 text-sm font-semibold">API Gateway</span>
                    <span className="px-2.5 py-1 bg-green-500 text-white text-[10px] font-bold rounded-md tracking-wider">HOẠT ĐỘNG</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-blue-500/50 pb-4">
                    <span className="text-blue-100 text-sm font-semibold">FastAPI AI Service</span>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md tracking-wider ${systemStatus?.aiServiceStatus === 'Hoạt động' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {systemStatus?.aiServiceStatus === 'Hoạt động' ? 'HOẠT ĐỘNG' : 'NGOẠI TUYẾN'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-blue-500/50 pb-4">
                    <span className="text-blue-100 text-sm font-semibold">GPT-4 Limit</span>
                    <span className="text-white text-sm font-bold tracking-wide">{systemStatus?.gptLimitUsedPercent ?? 0}% Used</span>
                  </div>
                  <div className="flex justify-between items-center pb-4">
                    <span className="text-blue-100 text-sm font-semibold">AI Latency (Avg)</span>
                    <span className="text-white text-sm font-bold tracking-wide">{systemStatus?.systemLatencyMs ?? 0}ms</span>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="w-full h-2 bg-blue-500 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-white rounded-full shadow-sm" style={{ width: `${systemStatus?.gptLimitUsedPercent ?? 0}%` }}></div>
                  </div>
                  <p className="text-[11px] text-blue-100 italic text-center font-medium">
                    {systemStatus?.message || 'Hệ thống đang hoạt động trong ngưỡng an toàn.'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Top Features */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Top tính năng dùng AI</h3>

            <div className="space-y-5">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="w-full h-10 bg-gray-100 rounded-lg" />
                  <div className="w-full h-10 bg-gray-100 rounded-lg" />
                  <div className="w-full h-10 bg-gray-100 rounded-lg" />
                </div>
              ) : featureUsage.length === 0 ? (
                <p className="text-sm font-semibold text-gray-500 text-center py-6">Chưa có thông tin sử dụng tính năng.</p>
              ) : (
                featureUsage.map((item, idx) => {
                  const colors = ['bg-blue-600', 'bg-blue-500', 'bg-blue-800', 'bg-indigo-500', 'bg-teal-500'];
                  const barColor = colors[idx % colors.length];
                  return (
                    <div key={idx}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-900 shrink-0">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-bold text-gray-900 flex-1 truncate">{item.displayName}</span>
                        <span className="text-sm font-black text-gray-950">{item.percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold ml-9 mt-0.5">{item.requestCount?.toLocaleString()} requests</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Nhật ký request gần đây</h3>
          <button
            onClick={fetchData}
            className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Làm mới
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#eeeeee] bg-white">
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Người Dùng</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Tính Năng</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Trạng Thái</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Tổng Token</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Phản Hồi</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] text-right">Thời Gian</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-[#eeeeee]">
                    <td className="px-5 py-5"><div className="w-24 h-4 bg-gray-100 rounded" /></td>
                    <td className="px-5 py-5"><div className="w-32 h-4 bg-gray-100 rounded" /></td>
                    <td className="px-5 py-5"><div className="w-16 h-4 bg-gray-100 rounded" /></td>
                    <td className="px-5 py-5"><div className="w-12 h-4 bg-gray-100 rounded" /></td>
                    <td className="px-5 py-5"><div className="w-12 h-4 bg-gray-100 rounded" /></td>
                    <td className="px-5 py-5"><div className="w-16 h-4 bg-gray-100 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : recentLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-sm font-semibold text-[#8d8a91]">
                    Chưa có hoạt động AI request nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                recentLogs.map((log, idx) => (
                  <tr key={idx} className="group cursor-pointer border-b border-[#eeeeee] transition-colors last:border-b-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-5 text-[14px] font-extrabold text-[#333333]">{log.userName}</td>
                    <td className="px-5 py-5 text-[14px] font-semibold leading-tight text-[#333333]">{log.featureDisplayName}</td>
                    <td className="px-5 py-5">
                      <span className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-extrabold uppercase ${log.status === 'Success'
                        ? 'bg-[#c9f0d2] text-[#4b7a55]'
                        : log.status === 'Timeout'
                          ? 'bg-[#fff4e5] text-[#b37400]'
                          : 'bg-[#ffebe6] text-[#cc3300]'
                        }`}>
                        {log.statusText}
                      </span>
                    </td>
                    <td className="px-5 py-5 font-mono text-[14px] font-extrabold text-[#333333] tabular-nums">{log.totalTokens?.toLocaleString()}</td>
                    <td className="px-5 py-5 font-mono text-[14px] font-extrabold text-[#333333] tabular-nums">{log.responseTimeText}</td>
                    <td className="px-5 py-5 text-[14px] font-semibold text-[#8d8a91] text-right">{log.createdAtText}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
