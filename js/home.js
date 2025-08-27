function handleLogin(role) {
    // Store the selected role in sessionStorage
    sessionStorage.setItem('selectedRole', role);
    window.location.href = `/signin`;
}

window.handleLogin = handleLogin;