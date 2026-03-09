export async function readFile(repo,path,token){

const res = await fetch(
`https://api.github.com/repos/${repo}/contents/${path}`,
{
headers:{Authorization:`token ${token}`}
})

const data = await res.json()

return{
content:Buffer.from(data.content,"base64").toString(),
sha:data.sha
}

}
