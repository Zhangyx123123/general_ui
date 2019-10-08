import Vue from 'vue';
import Router from 'vue-router';
import modules from '@/modules';
import manageModules from '@/manage-modules';
import ErrorPage from '@/components/layout/ErrorPage';
import Manage from '@/manage-modules/Manage';

Vue.use(Router);

const routes = [{
  path: '/error',
  name: 'error',
  component: ErrorPage,
}];
Object.keys(modules).forEach((moduleName) => {
  const pageModule = modules[moduleName];

  if (pageModule.path && pageModule.component) {
    routes.push({
      path: `/${pageModule.path}`,
      name: `${pageModule.displayNameKey}.module_name`,
      component: pageModule.component,
    });
  }

  if (!pageModule.pages) {
    return;
  }
  Object.keys(pageModule.pages).forEach((pageName) => {
    const page = pageModule.pages[pageName];
    routes.push({
      path: `/${pageModule.pages[pageName].path}`,
      component: page,
      children: page.childrenPath || [],
    });
  });
});

const pages = [];
Object.keys(manageModules).forEach((moduleName) => {
  const mod = manageModules[moduleName];
  Object.keys(mod).forEach((pageKey) => {
    const page = mod[pageKey];
    pages.push({
      path: `${page.path}`,
      name: `manage.${page.name}`,
      component: page,
    });
  });
});
routes.push({
  path: '/manage',
  name: 'manage',
  component: Manage,
  children: pages,
});

const router = new Router({
  routes,
});
export default router;
