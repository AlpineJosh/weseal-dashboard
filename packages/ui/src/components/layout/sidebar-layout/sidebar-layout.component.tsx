"use client";

import { faBars } from "@repo/pro-light-svg-icons";

import { Button, Icon, Menu } from "../../element";
import { Dialog } from "../../utility";

// import React, { useState } from "react";

// function MobileSidebar({ open, close, children }: React.PropsWithChildren<{ open: boolean; close: () => void }>) {
//   return (
//     <Dialog.Content isOpen={open} onOpenChange={(open) => {
//       if (!open) {
//         close();
//           }
//         }}
//       >

//         <Dialog.Content
//           transition
//           className="fixed inset-0 bg-black/30 transition data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
//       />
//       <Headless.DialogPanel
//         transition
//         className="fixed inset-y-0 w-full max-w-80 p-2 transition duration-300 ease-in-out data-[closed]:-translate-x-full"
//       >
//         <div className="flex h-full flex-col rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
//           <div className="-mb-3 px-4 pt-3">
//             <Headless.CloseButton as={NavbarItem} aria-label="Close navigation">
//               <CloseMenuIcon />
//             </Headless.CloseButton>
//           </div>
//           {children}
//         </div>
//       </Headless.DialogPanel>
//     </Headless.Dialog>
//   )
// }

const SidebarLayout = ({
  navbar,
  sidebar,
  children,
}: React.PropsWithChildren<{
  navbar: React.ReactNode;
  sidebar: React.ReactNode;
}>) => {
  // const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="relative isolate flex min-h-svh w-full bg-background max-lg:flex-col lg:bg-background-muted">
      <div className="fixed inset-y-0 left-0 w-64 max-lg:hidden">{sidebar}</div>

      {/* Sidebar on mobile */}
      {/* <MobileSidebar open={showSidebar} close={() => setShowSidebar(false)}>
        {sidebar}
      </MobileSidebar> */}

      {/* Navbar on mobile */}
      <header className="flex items-center bg-primary p-2 text-background lg:hidden">
        <Dialog.Trigger>
          <Button variant="plain">
            <Icon icon={faBars} className="size-6" />
          </Button>
        </Dialog.Trigger>
        <Button variant="input" className="grow">
          Search
        </Button>
        <Menu>
          <Button variant="plain">
            <Icon icon={faBars} />
          </Button>
          <Menu.Items>
            <Menu.Item>Sign Out</Menu.Item>
          </Menu.Items>
        </Menu>
        <div className="py-2.5">
          {/* <NavbarItem
            onClick={() => setShowSidebar(true)}
            aria-label="Open navigation"
          >
            <OpenMenuIcon />
          </NavbarItem> */}
        </div>
        {/* <div className="min-w-0 flex-1">{navbar}</div> */}
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col pb-2 lg:min-w-0 lg:pl-64 lg:pr-2 lg:pt-2">
        <div className="grow p-6 lg:rounded-lg lg:bg-background lg:p-10 lg:shadow-sm lg:ring-1 lg:ring-content/5">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </main>
    </div>
  );
};

export { SidebarLayout };
