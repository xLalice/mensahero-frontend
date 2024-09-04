import React from 'react';

interface TabsProps {
  selectedTab: 'chats' | 'users';
  onSelectTab: (tab: 'chats' | 'users') => void;
}

const Tabs: React.FC<TabsProps> = ({ selectedTab, onSelectTab }) => {
  return (
    <div className="flex border-b border-gray-200 mb-4">
      <button
        className={`py-2 px-4 ${selectedTab === 'chats' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-600'}`}
        onClick={() => onSelectTab('chats')}
      >
        Chats
      </button>
      <button
        className={`py-2 px-4 ${selectedTab === 'users' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-600'}`}
        onClick={() => onSelectTab('users')}
      >
        Users
      </button>
    </div>
  );
};

export default Tabs;