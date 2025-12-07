export default [
	'strapi::logger',
	'strapi::errors',
	{
		name: 'strapi::security',
		config: {
			contentSecurityPolicy: {
				useDefaults: true,
				directives: {
					'connect-src': ["'self'", 'https:'],
					'img-src': ["'self'", 'data:', 'blob:', `https://loremflickr.com/`],
					upgradeInsecureRequests: null
				}
			}
		}
	},
	{
		name: 'strapi::security',
		config: {
			contentSecurityPolicy: {
				useDefaults: true,
				directives: {
					'connect-src': ["'self'", 'https:'],
					'img-src': [
						"'self'",
						'data:',
						'blob:',
						'dl.airtable.com',
						'https://makszhukov.s3.eu-north-1.amazonaws.com'
					],
					'media-src': [
						"'self'",
						'data:',
						'blob:',
						'dl.airtable.com',
						'https://makszhukov.s3.eu-north-1.amazonaws.com'
					],
					upgradeInsecureRequests: null
				}
			}
		}
	},
	{
		name: 'strapi::cors',
		config: {
			enabled: true,
			origin: [
				'http://localhost:1337',
				'http://18.199.103.200',
				'https://makszhukov.s3.eu-north-1.amazonaws.com'
			],
			headers: ['Content-Type', 'Authorization', 'Origin', 'Accept']
		}
	},
	'strapi::poweredBy',
	'strapi::query',
	'strapi::body',
	'strapi::session',
	'strapi::favicon',
	'strapi::public'
];
