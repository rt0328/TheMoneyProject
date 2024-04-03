function initializeEventModal() {
    // @TODO: Create a modal using JS. The id will be `event-modal`:
    // Reference: https://getbootstrap.com/docs/5.3/components/modal/#via-javascript
    EVENT_MODAL = new bootstrap.Modal(document.getElementById('event-modal'));
  }


  function openEventModal({ id, day }) {
    // Since we will be reusing the same modal for both creating and updating events,
    // we're creating variables to reference the title of the modal and the submit button
    // in javascript so we can update the text suitably
    const submit_button = document.querySelector("#submit_button");
    const modal_title = document.querySelector(".modal-title");
  
    // Check if the event exists in the CALENDAR_EVENTS by using `id`
    // Note that on the first try, when you attempt to access an event that does not exist
    // an event will be added to the list. This is expected.
    let event = CALENDAR_EVENTS[id];
  
    // If event is undefined, i.e it does not exist in the CALENDAR_EVENTS, then we create a new event.
    // Else, we load the current event into the modal.
    if (!event) {
      event = {
        name: "",
        day: day,
        time: "",
        modality: "",
        location: "",
        url: "",
        attendees: "",
      };
  
      // @TODO: Update the innerHTML for modalTitle and submitButton
      // Replace <> with the correct attribute
      /*
      modal_title.<modal-title> = "Create Event";
      submit_button.<submit_button> = "Create Event";
      */
      // Allocate a new event id. Note that nothing is inserted into the CALENDAR_EVENTS yet.
      // @TODO: Set the id to be the length of the CALENDAR_EVENTS because we are adding a new element
  
  
    } else {
      // We will default to "Update Event" as the text for the title and the submit button
      modal_title.innerHTML = "Update Event";
      submit_button.innerHTML = "Update Event";
    }
  
    // Once the event is fetched/created, populate the modal.
    // Use document.querySelector('<>').value to get the form elements. Replace <>
    // Hint: If it is a new event, the fields in the modal will be empty.
    document.querySelector("#event_name").value = event.name;
    // @TODO: Update remaining form fields of the modal with suitable values from the event.
  
  
    // Location options depend on the event modality
    // @TODO: pass event.modality as an argument to the updateLocationOptions() function. Replace <> with event.modality.
    updateLocationOptions();
  
    // Set the "action" event for the form to call the updateEventFromModal
    // when the form is submitted by clicking on the "Creat/Update Event" button
    const form = document.querySelector("#event-modal form");
    form.setAttribute("action", `javascript:updateEventFromModal(${id})`);
  
    EVENT_MODAL.show();
  }

  
  function updateLocationOptions(modality_value) {
    // @TODO: get the "Location" and "Remote URL" HTML elements from the modal.
    // Use document.querySelector() or document.getElementById().
    const location =  document.querySelector("event_location");
    const remoteUrl = document.querySelector("event_remote_url");
  
    // @TODO: Depending on the "value" change the visibility style of these fields on the modal.
    // Use conditional statements.
    if (modality_value == "in-person") {
      
    }
    
  }