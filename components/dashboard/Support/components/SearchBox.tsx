import React from 'react';

export default function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="search-box-container">
      <input type="text" placeholder="Search" value={value} onChange={(e) => onChange(e.target.value)} />
      <button type="button" className="search-icon" aria-label="Search">
        {/* <SearchIcon /> */}
         <svg
            viewBox="0 0 24 24"
            width={20}
            height={20}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
      </button>
    </div>
  );
}