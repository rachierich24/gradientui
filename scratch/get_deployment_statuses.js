async function getDeploymentStatuses() {
  const deploymentIds = ['7490066413', '7490044766'];
  for (const id of deploymentIds) {
    console.log(`\n=== Deployment ${id} ===`);
    const res = await fetch(`https://api.github.com/repos/rachierich24/gradientui/deployments/${id}/statuses`, {
      headers: { 'User-Agent': 'curl/7.68.0' }
    });
    const statuses = await res.json();
    statuses.forEach(s => {
      console.log(`State: ${s.state} | URL: ${s.environment_url || s.target_url} | Description: ${s.description}`);
    });
  }
}

getDeploymentStatuses();

