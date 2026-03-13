const loginForm = document.querySelector('form');

loginForm.addEventListener('submit', (event) => {
    event.preventDefault(); 
    console.log("Formulário enviado!"); // Se isso aparecer no F12, o botão está OK

    // AJUSTE AQUI: O ID no seu HTML é 'email'
    const typedEmail = document.getElementById('email').value; 
    const typedPass = document.getElementById('password').value;

    let registeredUser = null;
    try {
        registeredUser = JSON.parse(localStorage.getItem('user_db'));
    } catch (e) {
        console.error("Erro ao ler banco de dados local", e);
    }

    if (!registeredUser) {
        alert("Nenhum usuário registrado! Vá para a página de cadastro.");
        return;
    }

    // Comparação usando o e-mail que é o ID do seu campo
    if (typedEmail === registeredUser.email && typedPass === registeredUser.password) {
        const agora = Date.now();
        const tresDiasEmMs = 3 * 24 * 60 * 60 * 1000;

        const sessionDTO = {
            username: registeredUser.username,
            email: registeredUser.email,
            loginDate: agora,
            expiresAt: agora + tresDiasEmMs
        };

        localStorage.setItem('active_session', JSON.stringify(sessionDTO));
        
        alert("Welcome back, " + sessionDTO.username);
        window.location.href = '../models/sgc.html'; 
    } else {
        alert("E-mail ou senha incorretos!");
    }
});