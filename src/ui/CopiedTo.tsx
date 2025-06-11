import { UserType } from "../interfaces";
import Row from "./Row";

const CopiedTo = ({ to }: { to: UserType[] }) => {
  return (
    // <div className="max-w-md mx-auto p-4 bg-inherit rounded-lg shadow-sm">
    <div className="w-full p-4 bg-inherit rounded-lg shadow-sm">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">Shared With</h1>

      {to.length === 0 ? (
        <p className="text-sm text-gray-400">No recipients</p>
      ) : (
        // <div className="space-y-3">
        <Row cols="grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
          {to.map((user) => (
            <div
              key={user.id}
              className="p-3 border rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-600">
                  {user.first_name.charAt(0)}
                  {user.last_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {`${user.first_name} ${user.last_name}`}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {user.role}
                </span>
              </div>
            </div>
          ))}
        </Row>
      )}
    </div>
  );
};

export default CopiedTo;
