document.addEventListener('DOMContentLoaded', function () {
    // Assuming your buttons have unique identifiers like id or data attributes
    const manageButtons = document.querySelectorAll('.btn-manage');
  
    manageButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Determine which modal to show based on button clicked
        // This could be data attributes like 'data-modal-type="purchase"'
        const modalType = this.getAttribute('data-modal-type');
        // Call the function to load the modal with the appropriate type
        showModal(modalType);
      });
    });
  });
  
  function showModal(modalType) {
    // Get the modal content from Handlebars template
    // Assume we have a function to compile template and pass the context
    const context = { /* Your data context */ };
    const html = compileTemplate(modalType, context);
  
    // Now insert the HTML into the modal's body and show the modal
    const modalBody = document.querySelector('#actionModal .modal-body');
    modalBody.innerHTML = html;
    // Use Bootstrap's modal method to show it
    $('#actionModal').modal('show');
  }
  
  function compileTemplate(templateName, context) {
    // Fetch the template from the DOM
    const templateSource = document.getElementById(templateName + '-template').innerHTML;
    // Compile it with Handlebars
    const template = Handlebars.compile(templateSource);
    // Return the compiled HTML
    return template(context);
  }
  