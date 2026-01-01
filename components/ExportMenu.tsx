import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Printer, FileJson, Table } from 'lucide-react';

export type ExportOption = 'markdown' | 'json' | 'csv' | 'print';

interface ExportMenuItem {
  id: ExportOption;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface ExportMenuProps {
  onExport: (type: ExportOption) => void;
  options: ExportOption[];
  buttonText?: string;
  buttonClassName?: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExport,
  options,
  buttonText = 'Export',
  buttonClassName = 'bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const allMenuItems: Record<ExportOption, ExportMenuItem> = {
    markdown: {
      id: 'markdown',
      label: 'Markdown',
      icon: <FileText className="w-4 h-4" />,
      description: 'Export as .md file',
    },
    json: {
      id: 'json',
      label: 'JSON',
      icon: <FileJson className="w-4 h-4" />,
      description: 'Export as .json file',
    },
    csv: {
      id: 'csv',
      label: 'CSV',
      icon: <Table className="w-4 h-4" />,
      description: 'Export as spreadsheet',
    },
    print: {
      id: 'print',
      label: 'Print',
      icon: <Printer className="w-4 h-4" />,
      description: 'Print or save as PDF',
    },
  };

  const menuItems = options.map(opt => allMenuItems[opt]);

  const handleExport = (type: ExportOption) => {
    onExport(type);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClassName}
      >
        <Download className="w-4 h-4" />
        {buttonText}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-lg shadow-lg z-10 overflow-hidden">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleExport(item.id)}
              className="w-full px-4 py-3 flex items-start gap-3 hover:bg-stone-50 transition-colors text-left border-b border-stone-100 last:border-b-0"
            >
              <div className="text-emerald-600 mt-0.5">{item.icon}</div>
              <div>
                <div className="text-sm font-medium text-stone-900">{item.label}</div>
                <div className="text-xs text-stone-500 mt-0.5">{item.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
