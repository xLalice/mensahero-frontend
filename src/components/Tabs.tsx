import React from 'react';

interface TabsProps {
  selectedTab: 'chats' | 'friends';
  onSelectTab: (tab: 'chats' | 'friends') => void;
}

const Tabs: React.FC<TabsProps> = ({ selectedTab, onSelectTab }) => {
  return (
    <div className="flex border-b border-gray-200 mb-4 w-full">
      <button
        className={`py-2 px-4 flex-grow text-center md:text-left ${
          selectedTab === 'chats'
            ? 'border-b-2 border-[var(--primary-color)] font-bold'
            : 'text-gray-600'
        }`}
        onClick={() => onSelectTab('chats')}
      >
        Chats
      </button>
      <button
        className={`py-2 px-4 flex-grow text-center md:text-left ${
          selectedTab === 'friends'
            ? 'border-b-2 border-[var(--primary-color)] font-bold'
            : 'text-gray-600'
        }`}
        onClick={() => onSelectTab('friends')}
      >
        Friends
      </button>
    </div>
  );
};

export default Tabs;
