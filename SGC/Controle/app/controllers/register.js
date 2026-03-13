// 1. Seleciona o formulário de cadastro
const registerForm = document.querySelector('form');

registerForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Impede a página de recarregar

    // 2. Captura os dados dos inputs do seu HTML refinado
    const username = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm').value;

    // 3. Validação básica (ex: senhas iguais)
    if (password !== confirmPassword) {
        alert("As senhas não coincidem!");
        return;
    }

    // 4. Cria o seu UserRegisterDTO com os dados reais
    const userRegisterDTO = {
        username: username,
        email: email,
        password: password
    };

    // 5. Salva no localStorage como seu "banco de dados"
    localStorage.setItem('user_db', JSON.stringify(userRegisterDTO));

    alert("Cadastro realizado com sucesso! Agora faça login.");
    
    // 6. Redireciona para a tela de login
    window.location.href = '../models/login.html'; 
});

function togglePassword(id) {
            const input = document.getElementById(id);
            const icon = document.getElementById(`eye-icon-${id}`);
            if (input.type === 'password') {
                input.type = 'text';
                icon.innerHTML = '<path d="M9.88 9.88L14.12 14.12M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7ZM1 1l22 22"/>'; // Ícone EyeOff simplificado
            } else {
                input.type = 'password';
                icon.innerHTML = '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'; // Ícone Eye
            }
        }