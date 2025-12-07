import type { StrapiApp } from '@strapi/strapi/admin';

export default {
	config: {
		locales: []
	},
	bootstrap(app: StrapiApp) {
		// Override the relation field component for tags in screenshots
		// We'll use a plugin extension approach
		// Create an extension file that Strapi will automatically pick up
		// The extension is at: src/admin/extensions/content-manager/components/RelationInput/index.tsx
		// Note: Strapi v5 automatically loads extensions from the extensions folder
		// The RelationInput component will conditionally render TagTreeSelector
		// for the tags field in screenshots
	}
};
