import React from "react";

export const Header: React.FC = () => {
  const userName = "Admin"; // This would come from authentication context
  return (
    <div>
      <div>{userName}</div>
    </div>
  );
};
