async function checkGithub() {
  try {
    const res = await fetch('https://api.github.com/repos/rachierich24/gradientui/deployments', {
      headers: { 'User-Agent': 'curl/7.68.0' }
    });
    console.log('Deployments status:', res.status);
    if (res.status === 200) {
      const data = await res.json();
      console.log('Deployments:', JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error('Error:', e.message);
  }

  try {
    const res2 = await fetch('https://api.github.com/repos/KineticTechno/gradientui/pulls?state=all', {
      headers: { 'User-Agent': 'curl/7.68.0' }
    });
    console.log('KineticTechno pulls status:', res2.status);
    if (res2.status === 200) {
      const data = await res2.json();
      console.log('Recent PRs:');
      data.slice(0, 5).forEach(pr => {
        console.log(`  #${pr.number}: ${pr.title} (${pr.state}) - head: ${pr.head.label}`);
      });
    }
  } catch (e) {
    console.error('Error 2:', e.message);
  }
}

checkGithub();

