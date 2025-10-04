import { useState, useEffect } from "react";
import { FileText, CreditCard as Edit } from "lucide-react";
import HomeContentDialog from "./AdminHomeDialog";
import { getHomeContent, updateHomeContent } from "../lib/firebase";
import { toast } from "sonner";

interface HomeContentData {
  howWeHelp: string;
  ourStory: string;
}

const defaultContent: HomeContentData = {
  howWeHelp:
    "At MediGlobal, we believe that advancing healthcare begins with smarter access, trusted tools, and human-centered technology. That's why we're more than just a marketplace — our platform brings together verified medical devices, biomedical expertise, and interactive learning to create a safer, more connected healthcare environment.",
  ourStory:
    "At MediGlobal, we saw a critical gap in how medical technology reaches the people who need it most. Across hospitals, labs, and clinics, the process of sourcing medical devices remains slow, fragmented, and often lacking the transparency required for safe and confident decision-making. We founded MediGlobal to change that. Bringing together deep experience in biomedical engineering, clinical workflows, and digital health, our platform was built to streamline medical device access across the MENA region and beyond. From procurement and product education to expert guidance and supplier trust, MediGlobal is designed to support every stage of the healthcare technology journey. We believe that better access to reliable medical equipment means better care, better outcomes, and better trust in the systems we rely on every day. MediGlobal continues to grow — one device, one connection, one safer decision at a time.",
};

export default function AdminHomeContent() {
  const [content, setContent] = useState<HomeContentData>(defaultContent);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const data = await getHomeContent();
      if (data) {
        setContent({
          howWeHelp: data.howWeHelp || defaultContent.howWeHelp,
          ourStory: data.ourStory || defaultContent.ourStory,
        });
      }
    } catch (error) {
      console.error("Error loading home content:", error);
      toast.error("Failed to load content. Please try again.", {
        className: "bg-red-50 border border-red-200 text-red-700 shadow-md",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: HomeContentData) => {
    try {
      await updateHomeContent(data);
      await loadContent();
      toast.success("Home content updated successfully!", {
        description: "Content Updated",
        className: "bg-green-50 border border-green-200 text-green-700 shadow-md",
      });
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content. Please try again.", {
        className: "bg-red-50 border border-red-200 text-red-700 shadow-md",
      });
    }
  };

  const handleEdit = () => {
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-500" />
            Homepage Content Manager
          </h2>
          <p className="text-gray-500 mt-2 text-lg">
            Edit the `How We Help` and  `Our Story` sections to engage your audience.
          </p>
        </div>
        <button
          onClick={handleEdit}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-xl flex items-center gap-2 font-semibold"
        >
          <Edit className="w-5 h-5" />
          Edit Content
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">💡</span>
              How We Help
            </h3>
          </div>
          <div className="p-6">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
              {content.howWeHelp}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Character count: {content.howWeHelp.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">📖</span>
              Our Story
            </h3>
          </div>
          <div className="p-6">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
              {content.ourStory}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Character count: {content.ourStory.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-md">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2 text-lg">
          <span className="text-xl">ℹ️</span>
          Content Guidelines
        </h4>
        <ul className="space-y-3 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Keep content clear, concise, and engaging for your audience.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Use line breaks to enhance readability and structure.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Highlight MediGlobal`s value proposition and unique story.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Updates will reflect immediately on the homepage.</span>
          </li>
        </ul>
      </div>

      <HomeContentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        currentContent={content}
      />
    </div>
  );
}