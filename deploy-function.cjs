const fs = require('fs');
const path = require('path');

const functionContent = fs.readFileSync(
  path.join(__dirname, 'supabase/functions/aspect-calculator/index.ts'),
  'utf8'
);

console.log('Function content loaded. Length:', functionContent.length);
console.log('First 100 chars:', functionContent.substring(0, 100));
console.log('\nSearching for key fixes...');
console.log('Dataset aster30m:', functionContent.includes("'https://api.opentopodata.org/v1/aster30m'"));
console.log('Cliff +180:', functionContent.includes('cliffDirection.direction + 180'));
console.log('Terrain without +180:', functionContent.match(/let aspectDeg = \(90 - toDegrees\(aspectRad\)\) % 360;/) !== null);

// Output for MCP deployment
const deployPayload = {
  name: 'aspect-calculator',
  slug: 'aspect-calculator',
  verify_jwt: false,
  files: [{
    name: 'index.ts',
    content: functionContent
  }]
};

fs.writeFileSync('/tmp/deploy-payload.json', JSON.stringify(deployPayload, null, 2));
console.log('\nDeployment payload written to /tmp/deploy-payload.json');
