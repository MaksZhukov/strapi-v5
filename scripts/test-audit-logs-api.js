'use strict';

/**
 * Script to test audit logs by calling Strapi API endpoints
 * Performs operations (create/update/publish/unpublish/delete) per content type
 * For articles: 10 create, 4 update, 5 publish, 3 unpublish, 3 delete
 * For categories and authors: 12 create, 5 update, 3 delete
 *
 * Usage: node scripts/test-audit-logs-api.js [API_TOKEN]
 *
 * If no API_TOKEN is provided, the script will try to use the public API
 * (make sure public permissions are set in Users & Permissions plugin)
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:1337';
const API_TOKEN = process.argv[2] || null;

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null) {
	const url = `${API_BASE_URL}/api${endpoint}`;
	const headers = {
		'Content-Type': 'application/json'
	};

	if (API_TOKEN) {
		headers.Authorization = `Bearer ${API_TOKEN}`;
	}

	const options = {
		method,
		headers
	};

	if (data) {
		options.body = JSON.stringify(data);
	}

	const response = await fetch(url, options);

	// Handle empty responses (e.g., DELETE 204 No Content)
	if (response.status === 204 || response.status === 201) {
		return { success: true };
	}

	// Try to parse JSON, but handle empty responses
	let responseData;
	const text = await response.text();
	if (text) {
		try {
			responseData = JSON.parse(text);
		} catch {
			responseData = { message: text };
		}
	} else {
		responseData = { success: true };
	}

	if (!response.ok) {
		throw new Error(responseData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
	}

	return responseData;
}

// Generate unique test data
function generateArticleData(index) {
	return {
		data: {
			title: `Article ${index} - ${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			description: `Test article description ${index} for audit log testing`
		}
	};
}

function generateCategoryData(index) {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substr(2, 9);
	return {
		data: {
			name: `Category ${index} - ${timestamp}-${random}`,
			slug: `category-${index}-${timestamp}-${random}`,
			description: `Test category description ${index} for audit log testing`
		}
	};
}

function generateAuthorData(index) {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substr(2, 9);
	return {
		data: {
			name: `Author ${index} - ${timestamp}-${random}`,
			email: `author${index}-${timestamp}-${random}@test.com`
		}
	};
}

async function performArticleOperations() {
	console.log(`\n📝 Performing operations on Articles (create, update, publish, unpublish, delete)...`);
	const created = [];
	let createCount = 0;
	let updateCount = 0;
	let deleteCount = 0;
	let publishCount = 0;
	let unpublishCount = 0;

	// Create 10 articles
	for (let i = 1; i <= 10; i++) {
		try {
			const data = generateArticleData(i);
			const response = await apiRequest('POST', '/articles', data);
			created.push(response.data);
			createCount++;
			console.log(`  ✓ [${createCount}] Created: "${data.data.title}"`);
		} catch (error) {
			console.error(`  ✗ Error creating article ${i}:`, error.message);
		}
	}

	// Update 4 articles
	for (let i = 0; i < Math.min(4, created.length); i++) {
		try {
			const article = created[i];
			const updateData = {
				data: {
					description: `${article.attributes?.description || 'No description'} - UPDATED ${Date.now()}`
				}
			};
			await apiRequest('PUT', `/articles/${article.documentId}`, updateData);
			updateCount++;
			console.log(`  ✓ [${createCount + updateCount}] Updated: "${article.attributes?.title || 'Article'}"`);
		} catch (error) {
			console.error(`  ✗ Error updating article:`, error.message);
		}
	}

	// Publish 5 articles
	for (let i = 0; i < Math.min(5, created.length); i++) {
		try {
			const article = created[i];
			await apiRequest('POST', `/articles/${article.documentId}/actions/publish`);
			publishCount++;
			console.log(
				`  ✓ [${createCount + updateCount + publishCount}] Published: "${article.attributes?.title || 'Article'}"`
			);
		} catch (error) {
			console.error(`  ✗ Error publishing article:`, error.message);
		}
	}

	// Unpublish 3 articles
	for (let i = 0; i < Math.min(3, created.length); i++) {
		try {
			const article = created[i];
			await apiRequest('POST', `/articles/${article.documentId}/actions/unpublish`);
			unpublishCount++;
			console.log(
				`  ✓ [${createCount + updateCount + publishCount + unpublishCount}] Unpublished: "${article.attributes?.title || 'Article'}"`
			);
		} catch (error) {
			console.error(`  ✗ Error unpublishing article:`, error.message);
		}
	}

	// Delete 3 articles
	for (let i = created.length - 1; i >= Math.max(0, created.length - 3); i--) {
		try {
			const article = created[i];
			await apiRequest('DELETE', `/articles/${article.documentId}`);
			deleteCount++;
			created.splice(i, 1); // Remove from array
			console.log(
				`  ✓ [${createCount + updateCount + publishCount + unpublishCount + deleteCount}] Deleted: "${article.attributes?.title || 'Article'}"`
			);
		} catch (error) {
			console.error(`  ✗ Error deleting article:`, error.message);
		}
	}

	const totalOps = createCount + updateCount + publishCount + unpublishCount + deleteCount;
	console.log(
		`\n  📊 Articles: ${createCount} created, ${updateCount} updated, ${publishCount} published, ${unpublishCount} unpublished, ${deleteCount} deleted (Total: ${totalOps})`
	);
	return { created, createCount, updateCount, publishCount, unpublishCount, deleteCount };
}

async function performCategoryOperations() {
	console.log(`\n📁 Performing operations on Categories...`);
	const created = [];
	let createCount = 0;
	let updateCount = 0;
	let deleteCount = 0;

	// Create 12 categories
	for (let i = 1; i <= 12; i++) {
		try {
			const data = generateCategoryData(i);
			const response = await apiRequest('POST', '/categories', data);
			created.push(response.data);
			createCount++;
			console.log(`  ✓ [${createCount}] Created: "${data.data.name}"`);
		} catch (error) {
			console.error(`  ✗ Error creating category ${i}:`, error.message);
		}
	}

	// Update 5 categories
	for (let i = 0; i < Math.min(5, created.length); i++) {
		try {
			const category = created[i];
			const updateData = {
				data: {
					description: `${category.attributes?.description || 'No description'} - UPDATED ${Date.now()}`
				}
			};
			await apiRequest('PUT', `/categories/${category.documentId}`, updateData);
			updateCount++;
			console.log(`  ✓ [${createCount + updateCount}] Updated: "${category.attributes?.name || 'Category'}"`);
		} catch (error) {
			console.error(`  ✗ Error updating category:`, error.message);
		}
	}

	// Delete 3 categories
	for (let i = created.length - 1; i >= Math.max(0, created.length - 3); i--) {
		try {
			const category = created[i];
			await apiRequest('DELETE', `/categories/${category.documentId}`);
			deleteCount++;
			created.splice(i, 1); // Remove from array
			console.log(
				`  ✓ [${createCount + updateCount + deleteCount}] Deleted: "${category.attributes?.name || 'Category'}"`
			);
		} catch (error) {
			console.error(`  ✗ Error deleting category:`, error.message);
		}
	}

	console.log(
		`\n  📊 Categories: ${createCount} created, ${updateCount} updated, ${deleteCount} deleted (Total: ${createCount + updateCount + deleteCount})`
	);
	return { created, createCount, updateCount, deleteCount };
}

async function performAuthorOperations() {
	console.log(`\n👤 Performing operations on Authors...`);
	const created = [];
	let createCount = 0;
	let updateCount = 0;
	let deleteCount = 0;

	// Create 12 authors
	for (let i = 1; i <= 12; i++) {
		try {
			const data = generateAuthorData(i);
			const response = await apiRequest('POST', '/authors', data);
			created.push(response.data);
			createCount++;
			console.log(`  ✓ [${createCount}] Created: "${data.data.name}"`);
		} catch (error) {
			console.error(`  ✗ Error creating author ${i}:`, error.message);
		}
	}

	// Update 5 authors
	for (let i = 0; i < Math.min(5, created.length); i++) {
		try {
			const author = created[i];
			const updateData = {
				data: {
					email: `updated-${Date.now()}-${author.attributes?.email || author.email}`
				}
			};
			await apiRequest('PUT', `/authors/${author.documentId}`, updateData);
			updateCount++;
			console.log(`  ✓ [${createCount + updateCount}] Updated: "${author.attributes?.name || 'Author'}"`);
		} catch (error) {
			console.error(`  ✗ Error updating author:`, error.message);
		}
	}

	// Delete 3 authors
	for (let i = created.length - 1; i >= Math.max(0, created.length - 3); i--) {
		try {
			const author = created[i];
			await apiRequest('DELETE', `/authors/${author.documentId}`);
			deleteCount++;
			created.splice(i, 1); // Remove from array
			console.log(
				`  ✓ [${createCount + updateCount + deleteCount}] Deleted: "${author.attributes?.name || 'Author'}"`
			);
		} catch (error) {
			console.error(`  ✗ Error deleting author:`, error.message);
		}
	}

	console.log(
		`\n  📊 Authors: ${createCount} created, ${updateCount} updated, ${deleteCount} deleted (Total: ${createCount + updateCount + deleteCount})`
	);
	return { created, createCount, updateCount, deleteCount };
}

async function main() {
	console.log('🚀 Testing Audit Logs via API');
	console.log(`   API URL: ${API_BASE_URL}`);
	console.log(`   Using ${API_TOKEN ? 'API Token' : 'Public API (no auth)'}`);
	console.log(`   Articles: create, update, publish, unpublish, delete`);
	console.log(`   Categories & Authors: create, update, delete`);

	try {
		// Test connection
		try {
			await apiRequest('GET', '/articles?pagination[limit]=1');
		} catch {
			// Ignore if it fails, might be empty or no permissions
		}

		// Perform operations on each content type
		const articleStats = await performArticleOperations();
		const categoryStats = await performCategoryOperations();
		const authorStats = await performAuthorOperations();

		// Summary
		const totalOps =
			articleStats.createCount +
			articleStats.updateCount +
			articleStats.publishCount +
			articleStats.unpublishCount +
			articleStats.deleteCount +
			categoryStats.createCount +
			categoryStats.updateCount +
			categoryStats.deleteCount +
			authorStats.createCount +
			authorStats.updateCount +
			authorStats.deleteCount;

		console.log('\n' + '='.repeat(60));
		console.log('✅ Test completed!');
		console.log('='.repeat(60));
		console.log('\n📊 Summary:');
		console.log(
			`   Articles:   ${articleStats.createCount + articleStats.updateCount + articleStats.publishCount + articleStats.unpublishCount + articleStats.deleteCount} operations (${articleStats.createCount} create, ${articleStats.updateCount} update, ${articleStats.publishCount} publish, ${articleStats.unpublishCount} unpublish, ${articleStats.deleteCount} delete)`
		);
		console.log(
			`   Categories: ${categoryStats.createCount + categoryStats.updateCount + categoryStats.deleteCount} operations`
		);
		console.log(
			`   Authors:    ${authorStats.createCount + authorStats.updateCount + authorStats.deleteCount} operations`
		);
		console.log(`   Total:      ${totalOps} operations`);
		console.log('\n📊 Next steps:');
		console.log('   1. Go to Strapi Admin → Audit Logs');
		console.log('   2. Enable audit logging for Articles, Categories, and Authors');
		console.log('   3. View the logs in Audit Logs → Logs section');
		console.log('   4. You should see all the create, update, publish, unpublish, and delete operations logged');
	} catch (error) {
		console.error('\n❌ Error:', error.message);
		console.log('\n💡 Tips:');
		console.log('   - Make sure Strapi is running on', API_BASE_URL);
		console.log('   - Check that public permissions are enabled in Users & Permissions plugin');
		console.log('   - Or provide an API token: node scripts/test-audit-logs-api.js YOUR_TOKEN');
		process.exit(1);
	}
}

main();
