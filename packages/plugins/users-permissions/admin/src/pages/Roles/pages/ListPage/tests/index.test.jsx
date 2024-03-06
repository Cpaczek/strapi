/* eslint-disable react/jsx-no-constructed-context-values */

import React from 'react';

import { ThemeProvider, lightTheme } from '@strapi/design-system';
import { render as renderRTL, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { RolesListPage } from '../index';

jest.mock('@strapi/helper-plugin', () => ({
  ...jest.requireActual('@strapi/helper-plugin'),
  useNotification: jest.fn().mockImplementation(() => jest.fn()),
  useRBAC: jest
    .fn()
    .mockImplementation(() => ({ isLoading: false, allowedActions: { canRead: true } })),
  CheckPermissions: jest.fn(({ children }) => children),
}));

const LocationDisplay = () => {
  const location = useLocation();

  return <span data-testid="location-display">{location.pathname}</span>;
};

const render = () => ({
  ...renderRTL(<RolesListPage />, {
    wrapper({ children }) {
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });

      return (
        <MemoryRouter>
          <ThemeProvider theme={lightTheme}>
            <QueryClientProvider client={client}>
              <IntlProvider locale="en" messages={{}} textComponent="span">
                {children}
                <LocationDisplay />
              </IntlProvider>
            </QueryClientProvider>
          </ThemeProvider>
        </MemoryRouter>
      );
    },
  }),
  user: userEvent.setup(),
});

describe('Roles – ListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected with headers, actions and a table', async () => {
    const { getByRole, queryByText, getByText } = render();

    await waitForElementToBeRemoved(() => queryByText('Loading content.'));

    expect(getByRole('heading', { name: 'Roles' })).toBeInTheDocument();
    expect(getByText('List of roles')).toBeInTheDocument();
    expect(getByRole('link', { name: 'Add new role' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Search' })).toBeInTheDocument();

    expect(getByRole('grid')).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'Authenticated' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'Public' })).toBeInTheDocument();
  });

  it('should direct me to the new user page when I press the add a new role button', async () => {
    const { getByRole, getByTestId, queryByText } = render();

    await waitForElementToBeRemoved(() => queryByText('Loading content.'));

    await userEvent.click(getByRole('link', { name: 'Add new role' }));

    expect(getByTestId('location-display')).toHaveTextContent('/new');
  });

  it('should direct me to the edit view of a selected role if I click the edit role button', async () => {
    const { getByRole, queryByText, getByTestId } = render();

    await waitForElementToBeRemoved(() => queryByText('Loading content.'));

    await userEvent.click(getByRole('link', { name: 'Edit Authenticated', hidden: true }));

    expect(getByTestId('location-display')).toHaveTextContent('/1');
  });
});
