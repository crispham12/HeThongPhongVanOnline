import { 
  Type, Image, List, Columns, Minus, Box, 
  Briefcase, GraduationCap, Code, Award, 
  Languages, FolderOpen, AlignLeft, User
} from 'lucide-react';

export const CV_SCHEMA_BINDINGS = [
  { label: 'None (Static Content)', value: '' },
  { label: 'Candidate Full Name', value: 'Candidate.FullName' },
  { label: 'Candidate Email', value: 'Candidate.Email' },
  { label: 'Candidate Phone', value: 'Candidate.Phone' },
  { label: 'Candidate Address', value: 'Candidate.Address' },
  { label: 'Candidate Summary', value: 'Candidate.Summary' },
  { label: 'Candidate Avatar', value: 'Candidate.AvatarUrl' },
  { label: 'Candidate Job Title', value: 'Candidate.JobTitle' },
  { label: 'Experience Array (Loop)', value: 'Candidate.Experiences' },
  { label: 'Education Array (Loop)', value: 'Candidate.Educations' },
  { label: 'Skills Array (Loop)', value: 'Candidate.Skills' },
  { label: 'Projects Array (Loop)', value: 'Candidate.Projects' },
  { label: 'Certificates Array (Loop)', value: 'Candidate.Certificates' }
];

export const CV_COMPONENTS = [
  // --- LAYOUT SECTIONS ---
  {
    type: 'HeaderSection',
    label: 'Header Section',
    icon: Box,
    category: 'Sections',
    defaultConfig: {
      type: 'HeaderSection',
      content: 'Header',
      styleJson: { display: 'flex', flexDirection: 'column', padding: 16, gap: 8, width: '100%' },
      children: [],
      constraints: { canNest: true, allowedChildren: ['*'], allowedParents: ['*'] },
      visibility: { hidden: false, locked: false },
      metadata: { version: '1.0' }
    }
  },
  {
    type: 'SummarySection',
    label: 'Summary Section',
    icon: AlignLeft,
    category: 'Sections',
    defaultConfig: {
      type: 'SummarySection',
      content: 'Summary',
      styleJson: { display: 'flex', flexDirection: 'column', padding: 16, gap: 8, width: '100%' },
      children: [],
      constraints: { canNest: true, allowedChildren: ['TextField', 'TextAreaField'], allowedParents: ['*'] },
      visibility: { hidden: false, locked: false },
      metadata: { version: '1.0' }
    }
  },
  {
    type: 'ExperienceSection',
    label: 'Experience Section',
    icon: Briefcase,
    category: 'Sections',
    defaultConfig: {
      type: 'ExperienceSection',
      content: 'Experience',
      binding: 'Candidate.Experiences', // Loop binding
      styleJson: { display: 'flex', flexDirection: 'column', padding: 16, gap: 16, width: '100%' },
      children: [],
      constraints: { canNest: true, allowedChildren: ['ExperienceBlock', 'HeadingField'], allowedParents: ['*'] },
      visibility: { hidden: false, locked: false },
      metadata: { version: '1.0' }
    }
  },
  {
    type: 'EducationSection',
    label: 'Education Section',
    icon: GraduationCap,
    category: 'Sections',
    defaultConfig: {
      type: 'EducationSection',
      content: 'Education',
      binding: 'Candidate.Educations', // Loop binding
      styleJson: { display: 'flex', flexDirection: 'column', padding: 16, gap: 16, width: '100%' },
      children: [],
      constraints: { canNest: true, allowedChildren: ['EducationBlock', 'HeadingField'], allowedParents: ['*'] },
      visibility: { hidden: false, locked: false },
      metadata: { version: '1.0' }
    }
  },
  {
    type: 'SkillsSection',
    label: 'Skills Section',
    icon: Code,
    category: 'Sections',
    defaultConfig: {
      type: 'SkillsSection',
      content: 'Skills',
      binding: 'Candidate.Skills', // Loop binding
      styleJson: { display: 'flex', flexDirection: 'column', padding: 16, gap: 16, width: '100%' },
      children: [],
      constraints: { canNest: true, allowedChildren: ['SkillBlock', 'HeadingField'], allowedParents: ['*'] },
      visibility: { hidden: false, locked: false },
      metadata: { version: '1.0' }
    }
  },

  // --- REPEATABLE BLOCKS ---
  {
    type: 'ExperienceBlock',
    label: 'Experience Item',
    icon: Columns,
    category: 'Blocks',
    defaultConfig: {
      type: 'ExperienceBlock',
      content: 'Experience Block',
      styleJson: { display: 'flex', flexDirection: 'column', gap: 4, width: '100%' },
      children: [], 
      constraints: { canNest: true, allowedChildren: ['TextField', 'TextAreaField', 'ListField'], allowedParents: ['ExperienceSection'] },
      visibility: { hidden: false, locked: false },
      metadata: { version: '1.0' }
    }
  },
  {
    type: 'EducationBlock',
    label: 'Education Item',
    icon: Columns,
    category: 'Blocks',
    defaultConfig: {
      type: 'EducationBlock',
      content: 'Education Block',
      styleJson: { display: 'flex', flexDirection: 'column', gap: 4, width: '100%' },
      children: [], 
      constraints: { canNest: true, allowedChildren: ['TextField', 'TextAreaField'], allowedParents: ['EducationSection'] },
      visibility: { hidden: false, locked: false },
      metadata: { version: '1.0' }
    }
  },
  {
    type: 'SkillBlock',
    label: 'Skill Item',
    icon: Columns,
    category: 'Blocks',
    defaultConfig: {
      type: 'SkillBlock',
      content: 'Skill Block',
      variant: 'Tag', // Tag | ProgressBar | List
      styleJson: { display: 'flex', gap: 8, flexWrap: 'wrap', width: '100%' },
      children: [], 
      constraints: { canNest: false, allowedChildren: [], allowedParents: ['SkillsSection'] },
      visibility: { hidden: false, locked: false },
      metadata: { version: '1.0' }
    }
  },

  // --- ELEMENTS ---
  {
    type: 'HeadingField',
    label: 'Heading',
    icon: Type,
    category: 'Elements',
    defaultConfig: {
      type: 'HeadingField',
      content: 'Heading Text',
      variant: 'H2', // H1 | H2 | H3 | H4
      binding: null,
      styleJson: { color: '#111827', textAlign: 'left', width: '100%', marginBottom: 8 },
      constraints: { canNest: false, allowedChildren: [], allowedParents: ['*'] },
      visibility: { hidden: false, locked: false },
      metadata: { version: '1.0' }
    }
  },
  {
    type: 'TextField',
    label: 'Text Field',
    icon: Type,
    category: 'Elements',
    defaultConfig: {
      type: 'TextField',
      content: 'Sample Text',
      binding: null,
      styleJson: { fontSize: 14, color: '#374151', fontWeight: 'normal', textAlign: 'left', width: '100%' },
      constraints: { canNest: false, allowedChildren: [], allowedParents: ['*'] },
      visibility: { hidden: false, locked: false },
      metadata: { version: '1.0' }
    }
  },
  {
    type: 'ImageField',
    label: 'Avatar / Image',
    icon: Image,
    category: 'Elements',
    defaultConfig: {
      type: 'ImageField',
      content: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=128&h=128',
      variant: 'Circle', // Circle | Rounded | Square
      binding: null,
      styleJson: { width: 100, height: 100, objectFit: 'cover' },
      constraints: { canNest: false, allowedChildren: [], allowedParents: ['*'] },
      visibility: { hidden: false, locked: false },
      metadata: { version: '1.0' }
    }
  },
  {
    type: 'Divider',
    label: 'Divider Line',
    icon: Minus,
    category: 'Elements',
    defaultConfig: {
      type: 'Divider',
      content: '',
      variant: 'Solid', // Solid | Dashed | Thick | Thin
      styleJson: { height: 1, backgroundColor: '#E5E7EB', width: '100%', marginTop: 8, marginBottom: 8 },
      constraints: { canNest: false, allowedChildren: [], allowedParents: ['*'] },
      visibility: { hidden: false, locked: false },
      metadata: { version: '1.0' }
    }
  }
];

export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

export const getComponentVariants = (type) => {
  switch (type) {
    case 'HeadingField': return ['H1', 'H2', 'H3', 'H4'];
    case 'ImageField': return ['Circle', 'Rounded', 'Square'];
    case 'SkillBlock': return ['Tag', 'ProgressBar', 'List'];
    case 'Divider': return ['Solid', 'Dashed', 'Thick', 'Thin'];
    default: return null;
  }
};
