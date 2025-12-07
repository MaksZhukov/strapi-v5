/**
 * tag service.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::tag.tag', ({ strapi }) => ({
	/**
	 * Build a tree structure from tags
	 * @returns Promise with tree-structured tags
	 */
	async buildTree() {
		// Fetch all tags with their parents and children relations
		const tags = (await strapi.entityService.findMany('api::tag.tag', {
			populate: ['parents', 'children'] as any
		})) as any[];

		// Helper function to build tree recursively
		// Since tags can have multiple parents, we build from root tags (tags with no parents)
		const buildTreeRecursive = (parentId: string | number | null = null, visited = new Set<string | number>()) => {
			return tags
				.filter((tag: any) => {
					// Avoid infinite loops in case of circular references
					if (visited.has(tag.id)) {
						return false;
					}
					visited.add(tag.id);

					if (parentId === null) {
						// Root level: tags with no parents
						return !tag.parents || tag.parents.length === 0;
					}
					// Child level: tags that have the specified parent
					return (
						tag.parents &&
						tag.parents.length > 0 &&
						tag.parents.some((parent: any) => parent.id === parentId)
					);
				})
				.map((tag: any) => ({
					id: tag.id,
					name: tag.name,
					children: buildTreeRecursive(tag.id, new Set(visited))
				}));
		};

		return buildTreeRecursive();
	}
}));
