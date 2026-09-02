import { Navbar, Tab, Tabs } from '@blueprintjs/core';
import { useState } from 'react';

import { useGroupsFile } from './hooks/useGroupsFile.ts';
import { GroupsPage } from './pages/GroupsPage.tsx';
import { JsonPage } from './pages/JsonPage.tsx';
import { MfParserPage } from './pages/MfParserPage.tsx';

/**
 * Local playground to browse and edit the chemical groups.
 * @returns The navbar and the page selected by its tab.
 */
export function App() {
  const [tab, setTab] = useState<string>('groups');
  const file = useGroupsFile();
  return (
    <div className="app">
      <Navbar>
        <Navbar.Group>
          <Navbar.Heading>chemical-groups dev</Navbar.Heading>
          <Navbar.Divider />
          <Tabs
            id="pages"
            size="large"
            selectedTabId={tab}
            onChange={(newTab) => setTab(String(newTab))}
          >
            <Tab id="groups" title="Chemical groups" />
            <Tab id="json" title="JSON" />
            <Tab id="mf" title="MF parser" />
          </Tabs>
        </Navbar.Group>
      </Navbar>
      {tab === 'groups' ? <GroupsPage file={file} /> : null}
      {tab === 'json' ? <JsonPage file={file} /> : null}
      {tab === 'mf' ? <MfParserPage /> : null}
    </div>
  );
}
