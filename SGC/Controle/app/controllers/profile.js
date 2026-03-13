/**
 * FUNÇÃO PRINCIPAL: Carrega os dados da sessão na tela
 */
function loadProfile() {
    const sessionData = localStorage.getItem('active_session');

    if (!sessionData) {
        // Se não houver sessão, expulsa para o login
        window.location.href = 'index.html';
        return;
    }

    const sessionDTO = JSON.parse(sessionData);

    // Injetando dados nos textos
    const usernameElem = document.getElementById('profile-username');
    const emailElem = document.getElementById('profile-email');
    const initialElem = document.getElementById('profile-avatar-initials');

    if (usernameElem) usernameElem.innerText = sessionDTO.username;
    if (emailElem) emailElem.innerText = sessionDTO.email;
    
    // Injetando inicial no Avatar
    if (initialElem && sessionDTO.username) {
        initialElem.innerText = sessionDTO.username.charAt(0).toUpperCase();
    }
}

/**
 * EDITAR NOME: Atualiza tanto a sessão ativa quanto o "banco" de usuários
 */
function editProfile() {
    const session = JSON.parse(localStorage.getItem('active_session'));
    const userDb = JSON.parse(localStorage.getItem('user_db'));

    if (!session || !userDb) return;

    const novoNome = prompt("Digite o novo nome de usuário:", session.username);

    if (novoNome && novoNome.trim() !== "") {
        // 1. Atualiza o objeto da Sessão
        session.username = novoNome;
        localStorage.setItem('active_session', JSON.stringify(session));

        // 2. Atualiza o objeto no Banco de Dados (user_db)
        userDb.username = novoNome;
        localStorage.setItem('user_db', JSON.stringify(userDb));

        alert("Nome atualizado com sucesso!");
        loadProfile(); // Atualiza a interface sem dar F5
    }
}

/**
 * ATUALIZAR SENHA: Pede a senha antiga por segurança antes de mudar
 */
function updatePassword() {
    const userDb = JSON.parse(localStorage.getItem('user_db'));

    if (!userDb) {
        alert("Erro: Cadastro não encontrado.");
        return;
    }
    
    const senhaAtual = prompt("Digite sua senha atual para confirmar:");

    if (senhaAtual === userDb.password) {
        const novaSenha = prompt("Digite a nova senha:");
        
        if (novaSenha && novaSenha.length >= 4) {
            // Atualiza apenas no banco principal (senha não costuma ir no DTO de sessão)
            userDb.password = novaSenha;
            localStorage.setItem('user_db', JSON.stringify(userDb));
            
            alert("Senha alterada com sucesso!");
        } else {
            alert("Senha inválida (mínimo 4 caracteres).");
        }
    } else {
        alert("Senha atual incorreta!");
    }
}

/**
 * LOGOUT: Limpa a sessão e volta ao início
 */
function handleLogout() {
    localStorage.removeItem('active_session');
    window.location.href = '../models/login.html';
}

// Inicialização única quando o DOM carregar
document.addEventListener('DOMContentLoaded', loadProfile);

// Função para carregar a foto ao abrir a página
function loadPhoto() {
    const userDb = JSON.parse(localStorage.getItem('user_db'));
    const imgElement = document.getElementById('profile-img');
    const initialsElement = document.getElementById('profile-avatar-initials');

    if (userDb && userDb.profilePic) {
        imgElement.src = userDb.profilePic;
        imgElement.classList.remove('hidden');
        initialsElement.classList.add('hidden');
    }
}

// Função executada quando o usuário escolhe uma imagem
function uploadPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Verificar tamanho (localStorage tem limite de ~5MB, ideal fotos < 1MB)
    if (file.size > 1024 * 1024) {
        alert("A imagem é muito grande! Escolha uma de até 1MB.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const base64Image = e.target.result;

        // 1. Salva no Banco de Dados (user_db)
        const userDb = JSON.parse(localStorage.getItem('user_db'));
        userDb.profilePic = base64Image;
        localStorage.setItem('user_db', JSON.stringify(userDb));

        // 2. Atualiza a tela imediatamente
        const imgElement = document.getElementById('profile-img');
        const initialsElement = document.getElementById('profile-avatar-initials');
        
        imgElement.src = base64Image;
        imgElement.classList.remove('hidden');
        initialsElement.classList.add('hidden');

        alert("Foto atualizada!");
    };

    reader.readAsDataURL(file); // Converte para Base64
}

// Chame loadPhoto dentro do seu DOMContentLoaded ou loadProfile
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadPhoto(); // Adicione esta linha
});