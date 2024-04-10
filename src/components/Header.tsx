import { MenuIcon } from '@heroicons/react/outline';
import React from 'react';
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Text
} from 'react-aria-components';
import { NavLink } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

const navigation = [
  { name: 'Home', to: '/', end: true },
  { name: 'Examples', to: 'examples' },
  { name: 'Accounts', to: 'accounts' },
  { name: 'Transactions', to: 'transactions' },
  { name: 'Planning', to: 'planning' },
  { name: 'Cash Flow', to: 'flow' },
  { name: 'FI', to: 'financialindependence' },
  { name: 'Import/Export', to: 'import' },
  { name: 'Taxes', tag: 'alpha', to: 'taxes' },
  { name: 'Settings', to: 'settings' }
];

function ActionItem({ item }: { item: (typeof navigation)[0] }) {
  return (
    <MenuItem
      id={item.to}
      className="group flex w-full items-center rounded-md px-3 py-2 box-border outline-none cursor-default text-gray-900 focus:bg-cyan-100 focus:text-white"
    >
      <NavLink
        to={item.to}
        className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        end={item.end}
      >
        {item.name} {item?.tag ? <sup>{item.tag}</sup> : null}
      </NavLink>
    </MenuItem>
  );
}

export const Header = ({ settings }) => {
  return (
    <nav className="bg-gradient-to-r to-gray-800 from-cyan-700 pb-36">
      <div className="mx-auto container py-3 px-4 sm:px-6 lg:px-8">
        <div className="lg:flex hidden justify-start h-12">
          <div className="sm:-my-px md:flex">
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
                  {item.name} {item?.tag ? <sup>{item.tag}</sup> : null}
                </NavLink>
              ))}
          </div>
        </div>
      </div>
      <div className="mx-auto container flex justify-end lg:hidden">
        <MenuTrigger>
          <Button
            aria-label="Menu"
            className="inline-flex items-center justify-center rounded-md bg-black bg-opacity-20 bg-clip-padding border border-white/20 px-3 py-2 text-white hover:bg-opacity-30 pressed:bg-opacity-40 transition-colors cursor-default outline-none focus-visible:ring-2 focus-visible:ring-white/75"
          >
            <MenuIcon className="block h-6 w-6" aria-hidden="true" />
          </Button>
          <Popover className="p-1 w-56 overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95 fill-mode-forwards origin-top-left">
            <Menu className="outline-none">
              {navigation
                .filter((item) => settings[item.to] !== false)
                .map((item) => (
                  <ActionItem key={item.to} item={item} />
                ))}
            </Menu>
          </Popover>
        </MenuTrigger>
      </div>
    </nav>
  );
};
