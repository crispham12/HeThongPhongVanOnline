import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md py-4 px-8 md:px-16 flex items-center justify-between border-b border-gray-100/80 transition-all">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link to="/" className="text-2xl font-black tracking-tight" style={{ color: '#163300' }}>
            Logo
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="font-bold text-sm hover:opacity-80 transition-opacity" style={{ color: '#090A08' }}>
              Tính năng
            </a>
            <a href="#pricing" className="font-bold text-sm hover:opacity-80 transition-opacity" style={{ color: '#090A08' }}>
              Bảng giá
            </a>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/setup')}
              className="px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-sm"
              style={{ backgroundColor: '#9BE870', color: '#163300' }}
            >
              Vào ứng dụng
            </button>
          ) : (
            <>
              <Link to="/login" className="font-bold text-sm hover:opacity-80 transition-opacity" style={{ color: '#090A08' }}>
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-sm"
                style={{ backgroundColor: '#9BE870', color: '#163300' }}
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section Container */}
      <main className="w-full bg-white flex flex-col items-center px-6 pt-16 pb-24">
        {/* Trust Badges */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mb-8 text-xs md:text-sm font-bold">
          <div className="flex items-center gap-2" style={{ color: '#163300' }}>
            <span>5 ★</span>
            <span>Được mọi người tin dùng hằng ngày</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: '#163300' }}>
            <span>5 ★</span>
            <span>Giúp giải quyết các vấn đề về học tập</span>
          </div>
        </div>

        {/* Hero Title */}
        <h1
          className="text-4xl md:text-6xl font-black text-center max-w-4xl leading-tight mb-6 tracking-tight"
          style={{ color: '#090A08' }}
        >
          Luyện phỏng vấn IT cùng AI <br /> tự tin xin việc ngay tại nhà
        </h1>

        {/* Subtitle / Description */}
        <div
          className="text-center text-base md:text-lg max-w-2xl leading-relaxed mb-8 flex flex-col gap-1"
          style={{ color: '#595959' }}
        >
          <p>Dành cho sinh viên năm cuối và fresher</p>
          <p>Thực hành đủ 3 vòng: HR, kỹ thuật và coding</p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <button
            onClick={() => navigate(isAuthenticated ? '/setup' : '/register')}
            className="px-10 py-4 rounded-full font-bold text-base md:text-lg hover:opacity-90 transition-all shadow-md"
            style={{ backgroundColor: '#9BE870', color: '#163300' }}
          >
            Dùng thử ngay
          </button>
          <button
            onClick={() => {
              const featuresSection = document.getElementById('features');
              if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-10 py-4 rounded-full font-bold text-base md:text-lg bg-white hover:bg-gray-50 transition-all border border-gray-200 shadow-md"
            style={{ color: '#163300' }}
          >
            Xem demo
          </button>
        </div>

        {/* Demo Video Block */}
        <div
          className="w-full max-w-4xl aspect-[16/9] rounded-2xl flex items-center justify-center shadow-lg border border-gray-200 overflow-hidden relative"
          style={{ backgroundColor: '#D9D9D9' }}
        >
          <span className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: '#090A08' }}>
            demo video
          </span>
        </div>
      </main>

      {/* Features (Tính năng) Section - Full Width Grey Background */}
      <section id="features" className="w-full py-20 px-6" style={{ backgroundColor: '#F6F5F4' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black mb-10 tracking-tight" style={{ color: '#090A08' }}>
            Tính năng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Voice Practice */}
            <div className="bg-white border border-gray-100 rounded-3xl pt-8 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="px-8 mb-6">
                <h3 className="text-2xl font-black mb-2" style={{ color: '#090A08' }}>Luyện tập bằng giọng nói</h3>
                <p className="text-sm font-semibold" style={{ color: '#595959' }}>Phân tích: tốc độ nói, từ đệm và độ rõ ràng</p>
              </div>
              <div className="w-full pt-6 px-6 pb-0 flex flex-col justify-between border-t border-blue-100/30" style={{ backgroundColor: '#8FD9EC' }}>
                {/* The white workspace container */}
                <div className="bg-[#FAFBFD] rounded-t-2xl pt-3 px-3 pb-0 flex flex-col shadow-sm border-t border-x border-blue-200/20 text-[8px] font-sans">

                  {/* Upper Section: Split Column Layout */}
                  <div className="grid grid-cols-12 gap-2">

                    {/* Left Column (Video/Audio/Transcript) - 7 cols */}
                    <div className="col-span-7 flex flex-col gap-2">
                      {/* Not recording status bar */}
                      <div className="bg-white rounded-lg p-1.5 border border-gray-100 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                          <span className="font-bold text-[7px]" style={{ color: '#595959' }}>Not recording</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[7px]">📹</span>
                          <span className="text-[7px]">🎙️</span>
                          <span className="bg-gray-100 text-[6px] px-1.5 py-0.5 rounded font-extrabold text-gray-500">Connection</span>
                        </div>
                      </div>

                      {/* Video Box */}
                      <div className="bg-white rounded-lg border border-dashed border-gray-200 p-3 flex flex-col items-center justify-center gap-1.5 min-h-[95px] relative">
                        <span className="font-bold text-[7px] text-center" style={{ color: '#595959' }}>Camera preview will appear here</span>
                        <button className="bg-[#B4F290] text-[#111827] text-[7px] font-bold px-2.5 py-1 rounded">Enable Camera</button>
                      </div>

                      {/* Recording duration bar */}
                      <div className="bg-white rounded-lg p-1.5 border border-gray-100 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-0.5">
                            <span className="w-0.5 h-2 bg-gray-300 rounded-full"></span>
                            <span className="w-0.5 h-3 bg-gray-300 rounded-full"></span>
                            <span className="w-0.5 h-1 bg-gray-300 rounded-full"></span>
                            <span className="w-0.5 h-2.5 bg-gray-300 rounded-full"></span>
                          </div>
                          <span className="text-[7px] font-bold" style={{ color: '#7F7F7F' }}>Recording duration: 00:00</span>
                        </div>
                        <button className="bg-[#7F7F7F]  text-[7px] font-bold px-2 py-1 rounded">Start Recording</button>
                      </div>

                      {/* Transcript Panel */}
                      <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[75px]">
                        <h4 className="font-black text-[7px]" style={{ color: '#090A08' }}>Your Answer Transcript</h4>
                        <div className="border border-gray-100 rounded p-1.5 bg-gray-50/50 mt-1 flex-1 text-[7px] italic font-semibold leading-relaxed" style={{ color: '#7F7F7F' }}>
                          Your answer transcript will appear here after recording starts.
                        </div>
                        <div className="flex justify-between text-[6px] font-bold mt-2" style={{ color: '#7F7F7F' }}>
                          <span>Word count: 0</span>
                          <span>Duration: 00:00</span>
                          <span>Filler words: 0</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (Question/Timers/Tips/Progress) - 5 cols */}
                    <div className="col-span-5 flex flex-col gap-2">
                      {/* Question Card */}
                      <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                        <span className="text-[6px] font-bold" style={{ color: '#7F7F7F' }}>Question 1 of 10</span>
                        <div className="flex gap-1 mt-1">
                          <span className="bg-gray-100 text-[6px] px-1 py-0.5 rounded font-bold text-gray-500">Category: Introduction</span>
                          <span className="bg-gray-100 text-[6px] px-1 py-0.5 rounded font-bold text-gray-500">Suggested Method STAR</span>
                        </div>
                        <p className="font-black text-[8px] mt-1.5 leading-tight" style={{ color: '#090A08' }}>
                          Hãy giới thiệu ngắn gọn về bản thân và kinh nghiệm làm việc của bạn.
                        </p>
                      </div>

                      {/* Timers */}
                      <div className="grid grid-cols-2 gap-1">
                        <div className="bg-white rounded-lg p-1 border border-gray-100 shadow-sm text-center">
                          <span className="text-[5px] font-bold block" style={{ color: '#7F7F7F' }}>Preparation Timer</span>
                          <span className="text-[10px] font-black" style={{ color: '#090A08' }}>00:30</span>
                        </div>
                        <div className="bg-white rounded-lg p-1 border border-gray-100 shadow-sm text-center">
                          <span className="text-[5px] font-bold block" style={{ color: '#7F7F7F' }}>Answer Timer</span>
                          <span className="text-[10px] font-black" style={{ color: '#090A08' }}>00:00</span>
                        </div>
                      </div>

                      {/* Start buttons */}
                      <div className="grid grid-cols-2 gap-1">
                        <button className="bg-[#7F7F7F]  text-[7px] font-bold py-1 rounded">Start Preparation</button>
                        <button className="bg-gray-100 text-gray-400 text-[7px] font-bold py-1 rounded cursor-not-allowed">Start Answer</button>
                      </div>

                      {/* STAR Tips */}
                      <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                        <h4 className="font-black text-[7px] mb-1" style={{ color: '#090A08' }}>STAR Tips</h4>
                        <ul className="text-[5px] font-semibold flex flex-col gap-0.5" style={{ color: '#595959' }}>
                          <li><strong style={{ color: '#090A08' }}>S — Situation:</strong> Briefly describe the context and challenge.</li>
                          <li><strong style={{ color: '#090A08' }}>T — Task:</strong> Explain your specific responsibility.</li>
                          <li><strong style={{ color: '#090A08' }}>A — Action:</strong> Share the steps you took and why.</li>
                          <li><strong style={{ color: '#090A08' }}>R — Result:</strong> Summarize the measurable outcome and learning.</li>
                        </ul>
                      </div>

                      {/* Question Progress */}
                      <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                        <h4 className="font-black text-[7px] mb-1" style={{ color: '#090A08' }}>Question Progress</h4>
                        <div className="grid grid-cols-5 gap-1 text-center font-bold text-[6px]">
                          <span className="w-3 h-3 rounded-full bg-[#B4F290] text-[#111827] flex items-center justify-center">1</span>
                          <span className="w-3 h-3 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center">2</span>
                          <span className="w-3 h-3 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center">3</span>
                          <span className="w-3 h-3 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center">4</span>
                          <span className="w-3 h-3 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center">5</span>
                          <span className="w-3 h-3 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center">6</span>
                          <span className="w-3 h-3 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center">7</span>
                          <span className="w-3 h-3 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center">8</span>
                          <span className="w-3 h-3 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center">9</span>
                          <span className="w-3 h-3 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center font-extrabold">10</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Bar inside workspace */}
                  <div className="bg-white border-t border-gray-100 p-2.5 flex items-center justify-end gap-2 rounded-t-lg mt-2 shadow-sm">
                    <button className="border border-gray-200 text-gray-500 text-[7px] font-bold px-3 py-1 rounded">Save Draft</button>
                    <button className="bg-[#7F7F7F]  text-[7px] font-bold px-3 py-1 rounded">Submit Answer & Next</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: 3 Interview Rounds */}
            <div className="bg-white border border-gray-100 rounded-3xl pt-8 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="px-8 mb-6">
                <h3 className="text-2xl font-black mb-2" style={{ color: '#090A08' }}>Đủ 3 vòng phỏng vấn thật</h3>
                <p className="text-sm font-semibold" style={{ color: '#595959' }}>Người dùng được test qua 3 vòng HR, kỹ thuật và coding</p>
              </div>
              <div className="w-full p-6 flex flex-col gap-4 justify-center aspect-[4/3] border-t border-red-100/30" style={{ backgroundColor: '#FAD2D2' }}>
                {/* Round 1 */}
                <div className="bg-white p-4 rounded-xl border border-red-200/20 shadow-sm flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white bg-red-400">01</div>
                  <div>
                    <h4 className="text-xs font-black" style={{ color: '#090A08' }}>HR</h4>
                    <p className="text-[10px] font-semibold mt-1" style={{ color: '#595959' }}>Câu hỏi hành vi, kỹ năng mềm và định hướng nghề nghiệp.</p>
                  </div>
                </div>
                {/* Round 2 */}
                <div className="bg-white p-4 rounded-xl border border-red-200/20 shadow-sm flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white bg-red-400">02</div>
                  <div>
                    <h4 className="text-xs font-black" style={{ color: '#090A08' }}>Kỹ thuật</h4>
                    <p className="text-[10px] font-semibold mt-1" style={{ color: '#595959' }}>Kiến thức chuyên môn theo tech stack bạn chọn.</p>
                  </div>
                </div>
                {/* Round 3 */}
                <div className="bg-white p-4 rounded-xl border border-red-200/20 shadow-sm flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white bg-red-400">03</div>
                  <div>
                    <h4 className="text-xs font-black" style={{ color: '#090A08' }}>Coding</h4>
                    <p className="text-[10px] font-semibold mt-1" style={{ color: '#595959' }}>Bài tập lập trình thực tế phù hợp cấp độ Intern, Fresher hoặc Junior.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing (Gói dịch vụ) Section - White Background */}
      <section id="pricing" className="w-full py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black mb-10 tracking-tight" style={{ color: '#090A08' }}>
            Gói dịch vụ
          </h2>

          <div className="border border-gray-200 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 mb-8 shadow-sm">
            {/* Free Plan */}
            <div className="p-10 flex flex-col justify-between bg-white border-b md:border-b-0 md:border-r border-gray-200">
              <div>
                <h3 className="text-4xl font-black mb-4" style={{ color: '#090A08' }}>Free</h3>
                <p className="text-sm font-semibold mb-8 leading-relaxed" style={{ color: '#595959' }}>
                  Phù hợp để trải nghiệm đầy đủ tính năng cơ bản mỗi ngày.
                </p>
                <div className="flex flex-col gap-6 font-bold text-sm" style={{ color: '#090A08' }}>
                  <div className="border-t border-gray-100 pt-4">3 buổi mỗi ngày</div>
                  <div className="border-t border-gray-100 pt-4">Full Mock Interview tính 3 buổi</div>
                  <div className="border-t border-gray-100 pt-4 pb-4">Practice Mode, ghi âm, báo cáo, lịch sử & tiến độ</div>
                </div>
              </div>
              <button
                onClick={() => navigate(isAuthenticated ? '/setup' : '/register')}
                className="w-full py-3.5 rounded-full font-bold text-sm text-white hover:opacity-90 transition-opacity mt-8"
                style={{ backgroundColor: '#090A08' }}
              >
                Đăng ký miễn phí
              </button>
            </div>

            {/* Premium Plan */}
            <div className="p-10 flex flex-col justify-between" style={{ backgroundColor: '#9BE870', color: '#163300' }}>
              <div>
                <h3 className="text-4xl font-black mb-4">Premium</h3>
                <p className="text-sm font-bold mb-8 leading-relaxed opacity-90">
                  Dành cho người cần luyện tập không giới hạn và theo dõi tiến độ liên tục.
                </p>
                <div className="flex flex-col gap-6 font-bold text-sm">
                  <div className="border-t border-[#163300]/20 pt-4">Không giới hạn số buổi</div>
                  <div className="border-t border-[#163300]/20 pt-4">Full Mock Interview & Practice Mode</div>
                  <div className="border-t border-[#163300]/20 pt-4 pb-4">Ghi âm, báo cáo chi tiết, lịch sử & tiến độ</div>
                </div>
              </div>
              <div className="h-[52px]"></div> {/* Space matching the button height in Free column */}
            </div>
          </div>

          {/* Notices */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl border text-xs md:text-sm font-bold" style={{ backgroundColor: '#E6F7ED', borderColor: '#B3E8C4', color: '#1C5B32' }}>
              <span className="text-lg">✓</span>
              <span>Tài khoản Free không cần thẻ tín dụng. Hệ thống reset 3 buổi mỗi ngày lúc 00:00.</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border text-xs md:text-sm font-bold" style={{ backgroundColor: '#F0EBFB', borderColor: '#D3C6F7', color: '#4D2C9D' }}>
              <span className="text-lg">✓</span>
              <span>Gói Premium cần liên hệ email để Admin cấp tài khoản – minh bạch, không gây nhầm lẫn về thanh toán online.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Today Section */}
      <section className="w-full py-24 px-6 flex flex-col items-center justify-center text-center" style={{ backgroundColor: '#F6F5F4' }}>
        <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight animate-fade-in" style={{ color: '#090A08' }}>
          Get started today.
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(isAuthenticated ? '/setup' : '/register')}
            className="px-6 py-2.5 rounded-lg font-bold text-xs hover:opacity-95 active:scale-95 transition-all shadow-sm"
            style={{ backgroundColor: '#9BE870', color: '#163300' }}
          >
            Dùng thử ngay
          </button>
          <button
            onClick={() => {
              const featuresSection = document.getElementById('features');
              if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-6 py-2.5 rounded-lg font-bold text-xs bg-white hover:bg-gray-50 active:scale-95 transition-all border border-gray-200/80 shadow-sm"
            style={{ color: '#163300' }}
          >
            Xem demo
          </button>
        </div>
      </section>
    </div>
  );
}
