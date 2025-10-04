import { useState, useEffect } from "react";
import { Star, CreditCard as Edit, Plus } from "lucide-react";
import DeviceOfWeekDialog from "./DeviceOfWeekDialog";
import { getDeviceOfTheWeek, setDeviceOfTheWeek, updateDeviceOfTheWeek } from "../lib/firebase";

interface DeviceOfWeekData {
  id?: string;
  title: string;
  brand: string;
  description: string;
  image: string;
  price?: string;
  issues: string[];
  tips: string[];
  specifications: { [key: string]: string };
}

export default function AdminDeviceOfWeek() {
  const [currentDevice, setCurrentDevice] = useState<DeviceOfWeekData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevice();
  }, []);

  const loadDevice = async () => {
    setLoading(true);
    try {
      const device = await getDeviceOfTheWeek();
      //@ts-expect-error:error
      setCurrentDevice(device);
    } catch (error) {
      console.error("Error loading device:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: DeviceOfWeekData) => {
    try {
      if (currentDevice?.id) {
        await updateDeviceOfTheWeek(currentDevice.id, data);
      } else {
        await setDeviceOfTheWeek(data);
      }
      await loadDevice();
      alert("Device of the Week updated successfully!");
    } catch (error) {
      console.error("Error saving device:", error);
      alert("Failed to save device. Please try again.");
    }
  };

  const handleEdit = () => {
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setCurrentDevice(null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Star className="w-7 h-7 text-yellow-500" />
            Device of the Week
          </h2>
          <p className="text-gray-600 mt-1">Manage the featured device displayed on the homepage</p>
        </div>
        <button
          onClick={currentDevice ? handleEdit : handleAdd}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 font-medium"
        >
          {currentDevice ? (
            <>
              <Edit className="w-5 h-5" />
              Edit Device
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add Device
            </>
          )}
        </button>
      </div>

      {currentDevice ? (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 flex items-center justify-center">
              <img
                src={currentDevice.image}
                alt={currentDevice.title}
                className="w-full max-w-sm h-auto rounded-xl shadow-lg object-cover"
              />
            </div>

            <div className="md:w-2/3 p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">{currentDevice.title}</h3>
                  <p className="text-lg text-blue-600 font-semibold mt-1">{currentDevice.brand}</p>
                  {currentDevice.price && (
                    <p className="text-xl text-green-600 font-bold mt-2">{currentDevice.price}</p>
                  )}
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">{currentDevice.description}</p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">⚠</span>
                    Common Issues
                  </h4>
                  <ul className="space-y-2">
                    {currentDevice.issues.map((issue, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    Safety Tips
                  </h4>
                  <ul className="space-y-2">
                    {currentDevice.tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {Object.entries(currentDevice.specifications).length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-3">Specifications</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(currentDevice.specifications).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-semibold text-gray-700">{key}:</span>{" "}
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Star className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Device of the Week Set</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Add a featured device to showcase on your homepage and attract user attention.
          </p>
          <button
            onClick={handleAdd}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 font-medium mx-auto"
          >
            <Plus className="w-5 h-5" />
            Add Device of the Week
          </button>
        </div>
      )}

      <DeviceOfWeekDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        currentDevice={currentDevice}
      />
    </div>
  );
}
