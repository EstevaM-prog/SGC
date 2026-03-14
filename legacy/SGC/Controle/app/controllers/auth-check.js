function verificarSessao() {
    const rawData = localStorage.getItem('active_session');

    // IMPORTANTE: Verifica se já estamos na página de login para não redirecionar
    const naPaginaLogin = window.location.pathname.includes('index.html') || 
                          window.location.pathname.endsWith('/');

    if (!rawData) {
        if (!naPaginaLogin) {
            window.location.href = 'index.html'; // Só redireciona se NÃO estiver no login
        }
        return;
    }

    const sessao = JSON.parse(rawData);
    const agora = Date.now();

    if (agora > sessao.expiresAt) {
        localStorage.removeItem('active_session');
        if (!naPaginaLogin) {
            alert("Sessão expirada!");
            window.location.href = 'index.html';
        }
    }
}

function verificarSessao() {
    const rawData = localStorage.getItem('active_session');
    
    // Captura o nome do arquivo atual (ex: login.html ou index.html)
    const paginaAtual = window.location.pathname.split("/").pop();

    // Se não houver nada salvo
    if (!rawData) {
        // SÓ redireciona se NÃO estiver na página de login
        if (paginaAtual !== 'login.html' && paginaAtual !== 'index.html') {
            window.location.href = 'login.html';
        }
        return;
    }

    const sessao = JSON.parse(rawData);
    const agora = new Date().getTime();

    if (agora > sessao.expiresAt) {
        alert("Sua sessão expirou (3 dias). Faça login novamente.");
        localStorage.removeItem('active_session');
        window.location.href = 'login.html';
    } 
    // Se a sessão for VÁLIDA e ele tentar entrar no login, manda pro sistema
    else if (paginaAtual === 'login.html' || paginaAtual === 'index.html') {
        window.location.href = '../models/sgc.html';
    }
}