export async function updateFile(repo,path,newCode,sha,token){

await fetch(
`https://api.github.com/repos/${repo}/contents/${path}`,
{
method:"PUT",
headers:{
Authorization:`token ${token}`,
"Content-Type":"application/json"
},
body:JSON.stringify({
message:"AI agent update",
content:Buffer.from(newCode).toString("base64"),
sha
})
}
)

}
