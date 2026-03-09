const sessions={}

export function getSession(id){

if(!sessions[id]){
sessions[id]={history:[],repo:null}
}

return sessions[id]

}

export function saveMessage(id,msg){

sessions[id].history.push(msg)

}
