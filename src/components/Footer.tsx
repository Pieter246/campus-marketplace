import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-gray-600 py-6 w-full sticky bottom-0">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm">&copy; {currentYear} Campus Marketplace. All rights reserved.</span>
        </div>
        <div className="text-sm">
          <a href="/terms" className="hover:underline mr-4">Terms & Conditions</a>
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
