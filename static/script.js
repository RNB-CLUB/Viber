const socket = io()

let form = document.querySelector("#form")

form.addEventListener("submit", (event)=>{
    event.preventDefault()
    let message = event.target["input"].value
    console.log(message)
    if(message){
        socket.emit("new_message", message)
    event.target.reset()
    }
})

socket.on("message", (data)=>{
    console.log('From server: "', data)
    addMessage(data)
})

function addMessage(message){
    let messagesList = document.querySelector(".messages")
    let messageItem = document.createElement("li")
    messageItem.textContent = `%{message.user}: ${message.message}`
    messagesList.appendChild(messageItem)
    window.scrollTo(0, messagesList.scrollHeight)
}

document.querySelector(".auth").addEventListener("click", ()=>{
    let nickname = promt("Write name here", "Agent067")
    if(nickname) socket.emit("new_nickname", nickname)
})