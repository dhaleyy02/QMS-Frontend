async function loadDepartments() {
    const select = document.getElementById('department');
    try {
        const depts = await fetchData('Department');
        select.innerHTML = '<option value="">-- Select Department --</option>' +
            depts.map(d => `<option value="${d.departmentId}">${d.departmentName}</option>`).join('');
    } catch(e) {
        console.error('Failed to load departments:', e);
        select.innerHTML = '<option value="">Error loading departments</option>';
    }
}

async function register() {
    const fullName = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const departmentId = parseInt(document.getElementById('department').value);
    const errorMsg = document.getElementById('error-msg');
    const successMsg = document.getElementById('success-msg');

    errorMsg.textContent = '';
    successMsg.textContent = '';

    if (!fullName || !email || !password || !departmentId) {
        errorMsg.textContent = 'Please fill in all fields!';
        return;
    }

    try {
        const users = await fetchData('User');
        if (users.find(u => u.email?.toLowerCase() === email.toLowerCase())) {
            errorMsg.textContent = 'Email already exists!';
            return;
        }

        // ✅ hashPassword comes from api.js
        const hashedPassword = await hashPassword(password);

        await postData('User', {
            fullName,
            email,
            password: hashedPassword,
            roleId: 2,
            departmentId,
            status: 'Pending'
        });

        successMsg.textContent = '✅ Account created! Please wait for Admin approval.';
        setTimeout(() => window.location.href = 'login.html', 3000);

    } catch(e) {
        console.error('Register error:', e);
        errorMsg.textContent = 'Registration failed. Please try again.';
    }
}

loadDepartments();
document.addEventListener('keypress', e => e.key === 'Enter' && register());
document.getElementById('fullname').focus();