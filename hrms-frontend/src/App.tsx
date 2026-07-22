import React, { useEffect } from 'react';
import { BrowserRouter }    from 'react-router-dom';
import { Provider }         from 'react-redux';
import { ConfigProvider }   from 'antd';
import { store }            from './store/store';
import AppRoutes            from './routes/AppRoutes';
import { useDispatch }      from 'react-redux';
import { AppDispatch }      from './store/store';
import { fetchCurrentUser } from './store/slices/authSlice';
import { useAuth }          from './hooks/useAuth';
import ErrorBoundary        from './components/common/ErrorBoundary';

// ── dayjs plugins ───────────────────────────────────
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween     from 'dayjs/plugin/isBetween';
import weekday       from 'dayjs/plugin/weekday';
import localeData    from 'dayjs/plugin/localeData';
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(weekday);
dayjs.extend(localeData);
// ────────────────────────────────────────────────────

const AppContent: React.FC = () => {
  const dispatch            = useDispatch<AppDispatch>();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, []);

  return <AppRoutes />;
};

const App: React.FC = () => (
  <Provider store={store}>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary:  '#6366f1',
          borderRadius:   10,
          fontFamily:    "'Inter', -apple-system, sans-serif",
          colorBgLayout: '#f1f5f9',
        },
        components: {
          Layout: { siderBg: '#0f172a' },
          Menu: {
            darkItemBg:         'transparent',
            darkSubMenuItemBg:  'transparent',
            darkItemSelectedBg: 'rgba(99,102,241,0.2)',
          },
          Card:   { borderRadius: 16 },
          Button: { borderRadius: 10 },
          Input:  { borderRadius: 10 },
          Select: { borderRadius: 10 },
          Table:  { borderRadius: 12 },
        },
      }}
    >
      <BrowserRouter>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </BrowserRouter>
    </ConfigProvider>
  </Provider>
);

export default App;