 function show_hide_password(target) {
      var password = document.getElementById("password");
      if (password.getAttribute("type") == "password") {
        password.setAttribute("type", "text");
        target.classList.add("view");
      } else {
        password.setAttribute("type", "password");
        target.classList.remove("view");
      }
      return false;
    }