document.addEventListener('DOMContentLoaded', () => {
    // NOTA: 'supabase' está definido en registro.html

    const registrationForm = document.getElementById('registration-form');
    
    if (!registrationForm) return;

    registrationForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const name = document.getElementById('nombre').value.trim();
        const dni = document.getElementById('dni').value.trim();
        const usuario = document.getElementById('usuario').value.trim();
        const password = document.getElementById('password').value;

        // Validaciones locales
        const dniRegex = /^\d{8}$/;
        if (!dniRegex.test(dni)) {
            alert('❌ Error: El DNI debe ser numérico y contener exactamente 8 dígitos.');
            return;
        }
        if (password.length < 8) {
            alert('❌ Error: La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        // 1. REGISTRO REAL con Supabase Auth
        const emailToRegister = `${usuario}@geincos.com`; // Simular un email único para Supabase

        const { data, error } = await supabase.auth.signUp({
            email: emailToRegister,
            password: password,
            options: {
                data: { 
                    full_name: name,
                    dni: dni,
                    role: 'user' // Asignar rol
                }
            }
        });

        if (error) {
             // Este error ocurre si el usuario/email ya existe en Supabase
             console.error('Error de registro:', error);
             alert(`🛑 Error al registrar: ${error.message}. (El usuario '${usuario}' ya existe o la contraseña es muy débil).`);
             return;
        }

        // 2. Simulación de guardar el nuevo usuario localmente para la tabla del Admin (opcional)
        // Esto solo es necesario si queremos que aparezca inmediatamente en la lista local del Admin
        let onlyRegisteredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        onlyRegisteredUsers.push({
            id: data.user.id, // Usar el ID real de Supabase
            fullName: name,
            username: usuario,
            dni: dni,
            password: password,
            status: 'Activo',
            role: 'user'
        });
        localStorage.setItem('registeredUsers', JSON.stringify(onlyRegisteredUsers));

        // 3. Redirección
        alert(`🎉 ¡Registro exitoso para ${name}!\nTu usuario (email: ${emailToRegister}) ha sido creado.\nAhora ingresa con tu nueva cuenta.`);
        
        window.location.href = 'index.html';
    });
});