import React, { useState, useRef } from 'react';
import { Plus, Trash2, User, Briefcase, GraduationCap, Code, Mail, Phone, MapPin, Globe, Download, Send, Eye } from 'lucide-react';

export default function CreateCV() {
  const [personalInfo, setPersonalInfo] = useState({
    fullName: 'Nguyễn Văn A',
    title: 'Frontend Developer',
    email: 'nguyenvana@example.com',
    phone: '0123 456 789',
    address: 'Hà Nội, Việt Nam',
    website: 'github.com/nguyenvana',
    summary: 'Lập trình viên Frontend với 2 năm kinh nghiệm làm việc với React, Next.js và Tailwind CSS. Đam mê tạo ra các giao diện người dùng tối ưu và hiệu năng cao.',
  });

  const [experience, setExperience] = useState([
    {
      company: 'Công ty Công nghệ XYZ',
      role: 'Senior Frontend Developer',
      period: '01/2022 - Hiện tại',
      description: 'Phát triển các tính năng mới cho ứng dụng SaaS. Tối ưu hóa hiệu năng website tăng 40%. Quản lý đội ngũ 3 lập trình viên Junior.',
    },
  ]);

  const [education, setEducation] = useState([
    {
      school: 'Đại học Bách Khoa Hà Nội',
      degree: 'Cử nhân Kỹ thuật Phần mềm',
      period: '2017 - 2021',
      gpa: '3.6/4.0',
    },
  ]);

  const [skills, setSkills] = useState(['React', 'JavaScript', 'Tailwind CSS', 'Next.js', 'Node.js', 'Git']);

  const addExperience = () => {
    setExperience([...experience, { company: '', role: '', period: '', description: '' }]);
  };

  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([...education, { school: '', degree: '', period: '', gpa: '' }]);
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleSkillAdd = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      setSkills([...skills, e.target.value]);
      e.target.value = '';
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trình tạo CV thông minh</h1>
          <p className="text-sm text-gray-500 mt-1">Thiết kế CV chuyên nghiệp với sự hỗ trợ của AI.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
            <Eye className="w-4 h-4" /> Xem trước
          </button>
          <button className="btn-primary">
            <Download className="w-4 h-4" /> Tải PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Side: Form */}
        <div className="space-y-6">
          {/* Personal Info */}
          <section className="card">
            <div className="flex items-center gap-2 mb-6 text-primary-600">
              <User className="w-5 h-5" />
              <h2 className="font-bold">Thông tin cá nhân</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">Họ và tên</label>
                <input 
                  type="text" 
                  className="input" 
                  value={personalInfo.fullName} 
                  onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">Vị trí ứng tuyển</label>
                <input 
                  type="text" 
                  className="input" 
                  value={personalInfo.title} 
                  onChange={(e) => setPersonalInfo({...personalInfo, title: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                <input 
                  type="email" 
                  className="input" 
                  value={personalInfo.email} 
                  onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">Số điện thoại</label>
                <input 
                  type="text" 
                  className="input" 
                  value={personalInfo.phone} 
                  onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Giới thiệu bản thân</label>
              <textarea 
                className="input min-h-[100px] resize-none" 
                value={personalInfo.summary}
                onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
              />
            </div>
          </section>

          {/* Experience */}
          <section className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-primary-600">
                <Briefcase className="w-5 h-5" />
                <h2 className="font-bold">Kinh nghiệm làm việc</h2>
              </div>
              <button onClick={addExperience} className="p-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div key={idx} className="relative p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <button onClick={() => removeExperience(idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" placeholder="Công ty" className="input" 
                      value={exp.company} 
                      onChange={(e) => {
                        const newExp = [...experience];
                        newExp[idx].company = e.target.value;
                        setExperience(newExp);
                      }}
                    />
                    <input 
                      type="text" placeholder="Chức danh" className="input" 
                      value={exp.role} 
                      onChange={(e) => {
                        const newExp = [...experience];
                        newExp[idx].role = e.target.value;
                        setExperience(newExp);
                      }}
                    />
                    <input 
                      type="text" placeholder="Thời gian (ví dụ: 2021 - 2023)" className="input md:col-span-2" 
                      value={exp.period} 
                      onChange={(e) => {
                        const newExp = [...experience];
                        newExp[idx].period = e.target.value;
                        setExperience(newExp);
                      }}
                    />
                    <textarea 
                      placeholder="Mô tả công việc" className="input md:col-span-2 min-h-[80px] resize-none" 
                      value={exp.description} 
                      onChange={(e) => {
                        const newExp = [...experience];
                        newExp[idx].description = e.target.value;
                        setExperience(newExp);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-primary-600">
                <GraduationCap className="w-5 h-5" />
                <h2 className="font-bold">Học vấn</h2>
              </div>
              <button onClick={addEducation} className="p-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-6">
              {education.map((edu, idx) => (
                <div key={idx} className="relative p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <button onClick={() => removeEducation(idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" placeholder="Trường học" className="input" 
                      value={edu.school}
                      onChange={(e) => {
                        const newEdu = [...education];
                        newEdu[idx].school = e.target.value;
                        setEducation(newEdu);
                      }}
                    />
                    <input 
                      type="text" placeholder="Bằng cấp" className="input" 
                      value={edu.degree}
                      onChange={(e) => {
                        const newEdu = [...education];
                        newEdu[idx].degree = e.target.value;
                        setEducation(newEdu);
                      }}
                    />
                    <input 
                      type="text" placeholder="Thời gian" className="input" 
                      value={edu.period}
                      onChange={(e) => {
                        const newEdu = [...education];
                        newEdu[idx].period = e.target.value;
                        setEducation(newEdu);
                      }}
                    />
                    <input 
                      type="text" placeholder="GPA" className="input" 
                      value={edu.gpa}
                      onChange={(e) => {
                        const newEdu = [...education];
                        newEdu[idx].gpa = e.target.value;
                        setEducation(newEdu);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section className="card">
            <div className="flex items-center gap-2 mb-6 text-primary-600">
              <Code className="w-5 h-5" />
              <h2 className="font-bold">Kỹ năng chuyên môn</h2>
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Nhập kỹ năng và nhấn Enter..." 
                className="input" 
                onKeyDown={handleSkillAdd}
              />
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span key={idx} className="badge bg-primary-50 text-primary-700 py-1.5 px-3 flex items-center gap-2 group border border-primary-100">
                    {skill}
                    <button onClick={() => removeSkill(idx)} className="text-primary-300 hover:text-red-500 group-hover:text-primary-500 transition-colors">
                      <Plus className="w-3 h-3 rotate-45" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Preview */}
        <div className="sticky top-8 h-fit">
          <div className="bg-white shadow-2xl rounded-sm aspect-[1/1.414] overflow-hidden border border-gray-200">
            {/* Header: Blue Section */}
            <div className="bg-primary-600 p-10 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-extrabold uppercase tracking-tight">{personalInfo.fullName || 'HỌ TÊN CỦA BẠN'}</h1>
                  <p className="text-xl text-primary-100 font-medium mt-1 uppercase tracking-wider">{personalInfo.title || 'VỊ TRÍ ỨNG TUYỂN'}</p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-y-3 gap-x-4 text-sm font-medium">
                <div className="flex items-center gap-2.5 opacity-90">
                  <div className="p-1.5 bg-primary-500/30 rounded-lg"><Mail className="w-4 h-4" /></div>
                  {personalInfo.email || 'email@example.com'}
                </div>
                <div className="flex items-center gap-2.5 opacity-90">
                  <div className="p-1.5 bg-primary-500/30 rounded-lg"><Phone className="w-4 h-4" /></div>
                  {personalInfo.phone || '0123 456 789'}
                </div>
                <div className="flex items-center gap-2.5 opacity-90">
                  <div className="p-1.5 bg-primary-500/30 rounded-lg"><MapPin className="w-4 h-4" /></div>
                  {personalInfo.address || 'Địa chỉ của bạn'}
                </div>
                <div className="flex items-center gap-2.5 opacity-90">
                  <div className="p-1.5 bg-primary-500/30 rounded-lg"><Globe className="w-4 h-4" /></div>
                  {personalInfo.website || 'website.com'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 h-full">
              {/* Sidebar: Light Gray */}
              <div className="bg-gray-50/50 p-8 border-r border-gray-100 flex flex-col gap-8 h-full">
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-4 h-[2px] bg-primary-600"></span>
                    Kỹ năng
                  </h3>
                  <div className="space-y-2.5">
                    {skills.map((skill, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-bold text-gray-700">
                          <span>{skill}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-4 h-[2px] bg-primary-600"></span>
                    Ngoại ngữ
                  </h3>
                  <ul className="space-y-2 text-sm font-semibold text-gray-700">
                    <li className="flex justify-between">Tiếng Anh <span className="text-gray-400">IELTS 7.5</span></li>
                    <li className="flex justify-between">Tiếng Việt <span className="text-gray-400">Bản ngữ</span></li>
                  </ul>
                </section>
              </div>

              {/* Main Content: White */}
              <div className="col-span-2 p-10 space-y-10">
                <section>
                  <h3 className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-4 flex items-center gap-3">
                    GIỚI THIỆU
                    <span className="flex-1 h-[1px] bg-gray-100"></span>
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium italic">
                    "{personalInfo.summary || 'Viết một vài dòng giới thiệu về bản thân bạn...'}"
                  </p>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-4 flex items-center gap-3">
                    KINH NGHIỆM
                    <span className="flex-1 h-[1px] bg-gray-100"></span>
                  </h3>
                  <div className="space-y-6">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="relative pl-4 border-l-2 border-primary-100">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary-600"></div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase">{exp.role || 'Chức danh'}</h4>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-primary-600">{exp.company || 'Tên công ty'}</span>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{exp.period || '2021 - 2023'}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{exp.description || 'Mô tả công việc của bạn...'}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-4 flex items-center gap-3">
                    HỌC VẤN
                    <span className="flex-1 h-[1px] bg-gray-100"></span>
                  </h3>
                  <div className="space-y-6">
                    {education.map((edu, idx) => (
                      <div key={idx} className="relative pl-4 border-l-2 border-gray-100">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-200"></div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase">{edu.school || 'Tên trường học'}</h4>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-gray-500">{edu.degree || 'Bằng cấp'}</span>
                          <span className="text-[10px] font-bold text-gray-400">{edu.period || '2017 - 2021'}</span>
                        </div>
                        {edu.gpa && <p className="text-xs font-bold text-primary-600">GPA: {edu.gpa}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
