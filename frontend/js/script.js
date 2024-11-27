const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const userNameInput = document.getElementById("userNameInput");
const passwordInput = document.getElementById("passwordInput");
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");
const userCountElement = document.querySelector(".user-count");
const logoutButton = document.querySelector(".logout-button");
const adminButton = document.querySelector(".admin-button"); // Botão para CONTROLE DE RECEPÇÃO

const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
];

const user = { id: "", name: "", color: "", isAdmin: false };

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

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
};

const processMessage = ({ data }) => {
    const message = JSON.parse(data);

    // Se a mensagem for sobre a quantidade de usuários online
    if (message.type === "userCount") {
        const count = message.count;
        userCountElement.textContent = `Pessoas online: ${count}`;
    } else {
        // Lida com outras mensagens
        const { userId, userName, userColor, content } = message;
        const messageElement =
            userId === user.id
                ? createMessageSelfElement(content)
                : createMessageOtherElement(content, userName, userColor);

        chatMessages.appendChild(messageElement);
        scrollScreen();
    }
};

// Função para restaurar a sessão do usuário
const restoreSession = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser) {
        // Se houver dados salvos, restaura a sessão
        user.id = storedUser.id;
        user.name = storedUser.name;
        user.color = storedUser.color;
        user.isAdmin = storedUser.isAdmin;

        login.style.display = "none";
        chat.style.display = "flex";

        websocket = new WebSocket("ws://localhost:8080");
        websocket.onmessage = processMessage;

        userCountElement.textContent = `Pessoas online: 0`; // Isso será atualizado pelo servidor
        carregarMensagensDoLocalStorage();
    } else {
        login.style.display = "block";
        chat.style.display = "none";
    }
};

// Função de login
const handleLogin = (event) => {
    event.preventDefault();

    const userName = userNameInput.value.trim();
    const password = passwordInput.value.trim();

    if (userName === "CONTROLE DE RECEPÇÃO" && password === "CCP2024") {
        user.isAdmin = true;
        user.name = "CONTROLE DE RECEPÇÃO";
    } else if (userName !== "CONTROLE DE RECEPÇÃO" && password === "TURMA@B") {
        user.isAdmin = false;
        user.name = userName;
    } else {
        alert("Senha incorreta ou nome não encontrado!");
        return;
    }

    user.id = crypto.randomUUID();
    user.color = getRandomColor();

    // Salva as informações do usuário no localStorage
    localStorage.setItem("user", JSON.stringify(user));

    login.style.display = "none";
    chat.style.display = "flex";

    websocket = new WebSocket("ws://localhost:8080");
    websocket.onmessage = processMessage;

    carregarMensagensDoLocalStorage();
};

// Função para preencher automaticamente o nome de usuário com "CONTROLE DE RECEPÇÃO" ao clicar no botão
const setAdminUser = () => {
    userNameInput.value = "CONTROLE DE RECEPÇÃO";
};

// Função para enviar uma mensagem
const sendMessage = (event) => {
    event.preventDefault();

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    };

    websocket.send(JSON.stringify(message));
    salvarMensagemNoLocalStorage(message);
    chatInput.value = "";
};

// Função de logout
const logout = () => {
    websocket.close();  // Fecha a conexão WebSocket
    login.style.display = "block";  // Mostra a tela de login
    chat.style.display = "none";  // Oculta o chat
    user.id = "";  // Limpa os dados do usuário
    user.name = "";
    user.color = "";
    user.isAdmin = false;

    // Limpa os dados do usuário no localStorage
    localStorage.removeItem("user");

    userNameInput.value = "";
    passwordInput.value = "";
    userCountElement.textContent = "Pessoas online: 0";  // Reseta o contador de online
};

const carregarMensagensDoLocalStorage = () => {
    const mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];
    mensagens.forEach((mensagem) => {
        const { userId, userName, userColor, content } = mensagem;
        const message =
            userId === user.id
                ? createMessageSelfElement(content)
                : createMessageOtherElement(content, userName, userColor);

        chatMessages.appendChild(message);
    });
    scrollScreen();
};

const salvarMensagemNoLocalStorage = (mensagem) => {
    let mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];
    mensagens.push(mensagem);
    localStorage.setItem("mensagens", JSON.stringify(mensagens));
};

// Restaura a sessão quando a página é carregada
window.onload = restoreSession;

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
logoutButton.addEventListener("click", logout);
adminButton.addEventListener("click", setAdminUser);  // Adiciona evento ao botão "CONTROLE DE RECEPÇÃO"
