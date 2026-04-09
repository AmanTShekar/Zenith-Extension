import React from 'react';

export function List() {
  const items = ['one', 'two'];
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i} data-zenith-id="src/test-patch.tsx:8:8">
          {item}
        </li>
      ))}
      <div data-zenith-id="src/test-patch.tsx:12:6">
        Static Item
      </div>
    </ul>
  );
}
