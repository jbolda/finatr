import React from 'react';
import { NavLink } from 'react-router-dom';
import { MenuIcon, XIcon } from '@heroicons/react/outline';

import { Disclosure } from '@headlessui/react';

const navigation = [
  { name: 'Home', to: '/', end: true },
  { name: 'Examples', to: 'examples' },
  { name: 'Cash Flow', to: 'flow' },
  { name: 'Accounts (Cash Flow Breakdown)', to: 'accounts' },
  { name: 'Planning', to: 'planning' },
  { name: 'Import (Bring Data In, Take It Out)', to: 'import' },
  { name: 'Taxes (in alpha)', to: 'taxes' }
];

export const Header = () => {
  return (
    <Disclosure
      as="nav"
      className="bg-gray-50 shadow-sm"
      data-tauri-drag-region="true"
    >
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                {/* for a logo whenever we reach that point 
                  <div className="flex-shrink-0 flex items-center">
                    <img
                      className="block lg:hidden h-8 w-auto"
                      src=""
                      alt="finatr"
                    />
                    <img
                      className="hidden lg:block h-8 w-auto"
                      src=""
                      alt="finatr"
                    />
                  </div> */}
                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      activeClassName="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-indigo-500 text-gray-900"
                      className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      end={item.end}
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  activeClassName="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-indigo-500 text-gray-900"
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  end={item.end}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};
