/**
 * tag controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::tag.tag', ({ strapi }) => ({
	/**
	 * Get tags as a tree structure
	 */
	async tree(ctx) {
		try {
			const tree = await strapi.service('api::tag.tag').buildTree();
			ctx.body = { data: tree };
		} catch (err) {
			ctx.throw(500, err);
		}
	}
}));
