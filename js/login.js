async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    errorMsg.textContent = '';

    if (!email || !password) {
        errorMsg.textContent = 'Please enter email and password!';
        return;
    }

    try {
        const users = await fetchData('User');
        const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            errorMsg.textContent = '❌ Email not found!';
            return;
        }

        // ✅ hashPassword comes from api.js
        const hashedPassword = await hashPassword(password);

        if (user.password !== hashedPassword) {
            errorMsg.textContent = '❌ Wrong password!';
            return;
        }

        if (user.status === 'Pending') {
            errorMsg.textContent = '⏳ Your account is pending Admin approval!';
            return;
        }
        if (user.status === 'Rejected') {
            errorMsg.textContent = '❌ Your account has been rejected. Contact Admin.';
            return;
        }
        if (user.status === 'Inactive') {
            errorMsg.textContent = '⚠️ Your account is inactive. Contact Admin.';
            return;
        }

        localStorage.setItem('user', JSON.stringify(user));

        if (user.roleId === 1) {
            window.location.href = 'admin/admin_dashboard.html';
        } else {
            window.location.href = 'user/user_dashboard.html';
        }

    } catch(error) {
        console.error('Login error:', error);
        errorMsg.textContent = 'Connection error. Please try again.';
    }
}

document.addEventListener('keypress', e => e.key === 'Enter' && login());
document.getElementById('email').focus();