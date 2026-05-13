import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Zap, GitBranch, Code2, BarChart3, ChevronRight, Globe, Shield, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">InterviewPro AI</span>
          </div>
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <button onClick={() => navigate('/setup')} className="btn-primary py-2 px-6">Vào ứng dụng</button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-primary-600">Đăng nhập</Link>
                <Link to="/register" className="btn-primary py-2 px-6 shadow-md shadow-primary-200">Dùng thử miễn phí</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-8"
          >
            <Zap className="w-3.5 h-3.5 fill-current" /> Nền tảng phỏng vấn AI thế hệ mới
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 leading-[1.1]"
          >
            Nâng tầm kỹ năng <br /> 
            <span className="text-primary-600">Phỏng vấn Kỹ thuật</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Luyện tập phỏng vấn với AI thông minh. Nhận đánh giá chi tiết về mã nguồn, 
            tư duy kiến trúc và kỹ năng mềm để chinh phục các tập đoàn công nghệ lớn.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => navigate(isAuthenticated ? '/setup' : '/register')} 
              className="btn-primary px-10 py-4 text-lg shadow-xl shadow-primary-100 flex items-center gap-2"
            >
              Bắt đầu ngay bây giờ <ChevronRight className="w-5 h-5" />
            </button>
            <button className="px-10 py-4 text-lg font-bold text-gray-700 hover:text-primary-600 transition-colors">
              Xem bản Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-black text-gray-900">50,000+</p>
              <p className="text-sm text-gray-500 font-medium">Buổi phỏng vấn đã thực hiện</p>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">98%</p>
              <p className="text-sm text-gray-500 font-medium">Tỉ lệ hài lòng của ứng viên</p>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">200+</p>
              <p className="text-sm text-gray-500 font-medium">Kịch bản phỏng vấn chuyên sâu</p>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">10x</p>
              <p className="text-sm text-gray-500 font-medium">Tăng tốc độ nhận lời mời làm việc</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Mọi thứ bạn cần để thành công</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Kết hợp giữa trí tuệ nhân tạo và kinh nghiệm phỏng vấn thực tế từ các chuyên gia hàng đầu.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Code2,
              title: 'Phân tích mã nguồn chuyên sâu',
              desc: 'AI phân tích logic, độ phức tạp và phong cách lập trình của bạn trong thời gian thực.',
              color: 'bg-blue-500'
            },
            {
              icon: GitBranch,
              title: 'Đánh giá GitHub Repo',
              desc: 'Kết nối kho mã nguồn của bạn để AI đánh giá kiến trúc hệ thống và khả năng Clean Code.',
              color: 'bg-purple-500'
            },
            {
              icon: Globe,
              title: 'Đa dạng vị trí & Cấp độ',
              desc: 'Từ Frontend, Backend đến AI Engineer. Phù hợp cho cả Intern và Senior Developer.',
              color: 'bg-green-500'
            },
            {
              icon: Shield,
              title: 'Bảo mật dữ liệu tuyệt đối',
              desc: 'Toàn bộ nội dung phỏng vấn được mã hóa và bảo mật theo tiêu chuẩn doanh nghiệp.',
              color: 'bg-red-500'
            },
            {
              icon: BarChart3,
              title: 'Lộ trình phát triển riêng',
              desc: 'Sau mỗi buổi phỏng vấn, AI sẽ đề xuất tài liệu học tập để bù đắp các lỗ hổng kiến thức.',
              color: 'bg-orange-500'
            },
            {
              icon: Star,
              title: 'Mô phỏng áp lực thực tế',
              desc: 'Trải nghiệm áp lực thời gian và các câu hỏi hóc búa như khi phỏng vấn tại FAANG.',
              color: 'bg-yellow-500'
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl border border-gray-100 hover:border-primary-100 hover:shadow-xl hover:shadow-primary-50/50 transition-all group">
              <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-${feature.color.split('-')[1]}-200 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto rounded-[2rem] bg-gray-900 p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_-20%,#2563eb,transparent)] opacity-40"></div>
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Sẵn sàng để bắt đầu hành trình sự nghiệp?</h2>
            <p className="text-gray-400 mb-10 max-w-xl mx-auto">Tham gia cùng hàng nghìn lập trình viên khác đang sử dụng InterviewPro AI mỗi ngày.</p>
            <button onClick={() => navigate(isAuthenticated ? '/setup' : '/register')} className="btn-primary border-none bg-white text-gray-900 hover:bg-gray-100 px-10 py-4 text-lg">
              Đăng ký ngay - Hoàn toàn miễn phí
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary-600" />
            <span className="font-bold text-gray-900">InterviewPro AI</span>
          </div>
          <div className="text-sm text-gray-500">
            © 2024 InterviewPro AI. Tất cả quyền được bảo lưu.
          </div>
          <div className="flex gap-6 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-primary-600">Điều khoản</a>
            <a href="#" className="hover:text-primary-600">Bảo mật</a>
            <a href="#" className="hover:text-primary-600">Liên hệ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
