const userDTO = {
    username: "admin",
    email: "admin@admin.com",
    password: "minha_senha_super_secreta", // Salvo como string
    expiresAt: Date.now() + (3 * 24 * 60 * 60 * 1000)
};

// Salvando
localStorage.setItem('user_auth', JSON.stringify(userDTO));

const userSessionDTO = {
    username: "seu_nome",
    email: "seu@email.com",
    // Em vez da senha pura, guardamos um "hash" ou apenas validamos no login
    lastLogin: Date.now(),
    expiresAt: Date.now() + (3 * 24 * 60 * 60 * 1000)
};

localStorage.setItem('user_session', JSON.stringify(userDTO));

const saveData = localStorage.getItem('user_session');

if (saveData) {
  const userDto = JSON.parse(saveData)
  console.log(userDto.name);
}

const sessionDTO = {
  user: userDTO,
  expiresAt: Date.now() + (3 * 24 * 60 * 60 * 1000),
  version: "1.0"
}

localStorage.setItem('auth_storage', JSON.stringify(sessionData))