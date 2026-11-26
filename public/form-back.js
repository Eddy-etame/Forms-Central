// The "back" link of the plain answers of /api/submit (a form posted without
// JavaScript on the site it came from): return to the form as it was left,
// with what was typed. Where scripts are off the link does nothing, and the
// browser's own back button does the same job.
document.addEventListener('click', function (event) {
  var link = event.target && event.target.closest ? event.target.closest('a[data-back]') : null;
  if (!link || window.history.length < 2) return;
  event.preventDefault();
  window.history.back();
});
