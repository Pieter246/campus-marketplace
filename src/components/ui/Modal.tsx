"use client";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose} // closes when clicking outside
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-lg max-w-lg w-full relative"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <button
          className="cursor-pointer absolute top-4 right-4 text-gray-500 hover:text-gray-800 rounded-full p-1 hover:bg-gray-100"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
