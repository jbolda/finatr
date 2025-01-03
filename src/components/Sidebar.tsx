import {
  ArrowRightLeft,
  Banknote,
  ChartColumnIncreasing,
  HandCoins,
  Landmark,
  Menu as MenuIcon,
  Presentation,
  SettingsIcon,
  TrendingUp
} from 'lucide-react';
import React from 'react';
import {
  Link,
  Menu,
  Button,
  MenuItem,
  MenuTrigger,
  Popover,
  MenuSection,
  Header,
  Collection
} from 'react-aria-components';
import { useSelector } from 'starfx/react';
import { tv } from 'tailwind-variants';

import { schema } from '../store/schema';

type NavItem = {
  name: string;
  to: string;
  icon: typeof Presentation;
  tag?: string;
};

const navigation: NavItem[] = [
  { name: 'Examples', to: '/examples', icon: Presentation },
  { name: 'Import/Export', to: '/import', icon: ArrowRightLeft },
  { name: 'Accounts', to: '/accounts', icon: Landmark },
  { name: 'Transactions', to: '/transactions', icon: HandCoins },
  { name: 'FI', to: '/financialindependence', icon: TrendingUp },
  { name: 'Taxes', tag: 'alpha', to: '/taxes', icon: Banknote }
];

const graphs: NavItem[] = [
  { name: 'Planning', to: '/planning', icon: MenuIcon },
  { name: 'Cash Flow', to: '/flow', icon: MenuIcon }
];

let fullNavigation = [
  {
    name: 'Records',
    id: 'records',
    children: navigation
  },
  {
    name: 'Graphs',
    id: 'graphs',
    children: graphs
  }
];
/* for using fullNavatiion, swap to this
                <Menu
                  className="outline-none"
                  aria-label="navigation popover"
                  selectionMode="single"
                  items={fullNavigation}
                  selectedKeys={[location.pathname]}
                >
                  {(section) => (
                    <MenuSection>
                      <Header className="text-xs/6 font-bold text-gray-400 mt-3">
                        {section.name}
                      </Header>
                      <Collection items={section.children}>
                        {(item) => (
                          <MenuItem
                            id={item.to}
                            href={item.to}
                            aria-label={item.name}
                            className={() =>
                              sidebarItem({
                                link:
                                  location.pathname === item.to
                                    ? 'selected'
                                    : 'default'
                              })
                            }
                          >
                            <span className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent">
                              {item.name}{' '}
                              {item?.tag ? <sup>{item.tag}</sup> : null}
                            </span>
                          </MenuItem>
                        )}
                      </Collection>
                    </MenuSection>
                  )}
                </Menu> */

/*
  This requires the follow classes in index.html

  ```
  <html class="h-full bg-white">
  <body class="h-full">
  ```
*/
export default function Sidebar() {
  const settings = useSelector(schema.settings.select);

  return (
    <>
      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-56 lg:flex-col">
        <SidebarContent withHeader={true} />
      </div>

      {/* Mobile menu */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <MenuTrigger>
          <Button
            aria-label="Menu"
            className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="size-6" aria-hidden="true" />
          </Button>
          <Popover
            className="relative z-50 lg:hidden transition-all duration-300 ease-linear"
            crossOffset={-100}
            containerPadding={0}
          >
            {/* visual shading */}
            <div className="pointer-events-none fixed -z-40 inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0" />
            <SidebarContent withHeader={false} />
          </Popover>
        </MenuTrigger>
        <Link href="/" className="flex-1 text-sm/6 font-semibold text-white">
          Finatr
        </Link>
        <Link
          href="/settings"
          className={() =>
            `flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-white ${location.pathname === '/settings' ? 'bg-gray-800' : 'hover:bg-gray-800'}`
          }
        >
          <SettingsIcon />
        </Link>
      </div>
    </>
  );
}

function SidebarContent({ withHeader = true }: { withHeader: boolean }) {
  const settings = useSelector(schema.settings.select);
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6">
      {withHeader ? (
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/">
            <span className="sr-only">Home</span>
            <ChartColumnIncreasing color="white" className="h-8 w-auto" />
          </Link>
          <div className="flex-1 text-sm/6 font-semibold text-white pl-3">
            Finatr
          </div>
        </div>
      ) : null}
      <nav className="flex flex-1 flex-col py-1">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <Menu
              className="-mx-2 space-y-1"
              selectionMode="single"
              aria-label="navigation"
              items={navigation.filter(
                (item) => settings[item.to.substring(1)] !== false
              )}
              selectedKeys={[location.pathname]}
            >
              {(item) => (
                <MenuItem
                  id={item.to}
                  href={item.to}
                  aria-label={item.name}
                  className={() =>
                    sidebarItem({
                      link:
                        location.pathname === item.to ? 'selected' : 'default'
                    })
                  }
                >
                  <item.icon aria-hidden="true" className="size-6 shrink-0" />
                  {item.name}
                  {item?.tag ? <sup>{item.tag}</sup> : null}
                </MenuItem>
              )}
            </Menu>
          </li>
          <li>
            <div className="text-xs/6 font-semibold text-gray-400">Graphs</div>
            <Menu
              className="-mx-2 mt-2 space-y-1"
              selectionMode="single"
              aria-label="graphs"
              items={graphs.filter(
                (item) => settings[item.to.substring(1)] !== false
              )}
              selectedKeys={[location.pathname]}
            >
              {(graph) => (
                <MenuItem
                  id={graph.to}
                  href={graph.to}
                  aria-label={graph.name}
                  className={() =>
                    sidebarItem({
                      link:
                        location.pathname === graph.to ? 'selected' : 'default'
                    })
                  }
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                    {graph.name.substring(0, 1)}
                  </span>
                  <span className="truncate">{graph.name}</span>
                </MenuItem>
              )}
            </Menu>
          </li>
          <li className="-mx-6 mt-auto">
            <Link
              href="/settings"
              className={() =>
                `flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-white ${location.pathname === '/settings' ? 'bg-gray-800' : 'hover:bg-gray-800'}`
              }
            >
              <SettingsIcon />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

const sidebarItem = tv({
  base: 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
  variants: {
    link: {
      default: 'text-gray-400 hover:bg-gray-800 hover:text-white',
      selected: 'bg-gray-800 text-white'
    }
  }
});
