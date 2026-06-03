document.addEventListener("DOMContentLoaded", () => {
  initCinematicEntrance();
  initParticles();
  initScrollNavbar();
  initPaginationAnimations();

  // If user is already logged in, we should hide the login btn and show user info
  if (localStorage.getItem("cognito_id_token")) {
      const loginBtn = document.getElementById("loginBtn");
      const userInfo = document.getElementById("userInfo");
      if (loginBtn) loginBtn.style.display = "none";
      if (userInfo) userInfo.style.display = "flex";
  }

  document
    .getElementById("logoutBtn")
    ?.addEventListener("click", logout);

  handleLoginCallback();
});
