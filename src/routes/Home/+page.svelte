<script>
  import Busy from './Busy.svelte';
  import Free from './Free.svelte';
  import Pending from './Pending.svelte';
  import Circle from './Circle.svelte';
  import { 
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Input,
    Label,
    FormGroup,
    Container,
    Row,
    Col
  } from '@sveltestrap/sveltestrap';
  import { onMount } from 'svelte';
  import { db } from '../../lib/firebase';
  import { collection, doc, onSnapshot, updateDoc, getDoc, query, where, getDocs } from "firebase/firestore";

  let open = false;
  const stateComponents = {
    Free: Free,
    Busy: Busy,
    Pending: Pending
  };
  let tempState = "Free";
  let parkingSlots = [];
  let selectedIndex = 0;
  let carPlate = '';
  let errorMessage = '';
  let additionalInfo = {};  // Para almacenar la información adicional del parking
  let isActive = false;

  onMount(() => {
    const unsubscribe = onSnapshot(collection(db, "Slots"), (snapshot) => {
      parkingSlots = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });

    return () => unsubscribe();
  });

  async function modalState(index) {
    selectedIndex = index;
    const slot = parkingSlots[index];
    tempState = slot.state;

    // Cambia el estado a "Pending" al abrir el modal
    if (tempState !== "Pending") {
      updateState(index, "Pending");
    }

    // Obtener la placa del slot
    carPlate = slot.car;

    // Obtener la información adicional del parking
    if (carPlate) {
      const parkingDocRef = doc(db, "parking", carPlate);
      const parkingDocSnap = await getDoc(parkingDocRef);

      if (parkingDocSnap.exists()) {
        additionalInfo = parkingDocSnap.data();
      } else {
        additionalInfo = {};  // No se encontró información
      }
    }

    // Verificar si el slot está activo o no
    isActive = slot.state === "Busy";

    open = true;
  }

  const toggle = () => {
    if (open) {
      // Restablece el error y el valor del input cuando se cierra el modal
      carPlate = '';
      errorMessage = '';
      isActive = false;
      // Cambia el estado de vuelta al original al cerrar el modal
      if (tempState !== "Pending") {
        updateState(selectedIndex, tempState);
      }
    }
    open = !open;
  };

  async function handleRegister() {
    // Sanitizar y validar input
    const sanitizedPlate = sanitizeCarPlate(carPlate);
    if (!sanitizedPlate) {
      errorMessage = 'Formato de placa no válido';
      return;
    }

    // Verificar si el auto ya está usando un slot
    const slotQuery = query(collection(db, "Slots"), where("car", "==", sanitizedPlate));
    const querySnapshot = await getDocs(slotQuery);

    if (!querySnapshot.empty) {
      errorMessage = 'Este auto ya está usando un slot';
      return;
    }

    // Obtener el slot seleccionado
    const slot = parkingSlots[selectedIndex];

    if (tempState === "Free") {
      // Registrar auto en slot libre
      await updateDoc(doc(db, "Slots", slot.id), { state: "Busy", car: sanitizedPlate });
      isActive = true;  // Actualizar el estado del Circle
      open = false;
    }
  }

  async function handleRelease() {
    // Obtener el slot seleccionado
    const slot = parkingSlots[selectedIndex];

    if (tempState === "Busy") {
      // Liberar el slot
      await updateDoc(doc(db, "Slots", slot.id), { state: "Free", car: "" });
      isActive = false;  // Actualizar el estado del Circle
      open = false;
    }
  }

  function sanitizeCarPlate(input) {
    // Verifica si el input tiene 6 caracteres entre números y letras y sanitiza
    const match = input.match(/^[a-zA-Z0-9]{6}$/);
    if (match) {
      // Formatea el input y convierte a minúsculas
      return `${match[0].slice(0, 3).toLowerCase()}-${match[0].slice(3).toLowerCase()}`;
    }
    return null;
  }

  async function updateState(index, newState) {
    const docRef = doc(db, "Slots", parkingSlots[index].id);
    await updateDoc(docRef, { state: newState });
  }

  // Asegúrate de pasar la prop onClick a cada componente
  function handleComponentClick(index) {
    modalState(index);
  }

</script>

<main class="d-flex justify-content-center align-items-center vh-100">
  <Container class="d-flex align-items-center justify-content-center">
    <Row style="overflow-x: auto; white-space: nowrap; display: flex; flex-wrap: nowrap;">
      {#each parkingSlots as { id, state }, index}
        <Col xs="auto" key={id}>
          <svelte:component  
            this={stateComponents[state]} 
            onClick={() => handleComponentClick(index)}
          />
        </Col>
      {/each}
    </Row>
  </Container>

  <Modal isOpen={open} toggle={toggle}>
    <ModalHeader toggle={toggle}>
      Estacionamiento P01
      <Circle isActive={isActive}></Circle>
    </ModalHeader>
    {#if tempState === "Free"}
      <ModalBody>
        <FormGroup floating>
          <Input 
            id="carplate" 
            name="carplate" 
            bind:value={carPlate} 
            placeholder="Ej: x1t079" 
            invalid={errorMessage !== ''}
          />
          <Label for="carplate">Ingresar N° placa</Label>
          {#if errorMessage}
            <div class="text-danger">{errorMessage}</div>
          {/if}
        </FormGroup>
      </ModalBody>
    {:else if tempState === "Pending"}
      <ModalBody>
        <svelte:component this={stateComponents["Pending"]} />
      </ModalBody>
    {:else}
      <ModalBody>
        <div class="d-flex justify-content-center">
          <div>
            <p>Placa: {carPlate}</p>
            <p>Nombre: {additionalInfo.Name || 'No disponible'}</p>
            <p>Código de estudiante: {additionalInfo.Code || 'No disponible'}</p>
            <p>Correo: {additionalInfo.Email || 'No disponible'}</p>
          </div>
        </div>
      </ModalBody>
    {/if}
    <ModalFooter class="d-flex justify-content-between">
      <Button color="secondary" on:click={toggle}>Cancel</Button>
      {#if isActive}
        <Button color="danger" on:click={handleRelease}>Liberar</Button>
      {:else}
        <Button color="primary" on:click={handleRegister}>Registrar</Button>
      {/if}
    </ModalFooter>
  </Modal>
</main>

<style>
  :global(svg) {
    display: block;
  }
</style>
