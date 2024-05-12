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
import { useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

const navigation = [
  { name: 'Home', to: '/' },
  { name: 'Examples', to: '/examples' },
  { name: 'Accounts', to: '/accounts' },
  { name: 'Transactions', to: '/transactions' },
  { name: 'Planning', to: '/planning' },
  { name: 'Cash Flow', to: '/flow' },
  { name: 'FI', to: '/financialindependence' },
  { name: 'Import/Export', to: '/import' },
  { name: 'Taxes', tag: 'alpha', to: '/taxes' },
  { name: 'Settings', to: '/settings' }
];

function renderMenuItem(
  item: (typeof navigation)[0],
  css: { default: string; selected: string }
) {
  return (
    <MenuItem
      id={item.to}
      href={item.to}
      aria-label={item.name}
      className={({ isSelected }) =>
        twMerge(
          'group flex w-full items-center rounded-md px-3 py-2 box-border outline-none cursor-pointer',
          isSelected ? css.selected : css.default
        )
      }
    >
      <span className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent">
        {item.name} {item?.tag ? <sup>{item.tag}</sup> : null}
      </span>
    </MenuItem>
  );
}

export const Header = ({ settings }) => {
  let location = useLocation();
  return (
    <nav className="bg-gradient-to-r to-gray-800 from-cyan-700 pb-36">
      <div className="mx-auto container py-3 px-4 sm:px-6 lg:px-8">
        <div className="lg:flex hidden justify-start h-12">
          <Menu
            className="sm:-my-px md:flex"
            selectionMode="single"
            items={navigation.filter(
              (item) => settings[item.to.substring(1)] !== false
            )}
            selectedKeys={[location.pathname]}
          >
            {(item) =>
              renderMenuItem(item, {
                default:
                  'text-gray-300 hover:bg-gray-700 hover:text-white focus:text-gray-700 focus:border-gray-300 focus:bg-cyan-100',
                selected:
                  'text-gray-300 bg-cyan-600 hover:bg-gray-700 hover:text-white'
              })
            }
          </Menu>
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
            <Menu
              className="outline-none"
              aria-label="navigation popover"
              selectionMode="single"
              items={navigation.filter(
                (item) => settings[item.to.substring(1)] !== false
              )}
              selectedKeys={[location.pathname]}
            >
              {(item) =>
                renderMenuItem(item, {
                  default:
                    'text-gray-500 focus:text-gray-700 focus:border-gray-300 focus:bg-cyan-100',
                  selected:
                    'text-gray-300 bg-cyan-600 hover:bg-gray-700 hover:text-white'
                })
              }
            </Menu>
          </Popover>
        </MenuTrigger>
      </div>
    </nav>
  );
};
