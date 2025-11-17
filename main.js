document.addEventListener('DOMContentLoaded', () => {
    // 1. Referencias a elementos del DOM (adaptadas para el index.html)
    const loginForm = document.querySelector('form'); 
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');


    // --- Data Store (Simulación para la tabla del Admin) ---

    // Definición del Admin Principal para la lógica de redirección
    const defaultUsers = [
        { 
            username: 'admin@geincos.com', 
            password: 'admin123', 
            role: 'admin', 
            fullName: 'Administrador Principal',
            dni: '00000000',
            status: 'Activo'
        },
        { 
            username: 'clara@geincos.com', 
            password: '12345678', 
            role: 'user', 
            fullName: 'Clara López',
            dni: '45678901',
            status: 'Activo'
        }
    ];

    // Cargar usuarios registrados desde localStorage o usar los por defecto
    let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

    // Combinar usuarios para la búsqueda interna
    let allUsers = [...defaultUsers];
    const defaultUsernames = defaultUsers.map(u => u.username);

    registeredUsers.forEach(user => {
        if (!defaultUsernames.includes(user.username)) {
            // Aseguramos que el username registrado se trate como email para Supabase
            const userEmail = user.username.includes('@') ? user.username : `${user.username}@geincos.com`;
            allUsers.push({
                ...user,
                username: userEmail
            });
        }
    });

    // --- Lógica de Autenticación (Login) ---

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // CRÍTICO: Previene la recarga del formulario

        const email = usernameInput.value.trim(); 
        const password = passwordInput.value.trim();
        
        if (email === '' || password === '') {
            alert('Por favor, ingresa tu usuario y contraseña.');
            return;
        }

        try {
            // 1. Validar contra Supabase Auth (Asíncrono)
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Error de Supabase:', error);
                alert(`❌ Error al iniciar sesión: ${error.message || 'Credenciales inválidas.'}`);
                return;
            }
            
            // 2. Determinar Rol y Redirección
            const user = data.user;
            const isAdmin = user.email === 'admin@geincos.com'; 

            // Guardar info del usuario (simulación de sesión)
            localStorage.setItem('lastLoggedInUser', JSON.stringify({ 
                username: user.email, 
                role: isAdmin ? 'admin' : 'user',
                fullName: user.user_metadata.full_name || user.email 
            }));

            if (isAdmin) {
                alert('✅ Ingreso exitoso como Administrador Principal.');
                window.location.href = 'dashboard.html';
            } else {
                alert('✅ Ingreso exitoso como Usuario. ¡Bienvenido al Portal!');
                window.location.href = 'portal.html';
            }

        } catch (error) {
             // Esto captura errores si la conexión con Supabase falló completamente
             console.error('Error de conexión general:', error);
             alert('🛑 Fallo de conexión: No se pudo contactar al servidor de autenticación. Revisa tu consola.');
        }
    });

    // Nota: La lógica de registro se maneja en registro.js
});