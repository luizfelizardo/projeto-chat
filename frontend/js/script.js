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
const messages = JSON.parse(localStorage.getItem("chatMessages")) || [];

let websocket;

const createMessageSelfElement = (content) => {
    const div = document.createElement("div");
    div.classList.add("message--self", `user-${user.id}`);
    div.innerHTML = content;
    return div;
};

const createMessageOtherElement = (content, sender, senderColor, senderId) => {
    const div = document.createElement("div");
    const span = document.createElement("span");

    div.classList.add("message--other", `user-${senderId}`);

    span.classList.add("message--sender");
    span.style.color = senderColor;

    div.appendChild(span);

    span.innerHTML = sender;
    div.innerHTML += content;

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

const repaintChatMessages = () => {
    chatMessages.style.display = 'none';
    chatMessages.offsetHeight;
    chatMessages.style.display = 'flex';
}

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data);

    const message =
        userId == user.id
            ? createMessageSelfElement(content)
            : createMessageOtherElement(content, userName, userColor, userId);

    chatMessages.appendChild(message);
    messages.push({ userId, userName, userColor, content });
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    scrollScreen();
    repaintChatMessages();
};

const handleLogin = (event) => {
    event.preventDefault();

    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();

    localStorage.setItem("userName", user.name);

    login.style.display = "none";
    chat.style.display = "flex";

    websocket = new WebSocket("wss://projeto-chat-jq7k.onrender.com");

    websocket.onopen = () => {
        console.log("WebSocket connection opened");
    };

    websocket.onmessage = processMessage;

    websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    websocket.onclose = () => {
        console.log("WebSocket connection closed");
    };
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
    } else {
        console.log("WebSocket não está aberto ou não existe.");
    }

    user.id = "";
    user.name = "";
    user.color = "";

    localStorage.removeItem("userName");
    localStorage.removeItem("chatMessages");

    chat.style.display = "none";
    login.style.display = "flex";
    repaintChatMessages();
};

if (sairChatButton) {
    sairChatButton.addEventListener("click", sairChat);
}

// Verifica o localStorage apenas após o carregamento da página
document.addEventListener("DOMContentLoaded", () => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
        user.id = crypto.randomUUID();
        user.name = storedUserName;
        user.color = getRandomColor();
        login.style.display = "none";
        chat.style.display = "flex";
        websocket = new WebSocket("wss://projeto-chat-jq7k.onrender.com");
        websocket.onopen = () => {
            console.log("WebSocket connection opened");
        };
        websocket.onmessage = processMessage;
        websocket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
        websocket.onclose = () => {
            console.log("WebSocket connection closed");
        };
        messages.forEach((message) => {
            const messageElement =
                message.userId == user.id
                    ? createMessageSelfElement(message.content)
                    : createMessageOtherElement(
                          message.content,
                          message.userName,
                          message.userColor,
                          message.userId
                      );
            chatMessages.appendChild(messageElement);
        });
        scrollScreen();
        repaintChatMessages();
    }
});

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);