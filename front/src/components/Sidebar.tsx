import React from "react";
import { Link } from "react-router-dom";
import { Header } from "./Header";

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4 h-dvh min-h-screen flex flex-col">
      <div className="text-3xl font-bold mb-6">Form Agency</div>
      <nav className="flex-grow">
        <ul>
          <li className="mb-2">
            <Link to="/" className="block hover:bg-gray-700 p-2 rounded">
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/forms" className="block hover:bg-gray-700 p-2 rounded">
              Forms
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/field-types"
              className="block hover:bg-gray-700 p-2 rounded"
            >
              Field Types
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/submissions"
              className="block hover:bg-gray-700 p-2 rounded"
            >
              Submissions
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/consumers"
              className="block hover:bg-gray-700 p-2 rounded"
            >
              Consumers
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/users" className="block hover:bg-gray-700 p-2 rounded">
              Users
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-700">
        <Header />
      </div>
    </aside>
  );
};
