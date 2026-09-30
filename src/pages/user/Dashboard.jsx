import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back,
            </h1>
            <p className="text-gray-500 mt-1">
              {user?.email}
            </p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-medium rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95"
          >
            Logout
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile Information
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-1">Role</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {user?.role || "User"}
              </p>
            </div>
            
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
              <p className="text-lg font-semibold text-gray-900">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;