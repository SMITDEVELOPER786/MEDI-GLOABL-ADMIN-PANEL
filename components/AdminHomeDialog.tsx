import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface HomeContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { howWeHelp: string; ourStory: string }) => void;
  currentContent: { howWeHelp: string; ourStory: string } | null;
}

export default function HomeContentDialog({
  isOpen,
  onClose,
  onSave,
  currentContent,
}: HomeContentDialogProps) {
  const [formData, setFormData] = useState({
    howWeHelp: "",
    ourStory: "",
  });

  useEffect(() => {
    if (currentContent) {
      setFormData({
        howWeHelp: currentContent.howWeHelp || "",
        ourStory: currentContent.ourStory || "",
      });
    }
  }, [currentContent, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.howWeHelp.trim()) {
      alert("Please enter the 'How We Help' content");
      return;
    }

    if (!formData.ourStory.trim()) {
      alert("Please enter the 'Our Story' content");
      return;
    }

    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-white/50">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl font-bold text-white">Edit Home Content</h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2 transition-all"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-60px)] sm:max-h-[calc(95vh-72px)]">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                How We Help
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={formData.howWeHelp}
                onChange={(e) =>
                  setFormData({ ...formData, howWeHelp: e.target.value })
                }
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base bg-white/80 backdrop-blur-sm"
                rows={6}
                placeholder="Enter the 'How We Help' content here..."
                required
              />
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                {formData.howWeHelp.length} characters | Use line breaks to separate
                paragraphs
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4 sm:pt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Our Story
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={formData.ourStory}
                onChange={(e) =>
                  setFormData({ ...formData, ourStory: e.target.value })
                }
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base bg-white/80 backdrop-blur-sm"
                rows={8}
                placeholder="Enter the 'Our Story' content here..."
                required
              />
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                {formData.ourStory.length} characters | Use line breaks to separate
                paragraphs
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
              <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <span className="text-lg sm:text-xl">💡</span>
                Writing Tips
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-yellow-800">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>Write in a clear, professional, and engaging tone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>Focus on benefits and value for your audience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>Use paragraph breaks for better readability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>Keep content authentic and aligned with your brand</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg font-medium text-sm sm:text-base"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


