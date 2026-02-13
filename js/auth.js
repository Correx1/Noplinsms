document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const roleSelect = document.getElementById('role');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');
    const eyeSlashIcon = document.getElementById('eyeSlashIcon');

    // Toggle Password Visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icons
            if (type === 'text') {
                eyeIcon.classList.add('hidden');
                eyeSlashIcon.classList.remove('hidden');
            } else {
                eyeIcon.classList.remove('hidden');
                eyeSlashIcon.classList.add('hidden');
            }
        });
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const role = roleSelect.value;
        const remember = document.getElementById('remember').checked;

        // Basic Validation
        if (!username) {
            alert('Please enter your username');
            return;
        }
        if (!password) {
            alert('Please enter your password');
            return;
        }
        if (!role) {
            alert('Please select a role');
            return;
        }

        // Mock Login Logic
        console.log(`Attempting login: User=${username}, Role=${role}, Remember=${remember}`);
        
        // Simulate API call delay
        const button = loginForm.querySelector('button[type="submit"]');
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Signing in...';
        button.disabled = true;

        setTimeout(() => {
            // Successful Login Simulation
            localStorage.setItem('userRole', role);
            localStorage.setItem('isLoggedIn', 'true'); // Auth token simulation

            if (remember) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('savedUsername', username);
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('savedUsername');
            }

            alert(`Login Successful as ${role}! Redirecting...`);
            
            // Reset button
            button.innerHTML = originalContent;
            button.disabled = false;

            // Redirect to Admin Dashboard
            window.location.href = 'pages/admin/dashboard.html'; 
        }, 1000);
    });

    // Load saved username if Remember Me was checked
    if (localStorage.getItem('rememberMe') === 'true') {
        const savedUser = localStorage.getItem('savedUsername');
        if (savedUser) {
            usernameInput.value = savedUser;
            document.getElementById('remember').checked = true;
        }
    }
});
