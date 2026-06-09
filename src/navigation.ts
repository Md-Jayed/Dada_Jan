import { Product } from './types';

export interface ParsedRoute {
  type: 'home' | 'shop' | 'tracking' | 'profile' | 'product-details' | 'login' | 'partner' | 'admin';
  productSlugOrId?: string;
}

// Generate URL slug from product name (using clean English part if available)
export function getProductSlug(product: Product): string {
  const englishPart = product.name.split(' (')[0] || product.name;
  return englishPart
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Find product by slug or id
export function findProductBySlugOrId(slugOrId: string, products: Product[]): Product | undefined {
  if (!slugOrId) return undefined;
  const lower = slugOrId.toLowerCase();
  return products.find(p => {
    if (p.id.toLowerCase() === lower) return true;
    const s = getProductSlug(p);
    return s === lower;
  });
}

// Robust parse of the current path or hash
export function parseCurrentRoute(): ParsedRoute {
  let path = window.location.pathname;
  const hash = window.location.hash;

  // Support hash fallback
  if (hash.startsWith('#/')) {
    path = hash.substring(1); // e.g. "/product/abc"
  }

  if (path === '/login') {
    return { type: 'login' };
  }
  if (path === '/partner') {
    return { type: 'partner' };
  }
  if (path === '/admin') {
    return { type: 'admin' };
  }
  if (path.startsWith('/product/')) {
    const slug = path.substring('/product/'.length);
    return { type: 'product-details', productSlugOrId: slug };
  }
  if (path === '/shop') {
    return { type: 'shop' };
  }
  if (path === '/tracking') {
    return { type: 'tracking' };
  }
  if (path === '/profile') {
    return { type: 'profile' };
  }
  return { type: 'home' };
}

// Navigate to a route and dispatch window event
export function navigateToRoute(route: ParsedRoute, replace = false) {
  let url = '/';
  if (route.type === 'login') {
    url = '/login';
  } else if (route.type === 'partner') {
    url = '/partner';
  } else if (route.type === 'admin') {
    url = '/admin';
  } else if (route.type === 'product-details' && route.productSlugOrId) {
    url = `/product/${route.productSlugOrId}`;
  } else if (route.type === 'shop') {
    url = '/shop';
  } else if (route.type === 'tracking') {
    url = '/tracking';
  } else if (route.type === 'profile') {
    url = '/profile';
  }

  try {
    if (replace) {
      window.history.replaceState({ route }, '', url);
    } else {
      window.history.pushState({ route }, '', url);
    }
  } catch (e) {
    console.error('History pushState failed', e);
  }

  // Notify active listeners
  window.dispatchEvent(new CustomEvent('routechange', { detail: { route } }));
}
