import React from 'react';
import { NavLink } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { MenuIcon, XIcon } from '@heroicons/react/outline';

import { Disclosure } from '@headlessui/react';

const navigation = [
  { name: 'Home', to: '/', end: true },
  { name: 'Examples', to: 'examples' },
  { name: 'Accounts', to: 'accounts' },
  { name: 'Transactions', to: 'transactions' },
  { name: 'Planning', to: 'planning' },
  { name: 'Cash Flow', to: 'flow' },
  { name: 'Import/Export', to: 'import' },
  { name: 'Taxes (in alpha)', to: 'taxes' },
  { name: 'Settings', to: 'settings' }
];

export const Header = ({ settings }) => {
  return (
    <Disclosure as="nav" data-tauri-drag-region="true">
      {({ open }) => (
        <div className="bg-gray-800 pb-36">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-start h-12">
              <div className="flex justify-items-start">
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
                <div className="hidden sm:-my-px sm:flex">
                  {navigation
                    .filter((item) => settings[item.to] !== false)
                    .map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive, isPending, isTransitioning }) =>
                          twMerge(
                            'inline-flex items-center rounded-md px-4 text-sm font-medium',
                            isActive
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          )
                        }
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
            <div className="pt-1 pb-2 space-y-1">
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
        </div>
      )}
    </Disclosure>
  );
};
