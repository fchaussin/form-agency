import React from "react";

export const SubmissionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Submissions Management</h2>
      </div>
      <div className="text-center text-gray-500">
        No submissions to display.
      </div>
    </div>
  );
};
