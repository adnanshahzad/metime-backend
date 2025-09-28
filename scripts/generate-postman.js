const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function generatePostmanCollection() {
  try {
    console.log('🚀 Starting Postman collection generation...');
    
    // Wait for the server to be ready
    console.log('⏳ Waiting for server to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Fetch the OpenAPI spec from the running server
    const response = await axios.get('http://localhost:3000/api/docs-json');
    const openApiSpec = response.data;
    
    console.log('✅ OpenAPI spec fetched successfully');
    
    // Create Postman collection structure
    const postmanCollection = {
      info: {
        name: 'MeTime API',
        description: 'Production-ready NestJS API with RBAC and multi-tenancy',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        version: '1.0.0'
      },
      auth: {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{jwt_token}}',
            type: 'string'
          }
        ]
      },
      variable: [
        {
          key: 'base_url',
          value: 'http://localhost:3000',
          type: 'string'
        },
        {
          key: 'jwt_token',
          value: '',
          type: 'string'
        }
      ],
      item: []
    };
    
    // Convert OpenAPI paths to Postman requests
    const paths = openApiSpec.paths || {};
    
    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (typeof operation === 'object' && operation.operationId) {
          const request = {
            name: operation.summary || operation.operationId,
            request: {
              method: method.toUpperCase(),
              header: [],
              url: {
                raw: `{{base_url}}${path}`,
                host: ['{{base_url}}'],
                path: path.split('/').filter(p => p)
              },
              description: operation.description || ''
            },
            response: []
          };
          
          // Add authentication if required
          if (operation.security && operation.security.length > 0) {
            request.request.auth = {
              type: 'bearer',
              bearer: [
                {
                  key: 'token',
                  value: '{{jwt_token}}',
                  type: 'string'
                }
              ]
            };
          }
          
          // Add request body if present
          if (operation.requestBody && operation.requestBody.content) {
            const content = operation.requestBody.content;
            const jsonContent = content['application/json'];
            
            if (jsonContent && jsonContent.schema) {
              request.request.header.push({
                key: 'Content-Type',
                value: 'application/json'
              });
              
              // Generate example body based on schema
              const exampleBody = generateExampleFromSchema(jsonContent.schema);
              request.request.body = {
                mode: 'raw',
                raw: JSON.stringify(exampleBody, null, 2)
              };
            }
          }
          
          // Add query parameters
          if (operation.parameters) {
            const queryParams = operation.parameters.filter(param => param.in === 'query');
            if (queryParams.length > 0) {
              request.request.url.query = queryParams.map(param => ({
                key: param.name,
                value: param.example || '',
                description: param.description || ''
              }));
            }
          }
          
          // Add path parameters
          if (operation.parameters) {
            const pathParams = operation.parameters.filter(param => param.in === 'path');
            if (pathParams.length > 0) {
              pathParams.forEach(param => {
                const pathSegments = request.request.url.path;
                const paramIndex = pathSegments.findIndex(segment => segment === `{${param.name}}`);
                if (paramIndex !== -1) {
                  pathSegments[paramIndex] = param.example || `{{${param.name}}}`;
                }
              });
            }
          }
          
          // Group requests by tags
          const tags = operation.tags || ['default'];
          const tag = tags[0];
          
          let folder = postmanCollection.item.find(item => item.name === tag);
          if (!folder) {
            folder = {
              name: tag,
              item: []
            };
            postmanCollection.item.push(folder);
          }
          
          folder.item.push(request);
        }
      }
    }
    
    // Create the output directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'postman');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the collection to file
    const outputPath = path.join(outputDir, 'MeTime-API.postman_collection.json');
    fs.writeFileSync(outputPath, JSON.stringify(postmanCollection, null, 2));
    
    console.log(`✅ Postman collection generated successfully at: ${outputPath}`);
    console.log('📋 Collection includes:');
    console.log('   - All API endpoints with proper authentication');
    console.log('   - Example request bodies');
    console.log('   - Environment variables for base URL and JWT token');
    console.log('   - Organized by API tags');
    
  } catch (error) {
    console.error('❌ Error generating Postman collection:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on http://localhost:3000');
      console.log('   Run: npm run start:dev');
    }
    process.exit(1);
  }
}

function generateExampleFromSchema(schema) {
  if (!schema) return {};
  
  const example = {};
  
  if (schema.properties) {
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (prop.example !== undefined) {
        example[key] = prop.example;
      } else if (prop.type === 'string') {
        if (prop.format === 'email') {
          example[key] = 'user@example.com';
        } else if (prop.enum) {
          example[key] = prop.enum[0];
        } else {
          example[key] = 'example string';
        }
      } else if (prop.type === 'number' || prop.type === 'integer') {
        example[key] = 1;
      } else if (prop.type === 'boolean') {
        example[key] = true;
      } else if (prop.type === 'array') {
        example[key] = [];
      } else if (prop.type === 'object') {
        example[key] = generateExampleFromSchema(prop);
      }
    }
  }
  
  return example;
}

// Run the script
generatePostmanCollection();
