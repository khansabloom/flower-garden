function updateClock(){
  const now = new Date();
  const time = now.toLocaleTimeString('id-ID', {
    hour:'2-digit', minute:'2-digit', second:'2-digit'
  });
  const date = now.toLocaleDateString('id-ID', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });
  document.getElementById('clock').textContent = time;
  document.getElementById('date').textContent = date;
}
updateClock();
setInterval(updateClock, 1000);
