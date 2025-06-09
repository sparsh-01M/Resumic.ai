export interface LaTeXTemplate {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  filePath: string;
  features: string[];
}

export const latexTemplates: LaTeXTemplate[] = [
  {
    id: 'template1',
    name: 'Modern Professional',
    description: 'A clean and modern template with a professional layout, perfect for tech professionals.',
    previewImage: '/templates/previews/template1.png',
    filePath: '/src/templates/latex/template1.tex',
    features: [
      'Two-column layout',
      'Skills section with progress bars',
      'Project showcase with icons',
      'Education timeline'
    ]
  },
  {
    id: 'template2',
    name: 'Creative Portfolio',
    description: 'A creative template with a unique design, ideal for designers and creative professionals.',
    previewImage: '/templates/previews/template2.png',
    filePath: '/src/templates/latex/template2.tex',
    features: [
      'Creative header design',
      'Portfolio section',
      'Custom color schemes',
      'Achievement highlights'
    ]
  },
  {
    id: 'template3',
    name: 'Academic CV',
    description: 'A comprehensive template designed for academic professionals and researchers.',
    previewImage: '/templates/previews/template3.png',
    filePath: '/src/templates/latex/template3.tex',
    features: [
      'Publication list',
      'Research experience',
      'Teaching experience',
      'Conference presentations'
    ]
  },
  {
    id: 'template4',
    name: 'Executive Resume',
    description: 'An elegant template for senior executives and management professionals.',
    previewImage: '/templates/previews/template4.png',
    filePath: '/src/templates/latex/template4.tex',
    features: [
      'Executive summary',
      'Leadership experience',
      'Key achievements',
      'Professional certifications'
    ]
  },
  {
    id: 'template5',
    name: 'Minimalist Modern',
    description: 'A minimalist template with a modern touch, perfect for any professional.',
    previewImage: '/templates/previews/template5.png',
    filePath: '/src/templates/latex/template5.tex',
    features: [
      'Clean typography',
      'Minimalist design',
      'Easy to customize',
      'ATS-friendly layout'
    ]
  }
]; 