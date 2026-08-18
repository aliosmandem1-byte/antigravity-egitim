const token = "39506df5-0c2b-47e1-8952-329994d68c89";
const query = `
  query {
    projects {
      edges {
        node {
          name
          environments {
            edges {
              node {
                name
                deployments {
                  edges {
                    node {
                      id
                      status
                      createdAt
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

fetch("https://backboard.railway.app/graphql/v2", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({ query })
})
.then(res => res.json())
.then(data => {
  const projects = data.data.projects.edges;
  projects.forEach(p => {
    p.node.environments.edges.forEach(e => {
      const deploys = e.node.deployments.edges;
      if (deploys.length > 0) {
        deploys.slice(0, 5).forEach((d, i) => {
          console.log(`Deploy ID: ${d.node.id} | Status: ${d.node.status} | Time: ${d.node.createdAt}`);
        });
      }
    });
  });
})
.catch(err => console.error("API Hatası:", err));
