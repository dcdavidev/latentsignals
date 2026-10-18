import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('poetries/:slug', 'routes/poetry.tsx'),
] satisfies RouteConfig;
