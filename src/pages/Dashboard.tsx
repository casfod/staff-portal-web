export function Dashboard() {
  // Mock data for charts
  const stats = [
    { name: "Total Projects", total: 12, approved: 8 },
    { name: "Purchase Requests", total: 24, approved: 18 },
    { name: "Travel Requests", total: 15, approved: 10 },
    { name: "Advance Requests", total: 20, approved: 15 },
  ];

  return (
    <div className="space-y-6">
      <h1
        className="text-2xl font-semibold text-gray-700"
        style={{ fontFamily: "Lato", letterSpacing: "2px" }}
      >
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {stat.name}
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-700">
                  {stat.total}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-green-600">
                  {stat.approved}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
