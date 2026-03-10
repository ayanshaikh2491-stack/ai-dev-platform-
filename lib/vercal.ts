// lib/vercel.js

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_ORG_ID = process.env.VERCEL_ORG_ID;

export async function createDeployment(projectName, files) {
  try {
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        files: files.reduce((acc, file) => {
          acc[file.name] = {
            file: file.name,
            data: file.content,
          };
          return acc;
        }, {}),
        projectSettings: {
          framework: 'nextjs',
        },
        ...(VERCEL_ORG_ID && { teamId: VERCEL_ORG_ID }),
      }),
    });

    const data = await response.json();
    
    return {
      success: response.ok,
      url: data.url,
      deploymentId: data.id,
      error: data.message,
    };
  } catch (error) {
    console.error('Vercel deployment error:', error);
    return {
      success: false,
      url: null,
      deploymentId: null,
      error: error.message || 'Unknown error',
    };
  }
}
