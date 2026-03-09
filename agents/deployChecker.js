export async function checkDeploy(url){

const res = await fetch(url)

if(res.status !== 200){
return "Deploy error"
}

return "Deploy OK"

}
