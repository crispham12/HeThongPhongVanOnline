import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, Zap, Crown } from 'lucide-react';
import { paymentApi } from '../../services/paymentApi';

const PLANS = [
  {
    id: 'Monthly',
    label: 'Gói tháng',
    price: '10.000đ',
    duration: '30 ngày',
    badge: null,
    highlight: false,
  },
  {
    id: 'Yearly',
    label: 'Gói năm',
    price: '1.000.000đ',
    duration: '365 ngày',
    badge: 'Tiết kiệm 188.000đ',
    highlight: true,
  },
];

export default function UpgradePage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('Yearly');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pollingStatus, setPollingStatus] = useState(null); // null | 'polling' | 'completed' | 'wrongAmount'

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const { data } = await paymentApi.createOrder(selectedPlan);
      setOrder(data);
      startPolling(data.orderCode);
    } catch {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (orderCode) => {
    setPollingStatus('polling');
    let attempts = 0;
    const maxAttempts = 120; // 10 phút × 5s

    const interval = setInterval(async () => {
      attempts++;
      try {
        const { data } = await paymentApi.getStatus(orderCode);
        if (data.status === 'Completed') {
          clearInterval(interval);
          setPollingStatus('completed');
          setTimeout(() => navigate('/dashboard'), 3000);
        } else if (data.status === 'WrongAmount') {
          clearInterval(interval);
          setPollingStatus('wrongAmount');
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPollingStatus(null);
        }
      } catch {
        clearInterval(interval);
      }
    }, 5000);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trạng thái: Thanh toán thành công
  if (pollingStatus === 'completed') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Thanh toán thành công!</h2>
          <p className="text-slate-500 text-sm">Tài khoản của bạn đã được nâng cấp Premium. Đang chuyển về Dashboard...</p>
        </div>
      </div>
    );
  }

  // Trạng thái: Sai số tiền
  if (pollingStatus === 'wrongAmount') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <h2 className="text-lg font-black text-red-600 mb-2">Thanh toán không thành công</h2>
          <p className="text-slate-500 text-sm mb-4">
            Số tiền chuyển không khớp với gói đã chọn. Vui lòng liên hệ hỗ trợ kèm mã đơn hàng:
          </p>
          <div className="bg-slate-50 rounded-xl px-4 py-3 font-mono font-bold text-slate-800 text-lg mb-4">
            {order?.orderCode}
          </div>
          <a
            href="https://m.me/YOUR_PAGE"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl"
          >
            Liên hệ hỗ trợ qua Messenger
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Crown className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">Nâng cấp Premium</h1>
          <p className="text-slate-400 text-sm">Luyện tập không giới hạn, không bị gián đoạn</p>
        </div>

        {!order ? (
          <>
            {/* Chọn gói */}
            <div className="space-y-3 mb-8">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                    selectedPlan === plan.id
                      ? 'border-slate-900 bg-slate-50 shadow-md'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-slate-800 text-sm">{plan.label}</span>
                        {plan.badge && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{plan.duration}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">{plan.price}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Features */}
            <div className="bg-slate-50 rounded-2xl p-5 mb-8">
              {['Luyện tập không giới hạn số buổi', 'Đầy đủ tính năng Full Mock + Ngân hàng câu hỏi', 'AI phân tích giọng nói và nội dung', 'Báo cáo chi tiết sau mỗi buổi'].map((f) => (
                <div key={f} className="flex items-center gap-2 mb-2 last:mb-0">
                  <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span className="text-xs text-slate-600">{f}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handleCreateOrder}
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Zap className="w-4 h-4" />}
              {loading ? 'Đang tạo đơn...' : 'Tiếp tục thanh toán'}
            </button>
          </>
        ) : (
          /* Hướng dẫn chuyển khoản */
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-2xl p-5 text-center">
              <p className="text-xs text-slate-400 mb-1">Mã đơn hàng</p>
              <p className="text-2xl font-black text-slate-900 font-mono mb-3">{order.orderCode}</p>
              <img src={order.qrUrl} alt="QR chuyển khoản" className="w-48 h-48 mx-auto rounded-xl mb-3" />
              <p className="text-xs text-slate-400">Quét mã hoặc chuyển khoản thủ công</p>
            </div>

            {/* Thông tin TK */}
            {[
              { label: 'Ngân hàng', value: order.bankName },
              { label: 'Số tài khoản', value: order.bankAccount },
              { label: 'Chủ tài khoản', value: order.accountName },
              { label: 'Số tiền', value: `${order.amount.toLocaleString('vi-VN')}đ` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl">
                <span className="text-xs text-slate-400">{label}</span>
                <span className="text-sm font-bold text-slate-800">{value}</span>
              </div>
            ))}

            {/* Nội dung CK — quan trọng nhất */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-bold text-amber-700 mb-2">⚠️ Nội dung chuyển khoản (BẮT BUỘC)</p>
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-slate-900 text-lg">{order.transferContent}</span>
                <button
                  onClick={() => handleCopy(order.transferContent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-800 font-bold text-xs rounded-lg transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Đã copy' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Trạng thái chờ */}
            {pollingStatus === 'polling' && (
              <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                <span className="text-xs">Đang chờ xác nhận thanh toán...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
