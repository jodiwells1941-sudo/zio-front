import React from 'react';
import SearchBox from './SearchBox';

export default function SupportIntro({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (v: string) => void;
}) {
  return (
    <div className="support-content">
      <h2>Hello, How can we help you?</h2>

      <SearchBox value={search} onChange={setSearch} />

      <p className="helper-text">Or choose a category to quickly find the help you need</p>
    </div>
  );
}