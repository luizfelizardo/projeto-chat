$(document).ready(function(){
    // set #background-* to full window height and fade in the body
    var width = $(window).width();
    var height = $(window).height();
        $('#background-container, #background-1, #background-2').css({
            'min-width': width,
            'min-height': height
        });

    // call new svg and start recreate svg timeout
    svgNew();
    recreateSvg();
});

// set global svg object
var svg = {};
// used to determine which background to draw to
var draw = 1;
// create new svg 
var svgNew = function(){
    svg.t = new Trianglify({
        noiseIntensity: 0,
    });
    // set svg size to window height and width
    svg.width = $(window).width();
    svg.height = $(window).height();
    svg.pattern = svg.t.generate(svg.width, svg.height);
    // draw svg on to either background 1 or 2
    if (draw === 1) {
        svgDraw1();
    } else {
        svgDraw2();
    }
}; // end svgNew

// draw svg on to bg1 and call fade
// if called with resize, redraw the svg to match new size and do not call fade
var svgDraw1 = function (resize){
    draw = 2;
    if (resize === 'resize') {  
        svg.pattern = svg.t.generate(svg.width, svg.height);
        $('#background-1').css({
            'min-width': svg.width,
            'min-height': svg.height,
            'background': svg.pattern.dataUrl
        });
        $('#contact-background-1').css({
            'min-width': svg.width,
            'min-height': (svg.height / 2),
            'background': svg.pattern.dataUrl
        });
    } else {
        $('.background-1').css({
            'background': svg.pattern.dataUrl
        });
        fade1();
    }
}; // end svgDraw1

// same as above but for bg2
var svgDraw2 = function(resize){
    draw = 1;
    if (resize === 'resize') {  
        svg.pattern = svg.t.generate(svg.width, svg.height);
        $('#background-2').css({
            'min-width': svg.width,
            'min-height': svg.height,
            'background': svg.pattern.dataUrl
        });
        $('#contact-background-2').css({
            'min-width': svg.width,
            'min-height': (svg.height / 2),
            'background': svg.pattern.dataUrl
        });
    } else {
        $('.background-2').css({
            'background': svg.pattern.dataUrl
        });
        fade2();
    }
}; // end svgDraw2

// fade in bg1 and fade our bg2
var fade1 = function(){
    $('.background-1').velocity("fadeIn", { duration: 3000 });
    $('.background-2').velocity("fadeOut", { duration: 4000 });
};
// fade in bg2 and fade out bg1
var fade2 = function(){
    $('.background-2').velocity("fadeIn", { duration: 3000 });
    $('.background-1').velocity("fadeOut", { duration: 4000 });
};

// timeout function to create new svg every 5 seconds
var recreateSvg = function(){
    window.setInterval(svgNew, 5000);
};

// redraw the current svg to match screen size on resize
$(window).resize(function() {
    svg.width = $(window).width();
    svg.height = $(window).height();
    $('#background-container').css({
        'min-width': svg.width,
        'min-height': svg.height
    });
    $('#contact-container').css({
        'min-width': svg.width,
        'min-height': (svg.height / 2)
    });
    svgDraw1('resize');
    svgDraw2('resize');
});


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
            : createMessageOtherElement(content, userName, userColor, userId);

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