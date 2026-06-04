document.addEventListener("DOMContentLoaded", () => {
  initCinematicEntrance();
  initParticles();
  initScrollNavbar();
  initPaginationAnimations();

  // If user is already logged in, automatically bypass the auth screen
  const idToken = localStorage.getItem("cognito_id_token");
  if (idToken) {
      if (idToken === "admin_mock_token") {
          selectRole("admin");
      } else {
          selectRole("customer");
      }
      
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
