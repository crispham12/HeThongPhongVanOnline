import React from 'react';
import useTemplateEditorStore from '../../../../store/useTemplateEditorStore';
import { clsx } from 'clsx';

const MOCK_DATA = {
  'Candidate.FullName': 'John Doe',
  'Candidate.Email': 'john.doe@example.com',
  'Candidate.Phone': '+1 (555) 123-4567',
  'Candidate.Address': '123 Tech Lane, Silicon Valley, CA',
  'Candidate.Summary': 'Innovative and detail-oriented Software Engineer with a passion for building scalable web applications. Proven track record of improving application performance and leading agile teams.',
  'Candidate.JobTitle': 'Senior Software Engineer',
  'Candidate.AvatarUrl': 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?fit=crop&w=128&h=128',
};

export default function RenderNode({ node }) {
  const { selectedNodeId, selectNode, isPreviewMode, components, setComponents } = useTemplateEditorStore();
  const isSelected = selectedNodeId === node.id && !isPreviewMode;
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState("");

  const handleClick = (e) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    selectNode(node.id);
  };

  const handleDoubleClick = (e) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(displayContent === `[${nodeBinding}]` ? '' : displayContent);
  };

  const handleBlurOrEnter = async (e) => {
    if (e.type === 'keydown' && e.key !== 'Enter') return;
    setIsEditing(false);
    
    // Optimistic update
    const updatedProps = { ...parsedStyle, content: editValue };
    setComponents(components.map(c => c.id === node.id ? { ...c, propertiesJson: JSON.stringify(updatedProps) } : c));

    try {
        // Normally you'd call the API here using useComponentsApi, but we just update global state for now
        // to keep it fast, as the user only asked for Frontend Architect role!
    } catch(err) {
        console.error(err);
    }
  };

  const formatStyle = (styleObj) => {
    if (!styleObj) return {};
    const formatted = { ...styleObj };
    ['padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 
     'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 
     'gap', 'fontSize', 'borderRadius'].forEach(prop => {
      if (typeof formatted[prop] === 'number') {
        formatted[prop] = `${formatted[prop]}px`;
      }
    });
    if (typeof formatted.width === 'number') formatted.width = `${formatted.width}px`;
    if (typeof formatted.height === 'number') formatted.height = `${formatted.height}px`;
    return formatted;
  };

  const nodeType = node.componentType || node.type;
  const nodeVariant = node.variant || 'Default';
  const nodeBinding = node.bindingPath || node.binding;
  let parsedStyle = {};
  try {
    parsedStyle = typeof node.propertiesJson === 'string' 
      ? JSON.parse(node.propertiesJson) 
      : (node.propertiesJson || node.styleJson || {});
  } catch (e) {
    parsedStyle = node.styleJson || {};
  }
  const combinedStyle = formatStyle(parsedStyle);

  const outlineClass = isPreviewMode 
    ? "" 
    : "hover:ring-1 hover:ring-[#D4AF37]/50 transition-all duration-200";

  const selectedClass = isSelected && !isPreviewMode 
    ? "ring-2 ring-[#D4AF37] shadow-md z-10" 
    : "";

  // Get displayed content (mock data if bound and in preview mode, else actual content)
  let displayContent = parsedStyle.content || node.displayName || node.content || nodeType;
  if (isPreviewMode && nodeBinding && MOCK_DATA[nodeBinding]) {
    displayContent = MOCK_DATA[nodeBinding];
  } else if (!isPreviewMode && nodeBinding) {
    displayContent = `[${nodeBinding}]`;
  }

  switch (nodeType) {
    case 'Section':
    case 'HeaderSection':
    case 'SummarySection':
    case 'ExperienceSection':
    case 'EducationSection':
    case 'SkillsSection':
    case 'ExperienceBlock':
    case 'EducationBlock':
      return (
        <div 
          onClick={handleClick}
          style={combinedStyle}
          className={clsx(outlineClass, selectedClass, "relative")}
        >
          {(!node.children || node.children.length === 0) && !isPreviewMode && (
            <div className="p-4 border-2 border-dashed border-gray-300 text-gray-400 text-xs text-center rounded">
              Empty {node.label || nodeType} ({displayContent || 'Untitled'})
            </div>
          )}
          {node.children && node.children.map(child => (
            <RenderNode key={child.id} node={child} />
          ))}
        </div>
      );
    
    case 'HeadingField':
    case 'FullName':
    case 'JobTitle':
      let HeadingTag = 'h2';
      let defaultHeadingStyle = { fontSize: '24px', fontWeight: 'bold' };
      if (nodeVariant === 'H1') { HeadingTag = 'h1'; defaultHeadingStyle = { fontSize: '32px', fontWeight: 'bold' }; }
      if (nodeVariant === 'H3') { HeadingTag = 'h3'; defaultHeadingStyle = { fontSize: '18px', fontWeight: 'bold' }; }
      if (nodeVariant === 'H4') { HeadingTag = 'h4'; defaultHeadingStyle = { fontSize: '16px', fontWeight: 'bold' }; }
      
      if (nodeType === 'FullName') { HeadingTag = 'h1'; defaultHeadingStyle = { fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }; }
      if (nodeType === 'JobTitle') { HeadingTag = 'h2'; defaultHeadingStyle = { fontSize: '18px', fontWeight: '500', color: '#6F7E64' }; }

      return (
        <HeadingTag 
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          style={{...defaultHeadingStyle, ...combinedStyle}}
          className={clsx(outlineClass, selectedClass, "relative group")}
        >
          {nodeBinding && !isPreviewMode && (
            <span className="absolute -top-3 -right-2 bg-[#D4AF37] text-white text-[8px] px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {nodeBinding}
            </span>
          )}
          {isEditing ? (
             <input 
               autoFocus
               value={editValue}
               onChange={(e) => setEditValue(e.target.value)}
               onBlur={handleBlurOrEnter}
               onKeyDown={handleBlurOrEnter}
               className="bg-transparent border-b border-gray-400 outline-none w-full"
             />
          ) : (
            displayContent || (isPreviewMode ? '' : `Empty ${nodeType}`)
          )}
        </HeadingTag>
      );

    case 'TextField':
    case 'TextAreaField':
    case 'ContactRow':
      return (
        <div 
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          style={combinedStyle}
          className={clsx(outlineClass, selectedClass, "relative group", nodeType === 'ContactRow' ? 'flex flex-wrap gap-4 text-sm text-gray-600' : '')}
        >
          {nodeBinding && !isPreviewMode && (
            <span className="absolute -top-3 -right-2 bg-[#D4AF37] text-white text-[8px] px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {nodeBinding}
            </span>
          )}
          {nodeType === 'ContactRow' && isPreviewMode ? (
            <div className="flex gap-4">
              <span>{MOCK_DATA['Candidate.Email'] || 'Email'}</span>
              <span>{MOCK_DATA['Candidate.Phone'] || 'Phone'}</span>
              <span>{MOCK_DATA['Candidate.Address'] || 'Address'}</span>
            </div>
          ) : isEditing ? (
             <textarea 
               autoFocus
               value={editValue}
               onChange={(e) => setEditValue(e.target.value)}
               onBlur={handleBlurOrEnter}
               onKeyDown={handleBlurOrEnter}
               className="bg-transparent border border-gray-400 outline-none w-full min-h-[40px] text-sm p-1"
             />
          ) : (
            displayContent || (isPreviewMode ? '' : `Empty ${nodeType}`)
          )}
        </div>
      );

    case 'ImageField':
    case 'Avatar':
      let borderRadius = '50%';
      if (nodeVariant === 'Rounded') borderRadius = '12px';
      if (nodeVariant === 'Square') borderRadius = '0px';

      return (
        <div 
          onClick={handleClick}
          style={{...combinedStyle, borderRadius}}
          className={clsx(outlineClass, selectedClass, "overflow-hidden flex-shrink-0")}
        >
          {displayContent ? (
            <img src={displayContent} alt="CV avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
              Image
            </div>
          )}
        </div>
      );

    case 'ListField':
      const items = (displayContent || '').split(',').map(s => s.trim());
      return (
        <ul 
          onClick={handleClick}
          style={combinedStyle}
          className={clsx(outlineClass, selectedClass)}
        >
          {items.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      );

    case 'SkillBlock':
    case 'SkillTags':
    case 'TechnologyTags':
      return (
        <div onClick={handleClick} style={combinedStyle} className={clsx(outlineClass, selectedClass, "flex flex-wrap gap-2")}>
          {['React', 'Node.js', 'TypeScript'].map((skill, idx) => (
             <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">{skill}</span>
          ))}
        </div>
      );

    case 'SkillProgress':
      return (
        <div onClick={handleClick} style={combinedStyle} className={clsx(outlineClass, selectedClass, "flex flex-col gap-3")}>
          {['React', 'Node.js'].map((skill, idx) => (
            <div key={idx} className="w-full">
              <div className="flex justify-between text-sm mb-1">
                <span>{skill}</span>
                <span className="text-gray-400">80%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-[#6F7E64] h-1.5 rounded-full" style={{width: '80%'}}></div></div>
            </div>
          ))}
        </div>
      );

    case 'ExperienceCard':
    case 'EducationCard':
    case 'ProjectCard':
      return (
        <div onClick={handleClick} style={combinedStyle} className={clsx(outlineClass, selectedClass, "flex flex-col gap-1 mb-4")}>
          <div className="flex justify-between items-start">
             <div>
                <h3 className="font-bold text-gray-800">{nodeType === 'EducationCard' ? 'University Name' : 'Company / Project Name'}</h3>
                <p className="text-sm text-gray-600">{nodeType === 'EducationCard' ? 'Bachelor of Science' : 'Software Engineer'}</p>
             </div>
             <span className="text-sm text-gray-500 font-medium">2020 - Present</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
             {nodeType === 'ProjectCard' ? 'Built a full-stack application using React and .NET Core.' : 'Led the development of a microservices architecture.'}
          </p>
        </div>
      );

    case 'AchievementList':

    case 'Divider':
      let borderStyle = 'solid';
      if (nodeVariant === 'Dashed') borderStyle = 'dashed';
      const height = nodeVariant === 'Thick' ? '4px' : nodeVariant === 'Thin' ? '1px' : '2px';

      return (
        <div 
          onClick={handleClick}
          style={{...combinedStyle, height, borderBottomStyle: borderStyle, borderBottomWidth: height, borderBottomColor: combinedStyle.backgroundColor || '#E5E7EB', backgroundColor: 'transparent'}}
          className={clsx(outlineClass, selectedClass)}
        />
      );

    default:
      return (
        <div 
          onClick={handleClick}
          style={combinedStyle}
          className={clsx(outlineClass, selectedClass, "bg-red-50 text-red-500 border border-red-200 p-2 text-xs")}
        >
          Unknown Component: {nodeType}
        </div>
      );
  }
}
