import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, Zap, Crown, ShieldCheck, Infinity, Sparkles } from 'lucide-react';
import { paymentApi } from '../../services/paymentApi';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const INITIAL_PLANS = [
  {
    id: 'Monthly',
    label: 'Gói tháng',
    price: '99.000đ',
    duration: '30 ngày',
    badge: null,
  },
  {
    id: 'Yearly',
    label: 'Gói năm',
    price: '1.000.000đ',
    duration: '365 ngày',
    badge: 'Tiết kiệm 188.000đ',
  },
];

// FEATURES array moved inside component to be dynamic
export default function UpgradePage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [selectedPlan, setSelectedPlan] = useState('Yearly');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pollingStatus, setPollingStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);

  // Tab state cho UI (Miễn phí / Premium)
  const [activeTab, setActiveTab] = useState('Premium');

  const currentFeatures = [
    {
      icon: <Infinity className="w-5 h-5 text-slate-700" />,
      title: activeTab === 'Miễn phí' ? '3 lượt luyện tập mỗi ngày' : 'Luyện tập không giới hạn',
      description: activeTab === 'Miễn phí' 
        ? 'Mỗi ngày được dùng 3 lượt thi mock interview.' 
        : 'Không giới hạn số lượt thi mock interview và truy cập ngân hàng câu hỏi VIP.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-slate-700" />,
      title: 'AI phân tích chuyên sâu',
      description: 'Đánh giá giọng nói, thái độ và nội dung trả lời chi tiết sau mỗi buổi phỏng vấn.'
    },
    {
      icon: <Sparkles className="w-5 h-5 text-slate-700" />,
      title: 'Báo cáo độc quyền',
      description: 'Nhận báo cáo tổng quan và lộ trình phát triển kỹ năng cá nhân hóa.'
    }
  ];

  useEffect(() => {
    if (order && (pollingStatus === 'polling' || pollingStatus === 'partiallyPaid')) {
      if (timeLeft <= 0) return;
      const timerId = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [order, pollingStatus, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data } = await paymentApi.getPackages();
        if (data && Array.isArray(data)) {
          setPlans(prevPlans => prevPlans.map(plan => {
            const serverPkg = data.find(p => p.id === plan.id);
            if (serverPkg) {
              return { ...plan, price: serverPkg.price.toLocaleString('vi-VN') + 'đ' };
            }
            return plan;
          }));
        }
      } catch (err) {
        console.error("Lỗi tải gói cước", err);
      }
    };
    fetchPackages();
  }, []);

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const { data } = await paymentApi.createOrder(selectedPlan);
      setOrder(data);
      setTimeLeft(120);
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
    const maxAttempts = 24;

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
        } else if (data.status === 'PartiallyPaid') {
          const remainingAmount = data.amount - (data.actualAmount || 0);
          const bankName = order.bankName;
          const bankAccount = order.bankAccount;
          const accountNameEncoded = encodeURIComponent(order.accountName);
          const newQrUrl = `https://img.vietqr.io/image/${bankName}-${bankAccount}-compact2.png?amount=${remainingAmount}&addInfo=${order.orderCode}&accountName=${accountNameEncoded}`;
          
          setOrder(prev => ({
            ...prev,
            actualAmount: data.actualAmount,
            remainingAmount: remainingAmount,
            qrUrl: newQrUrl
          }));
          setPollingStatus('partiallyPaid');
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPollingStatus('failed');
        }
      } catch {
      }
    }, 5000);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (pollingStatus === 'failed') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <span className="text-2xl">⏳</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Hết thời gian</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">Bạn đã không hoàn tất thanh toán trong thời gian quy định. Đơn hàng đã bị huỷ.</p>
          <button
            onClick={() => { setOrder(null); setPollingStatus(null); setTimeLeft(120); }}
            className="w-full py-3.5 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-slate-800 transition-colors"
          >
            Thử lại
          </button>
        </motion.div>
      </div>
    );
  }

  if (pollingStatus === 'completed') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Thanh toán thành công!</h2>
          <p className="text-slate-500 text-sm leading-relaxed">Tuyệt vời! Tài khoản của bạn đã được nâng cấp. Sẵn sàng bứt phá sự nghiệp ngay thôi.</p>
        </motion.div>
      </div>
    );
  }

  if (pollingStatus === 'wrongAmount') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-red-500 mb-3 tracking-tight">Lỗi số tiền</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Số tiền chuyển không khớp. Vui lòng liên hệ hỗ trợ kèm mã đơn hàng:
          </p>
          <div className="bg-slate-50 rounded-xl px-4 py-4 font-mono font-bold text-slate-800 text-lg mb-6 border border-slate-100">
            {order?.orderCode}
          </div>
          <button className="w-full py-3.5 bg-slate-900 text-white font-semibold text-sm rounded-xl">
            Liên hệ hỗ trợ
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-white font-sans selection:bg-slate-200">
      <div className="px-6 pt-12">
        {/* Header Tabs (Full width left aligned) */}
        {!order && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 w-full">
          <div className="flex gap-8 border-b border-slate-200 pb-2">
            {['Miễn phí', 'Premium'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={twMerge(
                  "text-lg relative font-medium transition-colors pb-2",
                  activeTab === tab ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-slate-900 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
          {!order ? (
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col md:flex-row gap-12 w-full max-w-5xl"
            >
              {/* Features List (Revolut Style) */}
              <div className="flex-1 bg-[#F8F9FA] rounded-[32px] p-8 border border-slate-100/50 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Top features</h3>
                <div className="space-y-6">
                  {currentFeatures.map((feature, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{feature.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan Selection */}
              <div className="flex-1 space-y-3 pt-2">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={twMerge(
                      "w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group",
                      selectedPlan === plan.id
                        ? "border-slate-900 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={twMerge("font-bold", selectedPlan === plan.id ? "text-slate-900" : "text-slate-700")}>
                            {plan.label}
                          </span>
                          {plan.badge && (
                            <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-full tracking-wide">
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{plan.duration}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-900">{plan.price}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Sticky CTA */}
              <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-50 pointer-events-none">
                <button
                  onClick={handleCreateOrder}
                  disabled={loading}
                  className="pointer-events-auto w-full max-w-sm py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[15px] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Nâng cấp ngay
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            /* Checkout State */
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-md"
            >
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                
                {pollingStatus === 'partiallyPaid' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-red-50/80 border border-red-100 rounded-2xl">
                    <p className="text-sm font-semibold text-red-600 mb-1">Thanh toán thiếu {(order.actualAmount || 0).toLocaleString('vi-VN')}đ</p>
                    <p className="text-xs text-red-500/80 leading-relaxed">Vui lòng thanh toán thêm phần còn lại ({(order.remainingAmount || 0).toLocaleString('vi-VN')}đ). Chỉ hỗ trợ nạp bù 1 lần.</p>
                  </motion.div>
                )}

                <div className="text-center mb-8">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Mã đơn hàng</p>
                  <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{order.orderCode}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-3xl mb-8 border border-slate-100">
                  <div className="bg-white p-2 rounded-2xl shadow-sm mb-4">
                    <img src={order.qrUrl} alt="QR Code" className="w-full aspect-square object-cover rounded-xl" />
                  </div>
                  <p className="text-center text-xs font-medium text-slate-500">Mở ứng dụng ngân hàng và quét mã</p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    { label: 'Ngân hàng', value: order.bankName },
                    { label: 'Số tài khoản', value: order.bankAccount },
                    { label: 'Chủ tài khoản', value: order.accountName },
                    { label: 'Số tiền', value: `${(pollingStatus === 'partiallyPaid' ? order.remainingAmount : order.amount).toLocaleString('vi-VN')}đ` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <span className="text-sm text-slate-500">{label}</span>
                      <span className="text-sm font-semibold text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-900 rounded-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-50" />
                  <div className="relative z-10">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Nội dung chuyển khoản (Bắt buộc)</p>
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-mono font-bold text-white text-lg truncate">{order.transferContent}</span>
                      <button
                        onClick={() => handleCopy(order.transferContent)}
                        className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {(pollingStatus === 'polling' || pollingStatus === 'partiallyPaid') && (
                  <div className="mt-8 flex flex-col items-center">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                      <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                      <span className="text-sm font-medium">Đang chờ xác nhận...</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900 font-mono tracking-tight">{formatTime(timeLeft)}</span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setOrder(null)}
                className="mt-6 w-full text-center text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                Hủy thanh toán
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
