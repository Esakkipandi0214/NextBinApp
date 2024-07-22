//notes model

// components/ui/modal.tsx
import React from 'react';
import { Button } from '@/components/ui/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  createdAt: string;
  customerName: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, content, createdAt, customerName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-50 p-6 rounded-lg shadow-xl border border-gray-300 w-full max-w-lg relative">
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors"
        >
          <span className="text-xl">&times;</span>
        </Button>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Title: {title}</h2>
        <p className="text-gray-600 mb-2 font-semibold">Customer Name:</p>
        <p className="text-gray-800 mb-4 border-b border-gray-200 pb-2">{customerName}</p>
        <p className="text-gray-600 mb-2 font-semibold">Content:</p>
        <p className="text-gray-800 mb-4 border-b border-gray-200 pb-2">{content}</p>
        <p className="text-sm text-gray-600">Created at: {new Date(createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default Modal;
