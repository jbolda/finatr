import React from 'react';

const HeaderRow = ({ items, columns }) => (
  <tr className="divide-x hidden 2xl:table-row">
    {items.map((item) => (
      <th
        scope="col"
        className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
        key={item}
      >
        {item}
      </th>
    ))}
  </tr>
);

const DataRow = ({ items, columns, itemKey, itemHeaders }) => (
  <tr key={itemKey} className="divide-x">
    {items.map((item, index) => (
      <td
        key={`${itemKey}=${index}`}
        className="px-5 py-1 2xl:py-4 whitespace-nowrap block 2xl:table-cell"
      >
        <span className="2xl:hidden">{`${itemHeaders[index]}: `}</span>
        <span>{item}</span>
      </td>
    ))}
  </tr>
);

export { HeaderRow, DataRow };

export const FlexTable = ({ itemHeaders, itemData }) => (
  <div className="flex flex-col">
    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-left">
              <HeaderRow columns={itemHeaders.length} items={itemHeaders} />
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {itemData.map((items) => (
                <DataRow
                  key={items.key}
                  itemKey={items.key}
                  columns={itemHeaders.length}
                  itemHeaders={itemHeaders}
                  items={items.data}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
