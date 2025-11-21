import React from "react";

export const Header: React.FC = () => {
  const userName = "Admin"; // This would come from authentication context
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold"></h1>
      {/* User profile or settings can go here */}
      <div>{userName}</div>
    </header>
  );
};
