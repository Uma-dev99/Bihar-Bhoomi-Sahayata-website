import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import App from '../src/App';

let currentLocation;
function LocationSpy() {
  currentLocation = useLocation();
  return null;
}

/** Render the whole app at a URL. Returns the user-event instance too. */
export function renderApp(path = '/hi/') {
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <LocationSpy />
    </MemoryRouter>,
  );
  return { user, ...utils, location: () => currentLocation };
}

export function jsonResponse(status, body) {
  return Promise.resolve(
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  );
}
