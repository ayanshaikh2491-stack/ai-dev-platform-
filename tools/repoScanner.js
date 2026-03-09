export async function scanRepo(repo,token){

const res = await fetch(
`https://api.github.com/repos/${repo}/git/trees/main?recursive=1`,
{
headers:{Authorization:`token ${token}`}
})

const data = await res.json()

return data.tree
.filter(f=>f.type==="blob")
.map(f=>f.path)

}
