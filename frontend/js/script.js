// login elements
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

// chat elements
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");
const sairChatButton = document.querySelector("#sair-chat");

const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold",
];

const user = { id: "", name: "", color: "" };

let websocket;

const createMessageSelfElement = (content) => {
    const div = document.createElement("div");

    div.classList.add("message--self");
    div.innerHTML = content;

    return div;
};

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div");
    const span = document.createElement("span");

    div.classList.add("message--other");

    span.classList.add("message--sender");
    span.style.color = senderColor;

    div.appendChild(span);

    span.innerHTML = sender;
    div.innerHTML += content;

    return div;
};

const createMessageElement = (content) => {
    const div = document.createElement("div");
    div.textContent = content;
    return div;
};

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
    });
};

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data);

    const message =
        userId == user.id
            ? createMessageSelfElement(content)
            : createMessageOtherElement(content, userName, userColor);

    chatMessages.appendChild(message);

    scrollScreen();
};

const handleLogin = (event) => {
    event.preventDefault();

    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();

    login.style.display = "none";
    chat.style.display = "flex";

    websocket = new WebSocket("wss://projeto-chat-jq7k.onrender.com");
    websocket.onmessage = processMessage;
};

const sendMessage = (event) => {
    event.preventDefault();

    if (websocket && websocket.readyState === WebSocket.OPEN) {
        const message = {
            userId: user.id,
            userName: user.name,
            userColor: user.color,
            content: chatInput.value,
        };

        websocket.send(JSON.stringify(message));

        chatInput.value = "";
    } else {
        console.error("WebSocket connection is not open.");
    }
};

const sairChat = () => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
        websocket = null;
        chatMessages.innerHTML = "";
        console.log("Você saiu do chat.");

        // Limpa o estado do usuário
        user.id = "";
        user.name = "";
        user.color = "";

        // Esconde a tela de chat e mostra a tela de login
        chat.style.display = "none";
        login.style.display = "flex";
    }
};

if (sairChatButton) {
    sairChatButton.addEventListener("click", sairChat);
}

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);