function handleClick(pid) {
    window.location.href = `/load-game?pid=${pid}`;
  }

  function handleKeyDown(event) {
    // trigger a click upon pressing Enter or Spacebar
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); // prevent scrolling for Spacebar
      handleClick();
    }
  }