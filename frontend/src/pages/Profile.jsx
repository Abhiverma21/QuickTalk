import { useState, useContext, useEffect } from "react";
import api from "../api/axios";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, login } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || "");
  const [preview, setPreview] = useState(user?.profilePic || "");
  const [file, setFile] = useState(null);
  const [userInfo, setUserInfo] = useState(user || null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      if (file) {
        formData.append("profilePic", file);
      }

      const res = await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.user) {
        // Update auth context and localStorage
        const token = localStorage.getItem("token");
        login({ token, user: res.data.user });
        setUserInfo(res.data.user);
        alert("Profile updated");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        if (res.data && res.data.user) {
          setUserInfo(res.data.user);
          setName(res.data.user.name || "");
          setPreview(res.data.user.profilePic || "");
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-6 shadow border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
              <p className="mt-1 text-sm text-slate-600">Manage your account information and avatar.</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="col-span-1 flex flex-col items-center">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                {preview ? (
                  <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                )}
              </div>

              <label className="mt-4 inline-flex items-center px-3 py-2 rounded-md bg-white border text-sm text-slate-700 cursor-pointer shadow-sm hover:bg-slate-50">
                Choose image
                <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
              </label>

              <p className="mt-2 text-xs text-slate-500">PNG, JPG up to 2MB.</p>
            </div>

            <div className="md:col-span-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input value={userInfo?.email || ""} disabled className="mt-1 w-full rounded-md border border-slate-100 p-2 bg-slate-50 text-slate-600" />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button onClick={handleSave} disabled={loading} className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-60">
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-medium text-slate-800">Account Details</h2>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded">
                    <span className="text-sm text-slate-600">Phone</span>
                    <span className="text-sm font-medium text-slate-800">{userInfo?.phone || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded">
                    <span className="text-sm text-slate-600">Online</span>
                    <span className="text-sm font-medium text-slate-800">{userInfo?.isOnline ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded">
                    <span className="text-sm text-slate-600">Last Seen</span>
                    <span className="text-sm font-medium text-slate-800">{userInfo?.lastSeen ? new Date(userInfo.lastSeen).toLocaleString() : "-"}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded">
                    <span className="text-sm text-slate-600">Joined</span>
                    <span className="text-sm font-medium text-slate-800">{userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleString() : "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
