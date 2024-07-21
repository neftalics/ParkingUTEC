<script>
    import {
      Collapse,
      NavbarToggler,
      NavbarBrand,
      Nav,
      Navbar,
      Image,
      Dropdown,
      DropdownToggle,
      DropdownMenu,
      DropdownItem
    } from '@sveltestrap/sveltestrap';
  
    let isOpen = false;
  
    function handleUpdate(event) {
      isOpen = event.detail.isOpen;
    }

    import { onMount, onDestroy } from 'svelte';
    import { initializeAuth, currentUser, handleLogout, resetTimeout } from '../../lib/login';
    import { monitorUserActivity } from '../../lib/timeout';
    import { goto } from '$app/navigation';

    let userData;
    let stopMonitoring;

    onMount(() => {
        // Asegúrate de que el código solo se ejecute en el cliente
        if (typeof window !== 'undefined') {
            const unsubscribeAuth = initializeAuth();
            const storedUser = JSON.parse(localStorage.getItem('user'));

            if (!storedUser) {
                // Redirige al login si no hay usuario almacenado
                goto('/Login');
            } else {
                // Establece los datos del usuario y inicia el monitoreo de actividad
                userData = storedUser;
                currentUser.set(storedUser);
                resetTimeout();
                stopMonitoring = monitorUserActivity();
            }

            return () => {
                unsubscribeAuth();
                if (stopMonitoring) {
                    stopMonitoring();
                }
            };
        }
    });

    onDestroy(() => {
        if (stopMonitoring) {
            stopMonitoring();
        }
    });
</script>

{#if userData}
<Navbar color="blue" light expand="md" container="xxl" style="box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <NavbarBrand href="/Home">
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <Image src="src/lib/images/logo_UTEC.png" width="40" height="40" alt="Profile Picture"/>
    </NavbarBrand>
    <NavbarToggler on:click={() => (isOpen = !isOpen)} />
    <Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
        <Nav class="ms-auto" navbar>
        <Dropdown nav inNavbar>
            <DropdownToggle nav caret>
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <Image src={userData.photoURL} class="rounded-circle" width="40" height="40" alt="Profile Picture"/>
            </DropdownToggle>
            <DropdownMenu end>
            <DropdownItem on:click={handleLogout}>Cerrar Sesión</DropdownItem>
            </DropdownMenu>
        </Dropdown>
        </Nav>
    </Collapse>
</Navbar>

<div class="container mt-2">
    <slot/>
</div>
{/if}
