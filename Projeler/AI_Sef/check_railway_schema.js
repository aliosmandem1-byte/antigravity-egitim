const token = "39506df5-0c2b-47e1-8952-329994d68c89";
const query = `
  query {
    __schema {
      queryType {
        fields {
          name
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
  console.log(JSON.stringify(data, null, 2));
})
.catch(err => console.error("API Hatası:", err));
