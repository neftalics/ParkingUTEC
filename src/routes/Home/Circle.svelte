<script>
    export let isActive = false;
  </script>
  
  <style>
    .circle {
      width: 15px;
      height: 15px;
      border-radius: 50%;
      transition: background-color 0.3s ease;
      display: inline-block
    }
    .active {
      background-color: green;
    }
    .inactive {
      background-color: red;
    }
  </style>
  
  <div class="circle {isActive ? 'inactive':'active'}"></div>