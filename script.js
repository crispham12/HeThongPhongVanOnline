const fs = require('fs');
const file = 'client/src/pages/admin/AdminAddCodingProblem.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Preview Header border bottom
content = content.replace(/className="px-6 py-5 flex flex-wrap items-center justify-between gap-3"/g,
  'className="px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3"'
);

// 2. Preview Tabs
// Selected: bg-[#222] text-white shadow-sm -> keep
// Inactive: text-gray-500 hover:bg-gray-50 -> add border
const oldPreviewTabClasses = 'className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all whitespace-nowrap shrink-0 ${previewTab === tab.id ? \'bg-[#222] text-white shadow-sm\' : \'text-gray-500 hover:bg-gray-50\'}`}';
const newPreviewTabClasses = 'className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap shrink-0 border ${previewTab === tab.id ? \'bg-[#222] border-[#222] text-white shadow-sm\' : \'border-gray-200 text-gray-500 hover:bg-gray-50\'}`}';
content = content.replace(oldPreviewTabClasses, newPreviewTabClasses);

// 3. Left Form Tabs
// Selected: bg-white text-gray-900 border border-gray-100 shadow-sm
// We want: bg-gray-100 text-gray-900 (no border, no shadow)
content = content.replace(/\? 'bg-white text-gray-900 border border-gray-100 shadow-sm'/g,
  '? \'bg-gray-100 text-gray-900\''
);

// 4. Form Action Buttons (bottom of left form)
// The screenshot has "< Quay lại", "Kế tiếp >", "Hủy bỏ", "[Hoàn tất lưu]"
// Currently:
// content.replace(/className="px-6 py-4 border-t border-gray-100 bg-gray-50\/50 flex items-center justify-between"/g,
// Actually, let's just make sure "Hoàn tất lưu" is black.
content = content.replace(/bg-\[\#333333\]/g, 'bg-[#222]');
content = content.replace(/hover:bg-\[\#1F1F1F\]/g, 'hover:bg-black');

fs.writeFileSync(file, content);
console.log('UI Fix script done');
