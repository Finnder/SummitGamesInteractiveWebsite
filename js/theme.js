/*
 * Light/dark theme toggle.
 * Load this in <head> (synchronously) so the theme applies before first paint.
 * Dark is the default; the choice is remembered in localStorage.
 */

(function () {
  try {
    if (localStorage.getItem("theme") === "light") {
      document.documentElement.classList.add("light");
    }
  } catch (e) {}
})();

function applyThemeExtras() {
  const light = document.documentElement.classList.contains("light");

  // The white logo is invisible on a light background — swap in the blue one.
  document.querySelectorAll(".site-logo img").forEach((img) => {
    img.src = light ? "assets/summit1-blue.png" : "assets/summit1-final.png";
  });

  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.textContent = light ? "☾" : "☀"; /* moon / sun */
    btn.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
  }
}

function toggleTheme() {
  const light = document.documentElement.classList.toggle("light");
  try {
    localStorage.setItem("theme", light ? "light" : "dark");
  } catch (e) {}
  applyThemeExtras();
}

document.addEventListener("DOMContentLoaded", applyThemeExtras);
