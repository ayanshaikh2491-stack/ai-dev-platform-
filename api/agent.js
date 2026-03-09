import {scanRepo} from "../tools/repoScanner.js"
import {readFile} from "../tools/fileReader.js"
import {updateFile} from "../tools/fileEditor.js"
import {plan} from "../agents/planner.js"
import {modify} from "../agents/coder.js"

export default async function handler(req,res){

const {repo,instruction}=req.body

const token = process.env.GITHUB_TOKEN

const files = await scanRepo(repo,token)

const targets = await plan(files,instruction)

for(const file of targets){

const {content,sha} = await readFile(repo,file,token)

const newCode = await modify(content,instruction)

await updateFile(repo,file,newCode,sha,token)

}

res.json({status:"repo updated"})

}
