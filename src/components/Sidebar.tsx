import {
  ArrowLeftToLine,
  ArrowRightLeft,
  ArrowRightToLine,
  Banknote,
  ChartColumnIncreasing,
  ChartColumnStacked,
  HandCoins,
  Landmark,
  Menu as MenuIcon,
  NotebookText,
  Presentation,
  SettingsIcon,
  TrendingUp
} from 'lucide-react';
import React, { createContext, useContext } from 'react';
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
  { name: 'Planning', to: '/planning', icon: NotebookText },
  { name: 'Cash Flow', to: '/flow', icon: ChartColumnStacked }
];

const sidebarCollapse = tv({
  base: 'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col',
  variants: {
    sidebar: { wide: 'lg:w-56', collapsed: 'lg:w-16' }
  }
});

export const SidebarContext = createContext<{
  sidebar: 'wide' | 'collapsed';
  setSidebar: React.Dispatch<React.SetStateAction<'wide' | 'collapsed'>>;
}>({
  sidebar: 'wide',
  setSidebar: () => {}
});

/*
  This requires the follow classes in index.html

  ```
  <html class="h-full bg-white">
  <body class="h-full">
  ```
*/
export default function Sidebar() {
  const { sidebar } = useContext(SidebarContext);
  return (
    <>
      {/* Static sidebar for desktop */}
      <div className={sidebarCollapse({ sidebar })}>
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
            <SidebarContent withHeader={false} forceSidebarState="wide" />
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

const sidebarItem = tv({
  base: 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
  variants: {
    link: {
      default: 'text-gray-400 hover:bg-gray-800 hover:text-white',
      selected: 'bg-gray-800 text-white'
    }
  }
});

function SidebarContent({
  withHeader = true,
  forceSidebarState
}: {
  withHeader: boolean;
  forceSidebarState?: 'wide' | 'collapsed';
}) {
  const { sidebar, setSidebar } = useContext(SidebarContext);
  const sidebarWidth = forceSidebarState ?? sidebar;
  const settings = useSelector(schema.settings.select);
  const fullNavigation = [
    {
      name: null,
      id: 'records',
      children: navigation.filter(
        (item) => (settings as Record<string, boolean>)[item.to.substring(1)]
      )
    },
    {
      name: 'Graphs',
      id: 'graphs',
      children: graphs.filter(
        (item) => (settings as Record<string, boolean>)[item.to.substring(1)]
      )
    }
  ];

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto overflow-x-hidden bg-gray-900 pl-5">
      {withHeader ? (
        <div className="flex h-16 shrink-0 items-center">
          {sidebarWidth === 'wide' ? (
            <>
              <Link href="/">
                <span className="sr-only">Home</span>
                <ChartColumnIncreasing color="white" className="h-8 w-auto" />
              </Link>
              <div className="flex-1 text-sm/6 font-semibold text-white pl-3">
                Finatr
              </div>
            </>
          ) : null}
          {!forceSidebarState ? (
            <Button
              className="pr-1 text-white bg-gray-900"
              onPress={() =>
                setSidebar((state) => (state === 'wide' ? 'collapsed' : 'wide'))
              }
            >
              {sidebarWidth === 'wide' ? (
                <ArrowLeftToLine />
              ) : (
                <ArrowRightToLine />
              )}
            </Button>
          ) : null}
        </div>
      ) : null}
      <nav className="flex flex-1 flex-col py-1">
        <Menu
          className="-mx-2 space-y-1"
          selectionMode="single"
          aria-label="navigation"
          items={fullNavigation ?? settings}
          selectedKeys={[location.pathname]}
          dependencies={[sidebarWidth]}
        >
          {(section) => (
            <MenuSection>
              {section?.name ? (
                <Header className="text-xs/6 font-semibold text-gray-400">
                  {section.name}
                </Header>
              ) : null}
              <Collection items={section.children}>
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
                    {sidebarWidth === 'wide' ? item.name : null}
                    {sidebarWidth === 'wide' && item?.tag ? (
                      <sup>{item.tag}</sup>
                    ) : null}
                  </MenuItem>
                )}
              </Collection>
            </MenuSection>
          )}
        </Menu>

        <div className="-mx-6 mt-auto">
          <Link
            href="/settings"
            className={() =>
              `flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-white ${location.pathname === '/settings' ? 'bg-gray-800' : 'hover:bg-gray-800'}`
            }
          >
            <SettingsIcon />
            {sidebarWidth === 'wide' ? <span>Settings</span> : null}
          </Link>
        </div>
      </nav>
    </div>
  );
}
